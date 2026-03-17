"use client";

import { nanoid } from "nanoid";
import { useCartStore } from "@/features/cart/store";
import { PACK_VARIATIONS } from "@/lib/fuelConstants";
import type { MenuItem, MenuVariation } from "@/features/menu/types";

type Props = {
  items: MenuItem[];
};

const PACK_IDS = new Set(Object.values(PACK_VARIATIONS));

export default function BuyPacksSection({ items }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  // Flatten: each item can have 1+ variations (supports both single item w/ variations and separate items per size)
  const packCards = items.flatMap((item) =>
    item.variations
      .filter((v) => PACK_IDS.has(v.id))
      .map((variation) => ({ item, variation }))
  );

  function handleAdd(item: MenuItem, variation: MenuVariation) {
    addItem({
      id: nanoid(),
      itemId: item.id,
      itemName: item.name,
      image: item.image ?? undefined,
      variationId: variation.id,
      variationName: variation.name,
      basePrice: variation.price,
      modifiers: [],
      quantity: 1,
    });
    openCart();
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-[var(--color-charcoal)] mb-4">
        Choose a pack size
      </h2>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        Buy 7 smoothies, get 10 total. Redeem anytime with your phone number.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {packCards.map(({ item, variation }) => (
          <div
            key={variation.id}
            className="rounded-2xl border border-neutral-100 p-5 hover:border-[var(--color-orange)]/50 transition"
          >
            <p className="font-semibold text-[var(--color-charcoal)]">{variation.name}</p>
            <p className="text-lg font-bold text-[var(--color-orange)] mt-1">
              ${(variation.price / 100).toFixed(2)}
            </p>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              7 drinks → 10 total
            </p>
            <button
              type="button"
              onClick={() => handleAdd(item, variation)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[var(--color-orange)] text-black font-medium hover:opacity-90 transition"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
