import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCategoryDto,
  CreateProductDto,
  ListProductsQueryDto,
  UpdateCategoryDto,
  UpdateProductDto,
} from './dto/catalog.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  listCategories(publicOnly = true) {
    return this.prisma.category.findMany({
      where: {
        deletedAt: null,
        ...(publicOnly ? { isPublished: true } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { nameEn: 'asc' }],
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    await this.ensureCategory(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async softDeleteCategory(id: string) {
    await this.ensureCategory(id);
    return this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), isPublished: false },
    });
  }

  async listProducts(query: ListProductsQueryDto, publicOnly = true) {
    const page = Number(query.page ?? 1);
    const pageSize = Math.min(Number(query.pageSize ?? 20), 100);

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(publicOnly ? { isPublished: true } : {}),
      ...(query.categorySlug
        ? { category: { slug: query.categorySlug, deletedAt: null } }
        : {}),
      ...(query.search
        ? {
            OR: [
              { nameEn: { contains: query.search, mode: 'insensitive' } },
              { nameFa: { contains: query.search, mode: 'insensitive' } },
              { nameDe: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, slug: true, nameEn: true, nameFa: true, nameDe: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async getProductBySlug(slug: string, publicOnly = true) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(publicOnly ? { isPublished: true } : {}),
      },
      include: {
        category: {
          select: { id: true, slug: true, nameEn: true, nameFa: true, nameDe: true },
        },
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createProduct(dto: CreateProductDto) {
    await this.ensureCategory(dto.categoryId);
    return this.prisma.product.create({
      data: {
        ...dto,
        imageUrls: dto.imageUrls ?? [],
      },
    });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.ensureProduct(id);
    if (dto.categoryId) {
      await this.ensureCategory(dto.categoryId);
    }
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async softDeleteProduct(id: string) {
    await this.ensureProduct(id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isPublished: false },
    });
  }

  private async ensureCategory(id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  private async ensureProduct(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
