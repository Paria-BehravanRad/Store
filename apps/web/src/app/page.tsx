import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { apiFetch, formatRials } from '@/lib/api';
import { getLocale } from 'next-intl/server';

type Product = {
  id: string;
  slug: string;
  nameEn: string;
  nameFa: string;
  nameDe: string;
  priceRials: number;
  imageUrls: string[];
};

function localizedName(p: Product, locale: string) {
  if (locale === 'fa') return p.nameFa;
  if (locale === 'de') return p.nameDe;
  return p.nameEn;
}

export default async function HomePage() {
  const t = await getTranslations('home');
  const locale = await getLocale();
  let products: Product[] = [];
  try {
    const data = await apiFetch<{ items: Product[] }>('/products?pageSize=4');
    products = data.items;
  } catch {
    products = [];
  }

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/40">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(120deg, rgba(28,25,23,0.55), rgba(28,25,23,0.25)), url(/images/hero-accessories.svg)',
          }}
        />
        <div className="relative flex min-h-[72vh] flex-col justify-end p-8 md:p-14 animate-fade-up">
          <p className="font-display text-5xl leading-none text-champagne-50 md:text-7xl">
            ViraPlaza
          </p>
          <h1 className="mt-4 max-w-xl font-display text-3xl text-white md:text-4xl">
            {t('headline')}
          </h1>
          <p className="mt-3 max-w-lg text-sm text-white/85 md:text-base">{t('sub')}</p>
          <div className="mt-8">
            <Link href="/shop" className="btn-primary bg-champagne-100 text-ink-900 hover:bg-white">
              {t('cta')}
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-6 animate-fade-up" style={{ animationDelay: '120ms' }}>
        <h2 className="font-display text-3xl text-ink-900">{t('featured')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              className="group overflow-hidden rounded-3xl border border-white/40 bg-white/40 p-3 backdrop-blur-glass transition hover:-translate-y-0.5 hover:bg-white/60"
            >
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-champagne-100 to-ink-100/40" />
              <div className="mt-3 space-y-1 px-1">
                <p className="font-medium text-ink-900">{localizedName(p, locale)}</p>
                <p className="text-sm text-ink-700">
                  {formatRials(p.priceRials, locale)} IRR
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
