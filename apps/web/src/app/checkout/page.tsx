'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { apiFetch, formatRials } from '@/lib/api';
import { useCart } from '@/lib/cart';

type InitiateResponse = {
  redirectUrl: string;
  method: 'GET' | 'POST';
  token: string;
  resNum: string;
  fields?: Record<string, string>;
};

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const router = useRouter();
  const { items, totalRials, clear } = useCart();
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    return (
      <div className="glass rounded-3xl p-8">
        <p>Cart is empty.</p>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const order = await apiFetch<{ id: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          shippingAddress: address,
        }),
      });

      const payment = await apiFetch<InitiateResponse>(
        `/payments/orders/${order.id}/initiate`,
        { method: 'POST' },
      );

      clear();

      if (payment.method === 'GET') {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/payments/sep/callback`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              ResNum: payment.resNum,
              State: 'OK',
              RefNum: `MOCK-${order.id}`,
            }),
            redirect: 'manual',
          },
        );
        router.push(`/checkout/result?orderId=${order.id}&status=paid`);
        return;
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = payment.redirectUrl;
      Object.entries(payment.fields ?? { Token: payment.token }).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="font-display text-4xl">{t('title')}</h1>
      <form onSubmit={onSubmit} className="glass space-y-4 rounded-3xl p-6">
        <label className="block space-y-2 text-sm">
          <span>{t('address')}</span>
          <textarea
            className="min-h-28 w-full rounded-2xl border border-ink-900/10 bg-white/70 px-4 py-3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </label>
        <p className="text-sm text-ink-800">
          {formatRials(totalRials, locale)} IRR · {items.length} lines
        </p>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button className="btn-primary w-full" disabled={loading} type="submit">
          {t('pay')}
        </button>
      </form>
    </div>
  );
}
