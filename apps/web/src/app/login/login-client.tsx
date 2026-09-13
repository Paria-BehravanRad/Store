'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function LoginClient() {
  const t = useTranslations('auth');
  const router = useRouter();
  const search = useSearchParams();
  const { refresh } = useAuth();
  const nextPath = useMemo(() => search.get('next') || '/shop', [search]);

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
      await refresh();
      router.push(nextPath.startsWith('/') ? nextPath : '/shop');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2">
        <h1 className="section-title">{t('title')}</h1>
        <p className="text-sm leading-relaxed text-ink-700">{t('hint')}</p>
      </div>

      {step === 'phone' ? (
        <form onSubmit={requestOtp} className="glass-strong space-y-4 rounded-[1.75rem] p-6">
          <label className="block space-y-2 text-sm">
            <span>{t('phone')}</span>
            <input
              className="field"
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
        <form onSubmit={verifyOtp} className="glass-strong space-y-4 rounded-[1.75rem] p-6">
          <label className="block space-y-2 text-sm">
            <span>{t('code')}</span>
            <input
              className="field tracking-[0.35em]"
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
