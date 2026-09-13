'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [phone, setPhone] = useState('0912');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ debugCode?: string }>('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setDebugCode(res.debugCode ?? null);
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      });
      router.push('/shop');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="font-display text-4xl">{t('title')}</h1>
      <p className="text-sm text-ink-700">{t('hint')}</p>
      {step === 'phone' ? (
        <form onSubmit={requestOtp} className="glass space-y-4 rounded-3xl p-6">
          <label className="block space-y-2 text-sm">
            <span>{t('phone')}</span>
            <input
              className="w-full rounded-2xl border border-ink-900/10 bg-white/70 px-4 py-3"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              pattern="09\d{9}"
              required
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button className="btn-primary w-full" disabled={loading} type="submit">
            {t('send')}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="glass space-y-4 rounded-3xl p-6">
          <label className="block space-y-2 text-sm">
            <span>{t('code')}</span>
            <input
              className="w-full rounded-2xl border border-ink-900/10 bg-white/70 px-4 py-3 tracking-[0.3em]"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              pattern="\d{6}"
              maxLength={6}
              required
            />
          </label>
          {debugCode ? (
            <p className="rounded-xl bg-champagne-100/80 px-3 py-2 text-xs text-ink-800">
              Dev OTP: {debugCode}
            </p>
          ) : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <button className="btn-primary w-full" disabled={loading} type="submit">
            {t('verify')}
          </button>
        </form>
      )}
    </div>
  );
}
