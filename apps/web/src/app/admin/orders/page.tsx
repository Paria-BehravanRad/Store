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
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
].map((s) => ({ value: s, label: s }));

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
      <h1 className="section-title text-3xl">{t('orders')}</h1>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <ul className="space-y-2">
        {orders.map((order) => (
          <li
            key={order.id}
            className="glass flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{order.id}</p>
              <p className="text-xs text-ink-700">
                {formatRials(order.totalRials, 'en')} IRR ·{' '}
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <GlassSelect
              value={order.status}
              options={STATUS_OPTIONS}
              onChange={(status) => void setStatus(order.id, status)}
              className="w-full sm:w-auto"
              fullWidth
              triggerClassName="sm:!w-auto"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
