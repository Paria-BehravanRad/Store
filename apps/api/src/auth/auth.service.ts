import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomInt } from 'crypto';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SMS_PROVIDER, SmsProvider } from '../sms/sms.provider';
import { AccessTokenPayload } from './auth.types';

const OTP_TTL_SECONDS = 300;
const OTP_MAX_ATTEMPTS = 5;
const PHONE_RATE_LIMIT = 5;
const PHONE_RATE_WINDOW = 3600;
const IP_RATE_LIMIT = 20;
const IP_RATE_WINDOW = 3600;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @Inject(SMS_PROVIDER) private readonly sms: SmsProvider,
  ) {}

  async requestOtp(phone: string, ip: string) {
    await this.enforceRateLimit(`otp:phone:${phone}`, PHONE_RATE_LIMIT, PHONE_RATE_WINDOW);
    await this.enforceRateLimit(`otp:ip:${ip}`, IP_RATE_LIMIT, IP_RATE_WINDOW);

    const code = randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);

    await this.prisma.otpChallenge.updateMany({
      where: { phone, consumed: false },
      data: { consumed: true },
    });

    await this.prisma.otpChallenge.create({
      data: {
        phone,
        codeHash,
        expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
      },
    });

    await this.sms.sendOtp(phone, code);

    return {
      ok: true,
      expiresInSeconds: OTP_TTL_SECONDS,
      ...(this.config.get('SMS_PROVIDER') === 'mock' || !this.config.get('SMS_PROVIDER')
        ? { debugCode: code }
        : {}),
    };
  }

  async verifyOtp(phone: string, code: string, res: Response) {
    const challenge = await this.prisma.otpChallenge.findFirst({
      where: { phone, consumed: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge || challenge.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('OTP expired or not found');
    }

    if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
      throw new HttpException('Too many OTP attempts', HttpStatus.TOO_MANY_REQUESTS);
    }

    const valid = await bcrypt.compare(code, challenge.codeHash);
    if (!valid) {
      await this.prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumed: true },
    });

    const user = await this.prisma.user.upsert({
      where: { phone },
      create: { phone },
      update: {},
    });

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    await this.issueSession(user.id, user.role, user.phone, res);

    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      preferredLocale: user.preferredLocale,
    };
  }

  async refresh(refreshToken: string | undefined, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
    if (!stored || !stored.user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    await this.issueSession(stored.user.id, stored.user.role, stored.user.phone, res);

    return {
      id: stored.user.id,
      phone: stored.user.phone,
      role: stored.user.role,
      preferredLocale: stored.user.preferredLocale,
    };
  }

  async logout(userId: string, res: Response) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    this.clearCookies(res);
    return { ok: true };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      preferredLocale: user.preferredLocale,
      isActive: user.isActive,
    };
  }

  private async issueSession(
    userId: string,
    role: AccessTokenPayload['role'],
    phone: string,
    res: Response,
  ) {
    const accessPayload: AccessTokenPayload = { sub: userId, role, phone };
    const accessToken = await this.jwt.signAsync(accessPayload, {
      secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_TTL') ?? '15m',
    });

    const refreshToken = await this.jwt.signAsync(
      { sub: userId },
      {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_TTL') ?? '7d',
      },
    );

    const refreshTtlMs = 7 * 24 * 60 * 60 * 1000;
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshTtlMs),
      },
    });

    const secure = this.config.get('COOKIE_SECURE') === 'true';
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: refreshTtlMs,
    });
  }

  private clearCookies(res: Response) {
    const secure = this.config.get('COOKIE_SECURE') === 'true';
    res.clearCookie('access_token', { path: '/', sameSite: 'lax', secure });
    res.clearCookie('refresh_token', { path: '/', sameSite: 'lax', secure });
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async enforceRateLimit(key: string, limit: number, windowSeconds: number) {
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, windowSeconds);
    }
    if (count > limit) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
