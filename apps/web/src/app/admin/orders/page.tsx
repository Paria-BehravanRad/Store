'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch, formatRials } from '@/lib/api';
import { GlassSelect } from '@/components/glass-select';

type Order = {
  id: string;
  status: string;
  totalRials: number;
  createdAt: string;
};

const STATUS_OPTIONS = [
  { value: 'PENDING_PAYMENT', label: 'Pending payment' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
];

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
    <div className="w-full max-w-full min-w-0 space-y-4">
      <h1 className="section-title text-3xl">{t('orders')}</h1>
      {error ? <p className="break-words text-sm text-red-700">{error}</p> : null}
      <ul className="space-y-2">
        {orders.map((order) => (
          <li
            key={order.id}
            className="glass flex max-w-full min-w-0 flex-col gap-3 rounded-2xl p-3 sm:p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium" title={order.id}>
                {order.id}
              </p>
              <p className="break-words text-xs text-ink-700">
                {formatRials(order.totalRials, 'en')} IRR ·{' '}
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <GlassSelect
              value={order.status}
              options={STATUS_OPTIONS}
              onChange={(status) => void setStatus(order.id, status)}
              fullWidth
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
