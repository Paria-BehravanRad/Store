import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export async function SiteFooter() {
  const t = await getTranslations();

  return (
    <footer className="relative mt-auto border-t border-white/30 bg-white/25 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-7 text-sm text-ink-700 sm:px-5 sm:py-8 md:flex-row md:items-center md:justify-between">
        <p className="brand-mark text-lg text-ink-900">{t('brand')}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/shop" className="hover:text-ink-950">
            {t('nav.shop')}
          </Link>
          <Link href="/login" className="hover:text-ink-950">
            {t('nav.login')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
