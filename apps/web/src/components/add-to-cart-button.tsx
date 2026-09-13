'use client';

import { useCart } from '@/lib/cart';
import { useTranslations } from 'next-intl';

type Props = {
  productId: string;
  slug: string;
  name: string;
  priceRials: number;
  imageUrl?: string;
};

export function AddToCartButton(props: Props) {
  const t = useTranslations('shop');
  const { addItem } = useCart();

  return (
    <button
      type="button"
      className="btn-primary"
      onClick={() =>
        addItem({
          productId: props.productId,
          slug: props.slug,
          name: props.name,
          priceRials: props.priceRials,
          imageUrl: props.imageUrl,
        })
      }
    >
      {t('addToCart')}
    </button>
  );
}
