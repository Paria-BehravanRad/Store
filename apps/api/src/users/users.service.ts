import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Locale, Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListUsersQueryDto, UpdateUserAdminDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListUsersQueryDto) {
    const page = Number(query.page ?? 1);
    const pageSize = Math.min(Number(query.pageSize ?? 20), 100);
    const where = query.search
      ? { phone: { contains: query.search } }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          phone: true,
          role: true,
          preferredLocale: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        role: true,
        preferredLocale: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateAdmin(actor: User, id: string, dto: UpdateUserAdminDto) {
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (target.role === Role.SUPER_ADMIN && actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can modify SUPER_ADMIN users');
    }

    if (dto.role === Role.SUPER_ADMIN && actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only SUPER_ADMIN can assign SUPER_ADMIN');
    }

    if (actor.id === id && dto.isActive === false) {
      throw new ForbiddenException('Cannot deactivate your own account');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        role: dto.role,
        isActive: dto.isActive,
        preferredLocale: dto.preferredLocale,
      },
      select: {
        id: true,
        phone: true,
        role: true,
        preferredLocale: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async updateMyLocale(userId: string, preferredLocale: Locale) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { preferredLocale },
      select: {
        id: true,
        phone: true,
        role: true,
        preferredLocale: true,
      },
    });
  }
}
