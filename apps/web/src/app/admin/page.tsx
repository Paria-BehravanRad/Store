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
    <div className="space-y-6">
      <h1 className="font-display text-4xl">{t('title')}</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="glass rounded-3xl p-6 text-lg transition hover:bg-white/65"
          >
            {card.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
