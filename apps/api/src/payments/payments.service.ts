import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { PAYMENT_GATEWAY, PaymentGateway } from './payment.gateway';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
  ) {}

  async initiate(userId: string, orderId: string, phone?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      throw new BadRequestException('Order is not payable');
    }

    const resNum = `VP-${Date.now()}-${randomUUID().slice(0, 8)}`;
    const callbackUrl =
      this.config.get<string>('SEP_CALLBACK_URL') ??
      'http://localhost:4000/api/payments/sep/callback';

    const tokenResult = await this.gateway.requestToken({
      amountRials: order.totalRials,
      resNum,
      redirectUrl: callbackUrl,
      cellNumber: phone,
    });

    const payment = await this.prisma.payment.create({
      data: {
        orderId: order.id,
        amountRials: order.totalRials,
        resNum,
        token: tokenResult.token,
        status: PaymentStatus.REDIRECTED,
        gatewayRaw: tokenResult.raw as object | undefined,
      },
    });

    const isMock = (this.config.get('PAYMENT_GATEWAY') ?? 'mock') === 'mock';

    return {
      paymentId: payment.id,
      resNum,
      token: tokenResult.token,
      redirectUrl: tokenResult.redirectUrl,
      method: isMock ? 'GET' : 'POST',
      fields: isMock ? undefined : { Token: tokenResult.token },
    };
  }

  async handleCallback(body: Record<string, string>) {
    const resNum = body.ResNum ?? body.resNum;
    const refNum = body.RefNum ?? body.refNum ?? body.Token;
    const state = (body.State ?? body.Status ?? '').toString();

    if (!resNum) {
      throw new BadRequestException('Missing ResNum');
    }

    const lockKey = `payment:callback:${resNum}`;
    const locked = await this.redis.client.set(lockKey, '1', 'EX', 60, 'NX');
    if (locked !== 'OK') {
      return { ok: true, message: 'Callback already processing' };
    }

    const payment = await this.prisma.payment.findUnique({
      where: { resNum },
      include: { order: true },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return { ok: true, orderId: payment.orderId, status: 'already_paid' };
    }

    const failed =
      state.toLowerCase().includes('fail') ||
      state === 'CanceledByUser' ||
      (!refNum && (this.config.get('PAYMENT_GATEWAY') ?? 'mock') !== 'mock');

    if (failed) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED, gatewayRaw: body },
      });
      return { ok: false, orderId: payment.orderId, status: 'failed' };
    }

    const effectiveRef = refNum ?? `MOCK-REF-${payment.id}`;
    const verify = await this.gateway.verify(effectiveRef);
    if (!verify.success) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED, refNum: effectiveRef, gatewayRaw: verify.raw as object },
      });
      return { ok: false, orderId: payment.orderId, status: 'verify_failed' };
    }

    if (verify.amountRials && verify.amountRials !== payment.amountRials) {
      if (this.gateway.reverse) {
        await this.gateway.reverse(effectiveRef);
      }
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.REVERSED, refNum: effectiveRef, gatewayRaw: verify.raw as object },
      });
      return { ok: false, orderId: payment.orderId, status: 'amount_mismatch' };
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
          refNum: effectiveRef,
          gatewayRaw: verify.raw as object,
        },
      }),
      this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PAID },
      }),
    ]);

    const webUrl = this.config.get('WEB_URL') ?? 'http://localhost:3000';
    return {
      ok: true,
      orderId: payment.orderId,
      status: 'paid',
      redirectTo: `${webUrl}/checkout/result?orderId=${payment.orderId}&status=paid`,
    };
  }
}
