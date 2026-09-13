'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales, type AppLocale } from '@/i18n/config';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';

export function SiteHeader() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const { user, isAdmin, loading, logout, refresh } = useAuth();

  async function setLocale(next: AppLocale) {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    try {
      await apiFetch('/users/me/locale', {
        method: 'PATCH',
        body: JSON.stringify({ preferredLocale: next }),
      });
    } catch {
      // guest
    }
    router.refresh();
  }

  async function onLogout() {
    await logout();
    router.push('/');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/25 bg-white/40 backdrop-blur-glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 md:py-4">
        <Link
          href="/"
          className="brand-mark text-2xl tracking-tight text-ink-900 md:text-[1.7rem]"
        >
          {t('brand')}
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 text-sm text-ink-800 md:gap-x-4">
          <Link className={linkClass(pathname === '/')} href="/">
            {t('nav.home')}
          </Link>
          <Link className={linkClass(pathname.startsWith('/shop'))} href="/shop">
            {t('nav.shop')}
          </Link>
          <Link className={linkClass(pathname.startsWith('/cart'))} href="/cart">
            <span className="inline-flex items-center gap-1.5">
              {t('nav.cart')}
              {count > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-ink-900 px-1.5 py-0.5 text-[10px] leading-none text-white">
                  {count}
                </span>
              ) : null}
            </span>
          </Link>

          {!loading && user ? (
            <button type="button" className="hover:text-ink-950" onClick={onLogout}>
              {t('nav.logout')}
            </button>
          ) : (
            <Link className={linkClass(pathname.startsWith('/login'))} href="/login">
              {t('nav.login')}
            </Link>
          )}

          {!loading && isAdmin ? (
            <Link className={linkClass(pathname.startsWith('/admin'))} href="/admin">
              {t('nav.admin')}
            </Link>
          ) : null}

          <label className="sr-only" htmlFor="lang">
            {t('common.language')}
          </label>
          <select
            id="lang"
            className="rounded-xl border border-ink-900/10 bg-white/55 px-2.5 py-1 text-xs outline-none focus:border-champagne-500"
            value={locale}
            onChange={(e) => {
              void setLocale(e.target.value as AppLocale);
              void refresh();
            }}
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
    ? 'font-medium text-ink-950 underline decoration-champagne-500 decoration-2 underline-offset-[6px]'
    : 'transition-colors hover:text-ink-950';
}
