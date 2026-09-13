'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { locales, type AppLocale } from '@/i18n/config';

export default function AdminSettingsPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [defaultLocale, setDefaultLocale] = useState<AppLocale>('en');
  const [storeName, setStoreName] = useState('ViraPlaza');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ defaultLocale: AppLocale; storeName: string }>('/settings')
      .then((data) => {
        setDefaultLocale(data.defaultLocale);
        setStoreName(data.storeName);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'));
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await apiFetch('/settings', {
        method: 'PATCH',
        body: JSON.stringify({ defaultLocale, storeName }),
      });
      setMessage('Saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="font-display text-3xl">{t('settings')}</h1>
      <form onSubmit={onSave} className="glass space-y-4 rounded-3xl p-6">
        <label className="block space-y-2 text-sm">
          <span>Store name</span>
          <input
            className="w-full rounded-2xl border border-ink-900/10 bg-white/70 px-4 py-3"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        </label>
        <label className="block space-y-2 text-sm">
          <span>{t('defaultLocale')}</span>
          <select
            className="w-full rounded-2xl border border-ink-900/10 bg-white/70 px-4 py-3"
            value={defaultLocale}
            onChange={(e) => setDefaultLocale(e.target.value as AppLocale)}
          >
            {locales.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
        {message ? <p className="text-sm text-emerald-800">{message}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button className="btn-primary" type="submit">
          {tc('save')}
        </button>
      </form>
    </div>
  );
}
