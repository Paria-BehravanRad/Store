'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { locales, type AppLocale } from '@/i18n/config';
import { GlassSelect } from '@/components/glass-select';

const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  fa: 'فارسی',
  de: 'Deutsch',
};

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
    <div className="mx-auto w-full max-w-lg min-w-0 space-y-4">
      <h1 className="section-title text-3xl">{t('settings')}</h1>
      <form
        onSubmit={onSave}
        className="glass max-w-full space-y-4 rounded-[1.5rem] p-4 sm:rounded-3xl sm:p-6"
      >
        <label className="block space-y-2 text-sm">
          <span>Store name</span>
          <input
            className="field"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        </label>
        <div className="space-y-2 text-sm">
          <span className="block">{t('defaultLocale')}</span>
          <GlassSelect
            fullWidth
            value={defaultLocale}
            options={locales.map((l) => ({ value: l, label: LOCALE_LABELS[l] }))}
            onChange={setDefaultLocale}
          />
        </div>
        {message ? <p className="text-sm text-emerald-800">{message}</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button className="btn-primary w-full sm:w-auto" type="submit">
          {tc('save')}
        </button>
      </form>
    </div>
  );
}
