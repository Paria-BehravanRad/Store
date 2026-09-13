'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales, type AppLocale } from '@/i18n/config';
import { useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth';
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
    await logout();
    router.push('/');
    router.refresh();
  }

  const navLinks = (
    <>
      <NavLink href="/" active={pathname === '/'} onNavigate={() => setMenuOpen(false)}>
        {t('nav.home')}
      </NavLink>
      <NavLink
        href="/shop"
        active={pathname.startsWith('/shop')}
        onNavigate={() => setMenuOpen(false)}
      >
        {t('nav.shop')}
      </NavLink>
      <NavLink
        href="/cart"
        active={pathname.startsWith('/cart')}
        onNavigate={() => setMenuOpen(false)}
      >
        <span className="inline-flex items-center gap-2">
          {t('nav.cart')}
          {count > 0 ? <span className="nav-badge">{count}</span> : null}
        </span>
      </NavLink>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/25 bg-white/45 backdrop-blur-glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5 md:py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            className="nav-icon-btn lg:hidden"
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MenuIcon open={menuOpen} />
          </button>
          <Link
            href="/"
            className="brand-mark truncate text-xl tracking-tight text-ink-900 sm:text-2xl md:text-[1.65rem]"
          >
            {t('brand')}
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">{navLinks}</nav>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <GlassSelect
            ariaLabel={t('common.language')}
            value={locale}
            align="end"
            options={locales.map((l) => ({
              value: l,
              label: LOCALE_LABELS[l],
            }))}
            onChange={(v) => void setLocale(v)}
            triggerClassName="!min-w-0 !px-2.5 !py-2 text-xs sm:!px-3 sm:text-sm"
          />

          <div className="relative">
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
                  <span className="hidden min-w-0 flex-col text-start sm:flex">
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
                    className={`hidden h-3.5 w-3.5 text-ink-700 transition sm:block ${
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
                  className="w-[15.5rem]"
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
                <span className="hidden sm:inline">{t('nav.login')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-white/30 bg-white/70 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-5">
            {navLinks}
            {!loading && user ? (
              <>
                {isAdmin ? (
                  <NavLink
                    href="/admin"
                    active={pathname.startsWith('/admin')}
                    onNavigate={() => setMenuOpen(false)}
                  >
                    {t('nav.admin')}
                  </NavLink>
                ) : null}
                <button
                  type="button"
                  className="nav-mobile-link text-start text-red-800"
                  onClick={() => {
                    setMenuOpen(false);
                    void onLogout();
                  }}
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <NavLink
                href="/login"
                active={pathname.startsWith('/login')}
                onNavigate={() => setMenuOpen(false)}
              >
                {t('nav.login')}
              </NavLink>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
  onNavigate,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`nav-link block w-full rounded-xl px-3 py-3 text-base transition lg:inline-flex lg:w-auto lg:py-2 lg:text-sm lg:hover:bg-white/50 ${
        active ? 'bg-white/70 font-medium text-ink-950 lg:bg-white/60' : 'hover:text-ink-950'
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
