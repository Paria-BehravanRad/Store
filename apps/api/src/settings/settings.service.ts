import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { UpdateSettingsDto } from './dto/settings.dto';

const CACHE_KEY = 'site:settings:public';

@Injectable()
export class SettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getPublic() {
    const cached = await this.redis.get(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as { defaultLocale: string; storeName: string };
    }

    const settings = await this.prisma.siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1 },
      update: {},
    });

    const payload = {
      defaultLocale: settings.defaultLocale,
      storeName: settings.storeName,
    };
    await this.redis.set(CACHE_KEY, JSON.stringify(payload), 60);
    return payload;
  }

  async update(dto: UpdateSettingsDto) {
    const settings = await this.prisma.siteSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        defaultLocale: dto.defaultLocale ?? 'en',
        storeName: dto.storeName ?? 'ViraPlaza',
      },
      update: {
        defaultLocale: dto.defaultLocale,
        storeName: dto.storeName,
      },
    });
    await this.redis.del(CACHE_KEY);
    return {
      defaultLocale: settings.defaultLocale,
      storeName: settings.storeName,
      updatedAt: settings.updatedAt,
    };
  }
}
