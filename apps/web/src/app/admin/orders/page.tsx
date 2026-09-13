'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch, formatRials } from '@/lib/api';

type Order = {
  id: string;
  status: string;
  totalRials: number;
  createdAt: string;
};

export default function AdminOrdersPage() {
  const t = useTranslations('admin');
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ items: Order[] }>('/admin/orders')
      .then((data) => setOrders(data.items))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'));
  }, []);

  async function setStatus(id: string, status: string) {
    const updated = await apiFetch<Order>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: updated.status } : o)));
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">{t('orders')}</h1>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <ul className="space-y-2">
        {orders.map((order) => (
          <li key={order.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
            <div>
              <p className="font-medium">{order.id}</p>
              <p className="text-xs text-ink-700">
                {formatRials(order.totalRials, 'en')} IRR · {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <select
              className="rounded-xl border border-ink-900/10 bg-white/70 px-3 py-2 text-sm"
              value={order.status}
              onChange={(e) => setStatus(order.id, e.target.value)}
            >
              {[
                'PENDING_PAYMENT',
                'PAID',
                'PROCESSING',
                'SHIPPED',
                'DELIVERED',
                'CANCELLED',
                'REFUNDED',
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
