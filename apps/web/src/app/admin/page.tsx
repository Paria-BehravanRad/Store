import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function AdminHomePage() {
  const t = await getTranslations('admin');

  const cards = [
    { href: '/admin/users', label: t('users') },
    { href: '/admin/products', label: t('products') },
    { href: '/admin/orders', label: t('orders') },
    { href: '/admin/settings', label: t('settings') },
  ];

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <h1 className="section-title text-3xl sm:text-4xl">{t('title')}</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="glass rounded-2xl p-5 text-base transition hover:bg-white/65 sm:rounded-3xl sm:p-6 sm:text-lg"
          >
            {card.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
