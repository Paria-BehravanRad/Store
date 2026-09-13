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
      <div className="glass space-y-4 rounded-3xl p-8">
        <h1 className="font-display text-3xl">{t('title')}</h1>
        <p>{t('empty')}</p>
        <Link href="/shop" className="btn-primary">
          Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl">{t('title')}</h1>
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.productId}
            className="glass flex items-center justify-between gap-4 rounded-2xl p-4"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-ink-700">
                ×{item.quantity} · {formatRials(item.priceRials * item.quantity, locale)} IRR
              </p>
            </div>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => removeItem(item.productId)}
            >
              {t('remove')}
            </button>
          </li>
        ))}
      </ul>
      <div className="glass-strong flex items-center justify-between rounded-3xl p-5">
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
