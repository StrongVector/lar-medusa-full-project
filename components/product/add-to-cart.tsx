'use client';

import clsx from 'clsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useCookies } from 'react-cookie';

import LoadingDots from 'components/loading-dots';
import { addToCart } from 'lib/medusa';
import { ProductVariant } from 'lib/medusa/types';

export function AddToCart({
  variants,
  availableForSale
}: {
  variants: ProductVariant[];
  availableForSale: boolean;
}) {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [cookie] = useCookies(['cartId']);

  useEffect(() => {
    const variant = variants.find((variant: ProductVariant) =>
      variant.selectedOptions.every(
        (option) => option.value === searchParams.get(option.name.toLowerCase())
      )
    );

    if (variant) {
      setSelectedVariantId(variant.id);
    }
  }, [searchParams, variants, setSelectedVariantId]);

  const isMutating = adding || isPending;

  async function handleAdd() {
    if (!availableForSale || !variants[0]) return;

    setAdding(true);

    await addToCart(cookie.cartId, {
      variantId: selectedVariantId || variants[0].id,
      quantity: 1
    });

    setAdding(false);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <button
      aria-label="Add item to cart"
      disabled={isMutating}
      onClick={handleAdd}
      className={clsx(
        'flex w-full items-center justify-center bg-black p-4 text-sm uppercase tracking-wide text-white opacity-90 hover:opacity-100 dark:bg-white dark:text-black',
        {
          'cursor-not-allowed opacity-60': !availableForSale,
          'cursor-not-allowed': isMutating
        }
      )}
    >
      <span>{availableForSale ? 'Add To Cart' : 'Out Of Stock'}</span>
      {isMutating ? <LoadingDots className="bg-white dark:bg-black" /> : null}
    </button>
  );
}
