import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const pong = await this.redis.client.ping();
      if (pong !== 'PONG') {
        throw new Error('Redis ping failed');
      }
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: { database: 'up', redis: 'up' },
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'degraded',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
