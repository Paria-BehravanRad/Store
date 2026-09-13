import { PrismaClient, Locale } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      defaultLocale: Locale.en,
      storeName: 'ViraPlaza',
    },
    update: {},
  });

  const phone = process.env.SUPER_ADMIN_PHONE ?? '09120000000';
  await prisma.user.upsert({
    where: { phone },
    create: {
      phone,
      role: 'SUPER_ADMIN',
      preferredLocale: Locale.en,
    },
    update: {
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  const bracelets = await prisma.category.upsert({
    where: { slug: 'bracelets' },
    create: {
      slug: 'bracelets',
      nameEn: 'Bracelets',
      nameFa: 'دستبند',
      nameDe: 'Armbänder',
      description: 'Handcrafted bracelets',
      sortOrder: 1,
    },
    update: {},
  });

  const rings = await prisma.category.upsert({
    where: { slug: 'rings' },
    create: {
      slug: 'rings',
      nameEn: 'Rings',
      nameFa: 'انگشتر',
      nameDe: 'Ringe',
      description: 'Statement and everyday rings',
      sortOrder: 2,
    },
    update: {},
  });

  await prisma.product.upsert({
    where: { slug: 'aurora-bracelet' },
    create: {
      categoryId: bracelets.id,
      slug: 'aurora-bracelet',
      nameEn: 'Aurora Bracelet',
      nameFa: 'دستبند آرورا',
      nameDe: 'Aurora Armband',
      descriptionEn: 'Soft gold-tone links with a glass-like finish.',
      descriptionFa: 'حلقه‌های طلایی نرم با جلوه‌ای شیشه‌ای.',
      descriptionDe: 'Weiche goldfarbene Glieder mit glasähnlichem Finish.',
      priceRials: 2_450_000,
      stock: 40,
      imageUrls: ['/images/products/aurora-bracelet.jpg'],
    },
    update: {},
  });

  await prisma.product.upsert({
    where: { slug: 'luna-ring' },
    create: {
      categoryId: rings.id,
      slug: 'luna-ring',
      nameEn: 'Luna Ring',
      nameFa: 'انگشتر لونا',
      nameDe: 'Luna Ring',
      descriptionEn: 'Minimal band with a brushed silver profile.',
      descriptionFa: 'حلقه مینیمال با پروفایل نقره‌ای مات.',
      descriptionDe: 'Minimaler Ring mit gebürstetem Silberprofil.',
      priceRials: 1_890_000,
      stock: 55,
      imageUrls: ['/images/products/luna-ring.jpg'],
    },
    update: {},
  });

  // eslint-disable-next-line no-console
  console.log('Seeded SiteSettings, SUPER_ADMIN, sample catalog');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
