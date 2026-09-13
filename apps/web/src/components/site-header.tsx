'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales, type AppLocale } from '@/i18n/config';
import { useCart } from '@/lib/cart';
import { apiFetch } from '@/lib/api';

export function SiteHeader() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();

  async function setLocale(next: AppLocale) {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    try {
      await apiFetch('/users/me/locale', {
        method: 'PATCH',
        body: JSON.stringify({ preferredLocale: next }),
      });
    } catch {
      // guest or unauthenticated — cookie is enough
    }
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/30 bg-white/35 backdrop-blur-glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="font-display text-2xl tracking-tight text-ink-900">
          {t('brand')}
        </Link>
        <nav className="flex items-center gap-3 text-sm text-ink-800">
          <Link className={linkClass(pathname === '/')} href="/">
            {t('nav.home')}
          </Link>
          <Link className={linkClass(pathname.startsWith('/shop'))} href="/shop">
            {t('nav.shop')}
          </Link>
          <Link className={linkClass(pathname.startsWith('/cart'))} href="/cart">
            {t('nav.cart')}
            {count > 0 ? (
              <span className="ms-1 rounded-full bg-ink-900 px-1.5 py-0.5 text-[10px] text-white">
                {count}
              </span>
            ) : null}
          </Link>
          <Link className={linkClass(pathname.startsWith('/login'))} href="/login">
            {t('nav.login')}
          </Link>
          <Link className={linkClass(pathname.startsWith('/admin'))} href="/admin">
            {t('nav.admin')}
          </Link>
          <label className="sr-only" htmlFor="lang">
            {t('common.language')}
          </label>
          <select
            id="lang"
            className="rounded-xl border border-ink-900/10 bg-white/50 px-2 py-1 text-xs"
            value={locale}
            onChange={(e) => setLocale(e.target.value as AppLocale)}
          >
            {locales.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </nav>
      </div>
    </header>
  );
}

function linkClass(active: boolean) {
  return active
    ? 'font-medium text-ink-950 underline decoration-champagne-500 underline-offset-4'
    : 'hover:text-ink-950';
}
