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

  const filters = [
    { href: '/shop', key: 'all' as const, active: !params.category },
    {
      href: '/shop?category=bracelets',
      key: 'bracelets' as const,
      active: params.category === 'bracelets',
    },
    {
      href: '/shop?category=rings',
      key: 'rings' as const,
      active: params.category === 'rings',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="section-title">{t('title')}</h1>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={f.href}
              className={`chip ${f.active ? 'chip-active' : ''}`}
            >
              {t(f.key)}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="glass rounded-[1.75rem] p-8 text-ink-700">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              className="group block transition duration-300 hover:-translate-y-1"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-champagne-100 via-white/45 to-ink-100/30 ring-1 ring-white/45 group-hover:shadow-glass" />
              <div className="mt-3 space-y-1 px-1">
                <p className="font-medium text-ink-900">{nameOf(p, locale)}</p>
                <p className="text-sm text-ink-700">
                  {formatRials(p.priceRials, locale)}
                </p>
                <p className="text-xs text-ink-700/75">{t('inStock', { count: p.stock })}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
