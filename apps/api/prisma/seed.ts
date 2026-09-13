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

  // eslint-disable-next-line no-console
  console.log('Seeded SiteSettings and SUPER_ADMIN');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
