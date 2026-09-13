import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; status?: string }>;
}) {
  const t = await getTranslations('checkout');
  const params = await searchParams;
  const ok = params.status === 'paid';

  return (
    <div className="glass mx-auto max-w-lg space-y-4 rounded-3xl p-8 text-center">
      <h1 className="font-display text-4xl">{ok ? t('success') : t('failed')}</h1>
      {params.orderId ? (
        <p className="text-sm text-ink-700">Order {params.orderId}</p>
      ) : null}
      <Link href="/shop" className="btn-primary">
        Continue shopping
      </Link>
    </div>
  );
}
