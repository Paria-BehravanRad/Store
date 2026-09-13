import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { apiFetch, formatRials } from '@/lib/api';

type Product = {
  id: string;
  slug: string;
  nameEn: string;
  nameFa: string;
  nameDe: string;
  descriptionEn?: string | null;
  descriptionFa?: string | null;
  descriptionDe?: string | null;
  priceRials: number;
  stock: number;
  imageUrls: string[];
};

function pick(locale: string, en?: string | null, fa?: string | null, de?: string | null) {
  if (locale === 'fa') return fa || en || '';
  if (locale === 'de') return de || en || '';
  return en || '';
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations('product');
  const ts = await getTranslations('shop');
  const locale = await getLocale();

  let product: Product;
  try {
    product = await apiFetch<Product>(`/products/${slug}`);
  } catch {
    notFound();
  }

  const name = pick(locale, product.nameEn, product.nameFa, product.nameDe);
  const description = pick(
    locale,
    product.descriptionEn,
    product.descriptionFa,
    product.descriptionDe,
  );

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2">
      <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-br from-champagne-100 via-white/55 to-ink-100/35 ring-1 ring-white/50" />
      <div className="space-y-6 animate-fade-up">
        <Link href="/shop" className="inline-block text-sm text-ink-700 hover:text-ink-950">
          ← {t('back')}
        </Link>
        <h1 className="section-title text-4xl md:text-5xl">{name}</h1>
        <p className="text-lg text-ink-800">{formatRials(product.priceRials, locale)} IRR</p>
        <p className="text-sm text-ink-700">{ts('inStock', { count: product.stock })}</p>
        <div className="space-y-2 border-t border-ink-900/10 pt-5">
          <h2 className="text-sm font-medium text-ink-700">{t('description')}</h2>
          <p className="leading-relaxed text-ink-800">{description || '—'}</p>
        </div>
        <AddToCartButton
          productId={product.id}
          slug={product.slug}
          name={name}
          priceRials={product.priceRials}
          imageUrl={product.imageUrls[0]}
        />
      </div>
    </div>
  );
}
