'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales, type AppLocale } from '@/i18n/config';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { apiFetch } from '@/lib/api';
import { GlassMenu, GlassSelect } from '@/components/glass-select';

const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  fa: 'فارسی',
  de: 'Deutsch',
};

export function SiteHeader() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const { user, isAdmin, loading, logout, refresh } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

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
    await refresh();
    router.refresh();
  }

  async function onLogout() {
    setProfileOpen(false);
    setMenuOpen(false);
    await logout();
    router.push('/');
    router.refresh();
  }

  const languageOptions = locales.map((l) => ({
    value: l,
    label: LOCALE_LABELS[l],
  }));

  const desktopNav = (
    <>
      <NavLink href="/" active={pathname === '/'} variant="desktop">
        {t('nav.home')}
      </NavLink>
      <NavLink href="/shop" active={pathname.startsWith('/shop')} variant="desktop">
        {t('nav.shop')}
      </NavLink>
      <NavLink href="/cart" active={pathname.startsWith('/cart')} variant="desktop">
        <span className="inline-flex items-center gap-2">
          {t('nav.cart')}
          {count > 0 ? <span className="nav-badge">{count}</span> : null}
        </span>
      </NavLink>
    </>
  );

  return (
    <>
      <header className="site-header sticky top-0 z-50 border-b backdrop-blur-glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-5 md:py-3.5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              className="nav-icon-btn shrink-0 lg:hidden"
              aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={menuOpen}
              aria-controls="mobile-side-drawer"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon open={false} />
            </button>
            <Link
              href="/"
              className="brand-mark truncate text-lg tracking-tight text-ink-900 sm:text-2xl md:text-[1.65rem]"
            >
              {t('brand')}
            </Link>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">{desktopNav}</nav>

          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              className="nav-icon-btn hidden lg:inline-flex"
              aria-label={theme === 'dark' ? t('common.lightTheme') : t('common.darkTheme')}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            <div className="hidden lg:block">
              <GlassSelect
                ariaLabel={t('common.language')}
                value={locale}
                align="end"
                options={languageOptions}
                onChange={(v) => void setLocale(v)}
                triggerClassName="!min-w-0 !px-3 !py-2 text-sm"
              />
            </div>

            <div className="relative min-w-0">
              {loading ? (
                <div className="profile-skeleton" aria-hidden />
              ) : user ? (
                <>
                  <button
                    type="button"
                    className="profile-trigger"
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                    onClick={() => setProfileOpen((v) => !v)}
                  >
                    <span className="profile-avatar" aria-hidden>
                      {user.phone.slice(-2)}
                    </span>
                    <span className="flex min-w-0 flex-col text-start">
                      <span className="truncate text-xs font-medium text-ink-900">
                        {t('nav.account')}
                      </span>
                      <span className="truncate text-[11px] text-ink-700" dir="ltr">
                        {user.phone}
                      </span>
                    </span>
                    <svg
                      aria-hidden
                      viewBox="0 0 20 20"
                      className={`h-3.5 w-3.5 shrink-0 text-ink-700 transition ${
                        profileOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        d="M5 7.5 10 12.5 15 7.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <GlassMenu
                    open={profileOpen}
                    onClose={() => setProfileOpen(false)}
                    align="end"
                    className="w-[min(15.5rem,calc(100vw-1.5rem))]"
                  >
                    <div className="border-b border-ink-900/8 px-3.5 py-3">
                      <p className="text-xs text-ink-700">{t('nav.signedInAs')}</p>
                      <p className="mt-0.5 truncate text-sm font-medium text-ink-900" dir="ltr">
                        {user.phone}
                      </p>
                    </div>
                    {isAdmin ? (
                      <Link
                        href="/admin"
                        role="menuitem"
                        className="glass-menu-item"
                        onClick={() => setProfileOpen(false)}
                      >
                        {t('nav.admin')}
                      </Link>
                    ) : null}
                    <Link
                      href="/cart"
                      role="menuitem"
                      className="glass-menu-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      {t('nav.cart')}
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      className="glass-menu-item text-red-800"
                      onClick={() => void onLogout()}
                    >
                      {t('nav.logout')}
                    </button>
                  </GlassMenu>
                </>
              ) : (
                <Link href="/login" className="profile-guest-btn">
                  <span className="profile-avatar profile-avatar-guest" aria-hidden>
                    <UserIcon />
                  </span>
                  <span>{t('nav.login')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="side-drawer-backdrop"
            aria-label={t('nav.closeMenu')}
            onClick={() => setMenuOpen(false)}
          />
          <aside
            id="mobile-side-drawer"
            className="side-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
          >
            <div className="flex items-center justify-between border-b border-ink-900/10 px-4 py-4">
              <p className="brand-mark text-xl text-ink-900">{t('brand')}</p>
              <button
                type="button"
                className="nav-icon-btn"
                aria-label={t('nav.closeMenu')}
                onClick={() => setMenuOpen(false)}
              >
                <MenuIcon open />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
              <NavLink
                href="/"
                active={pathname === '/'}
                variant="drawer"
                onNavigate={() => setMenuOpen(false)}
              >
                {t('nav.home')}
              </NavLink>
              <NavLink
                href="/shop"
                active={pathname.startsWith('/shop')}
                variant="drawer"
                onNavigate={() => setMenuOpen(false)}
              >
                {t('nav.shop')}
              </NavLink>
              <NavLink
                href="/cart"
                active={pathname.startsWith('/cart')}
                variant="drawer"
                onNavigate={() => setMenuOpen(false)}
              >
                <span className="inline-flex items-center gap-2">
                  {t('nav.cart')}
                  {count > 0 ? <span className="nav-badge">{count}</span> : null}
                </span>
              </NavLink>
              {!loading && isAdmin ? (
                <NavLink
                  href="/admin"
                  active={pathname.startsWith('/admin')}
                  variant="drawer"
                  onNavigate={() => setMenuOpen(false)}
                >
                  {t('nav.admin')}
                </NavLink>
              ) : null}
            </nav>

            <div className="space-y-3 border-t border-ink-900/10 px-4 py-4">
              <div className="space-y-1.5">
                <p className="px-0.5 text-xs font-medium text-ink-700">{t('common.language')}</p>
                <GlassSelect
                  fullWidth
                  ariaLabel={t('common.language')}
                  value={locale}
                  options={languageOptions}
                  onChange={(v) => void setLocale(v)}
                />
              </div>
              <button
                type="button"
                className="btn-ghost w-full justify-between"
                onClick={toggleTheme}
              >
                <span>{theme === 'dark' ? t('common.lightTheme') : t('common.darkTheme')}</span>
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}

function NavLink({
  href,
  active,
  children,
  onNavigate,
  variant,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onNavigate?: () => void;
  variant: 'desktop' | 'drawer';
}) {
  const base =
    variant === 'desktop'
      ? 'inline-flex rounded-xl px-3 py-2 text-sm transition hover:bg-white/50'
      : 'block w-full rounded-xl px-3 py-3 text-base transition hover:bg-ink-900/5';

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`${base} ${
        active ? 'bg-white/60 font-medium text-ink-950' : 'text-ink-800 hover:text-ink-950'
      }`}
    >
      {children}
    </Link>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      {open ? (
        <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
      ) : (
        <>
          <path d="M4 7h16" strokeLinecap="round" />
          <path d="M4 12h16" strokeLinecap="round" />
          <path d="M4 17h16" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M5.5 19c1.4-3 3.7-4.5 6.5-4.5S17.1 16 18.5 19" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path
        d="M20 13.5A7.5 7.5 0 1 1 10.5 4 6 6 0 0 0 20 13.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5 5l1.6 1.6M17.4 17.4 19 19M19 5l-1.6 1.6M6.6 17.4 5 19"
        strokeLinecap="round"
      />
    </svg>
  );
}
