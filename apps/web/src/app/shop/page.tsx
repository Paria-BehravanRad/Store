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
  stock: number;
  imageUrls: string[];
  category?: { slug: string; nameEn: string; nameFa: string; nameDe: string };
};

function nameOf(p: Product, locale: string) {
  if (locale === 'fa') return p.nameFa;
  if (locale === 'de') return p.nameDe;
  return p.nameEn;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const t = await getTranslations('shop');
  const locale = await getLocale();
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.category) qs.set('categorySlug', params.category);
  if (params.q) qs.set('search', params.q);
  qs.set('pageSize', '24');

  let products: Product[] = [];
  try {
    const data = await apiFetch<{ items: Product[] }>(`/products?${qs.toString()}`);
    products = data.items;
  } catch {
    products = [];
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-4xl text-ink-900">{t('title')}</h1>
        <div className="flex gap-2 text-sm">
          <Link className="btn-ghost" href="/shop">
            All
          </Link>
          <Link className="btn-ghost" href="/shop?category=bracelets">
            Bracelets
          </Link>
          <Link className="btn-ghost" href="/shop?category=rings">
            Rings
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="glass rounded-3xl p-8 text-ink-700">{t('empty')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              className="glass overflow-hidden rounded-3xl p-3 transition hover:-translate-y-0.5 hover:bg-white/65"
            >
              <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-champagne-100 via-white/40 to-ink-100/30" />
              <div className="space-y-1 px-2 py-3">
                <p className="font-medium">{nameOf(p, locale)}</p>
                <p className="text-sm text-ink-700">
                  {formatRials(p.priceRials, locale)} IRR
                </p>
                <p className="text-xs text-ink-700/80">
                  {t('inStock', { count: p.stock })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
