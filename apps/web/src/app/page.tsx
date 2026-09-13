import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { apiFetch, formatRials } from '@/lib/api';

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
    <div className="space-y-20">
      <section className="relative -mx-4 overflow-hidden md:mx-0 md:rounded-[2rem]">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-atmosphere.jpg"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-900/35 to-ink-900/15" />
        </div>

        <div className="relative flex min-h-[78vh] flex-col justify-end px-6 pb-12 pt-28 md:px-12 md:pb-16 animate-fade-up">
          <p className="brand-mark text-5xl leading-none text-champagne-50 md:text-7xl">
            ViraPlaza
          </p>
          <h1 className="mt-5 max-w-xl text-balance text-2xl font-medium leading-snug text-white md:text-3xl">
            {t('headline')}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85 md:text-base">
            {t('sub')}
          </p>
          <div className="mt-8">
            <Link
              href="/shop"
              className="btn-primary bg-champagne-100 text-ink-900 shadow-glass hover:bg-white"
            >
              {t('cta')}
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-7 animate-fade-up" style={{ animationDelay: '140ms' }}>
        <div className="flex items-end justify-between gap-4">
          <h2 className="section-title">{t('featured')}</h2>
          <Link href="/shop" className="text-sm text-ink-700 underline-offset-4 hover:underline">
            {t('cta')}
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              className="group block overflow-hidden rounded-[1.5rem] transition duration-300 hover:-translate-y-1"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-champagne-100 via-white/50 to-ink-100/40 ring-1 ring-white/50 transition duration-500 group-hover:shadow-glass">
                <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.65),transparent_55%)]" />
              </div>
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
