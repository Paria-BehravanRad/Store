'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { formatRials } from '@/lib/api';
import { useCart } from '@/lib/cart';

export default function CartPage() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const { items, removeItem, totalRials } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-5 text-center">
        <h1 className="section-title">{t('title')}</h1>
        <p className="text-ink-700">{t('empty')}</p>
        <Link href="/shop" className="btn-primary">
          Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <h1 className="section-title">{t('title')}</h1>
      <ul className="divide-y divide-ink-900/10 border-y border-ink-900/10">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-ink-700">
                ×{item.quantity} · {formatRials(item.priceRials * item.quantity, locale)} IRR
              </p>
            </div>
            <button
              type="button"
              className="text-sm text-ink-700 underline-offset-4 hover:underline"
              onClick={() => removeItem(item.productId)}
            >
              {t('remove')}
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg font-medium">
          {t('total')}: {formatRials(totalRials, locale)} IRR
        </p>
        <Link href="/checkout" className="btn-primary">
          {t('checkout')}
        </Link>
      </div>
    </div>
  );
}
