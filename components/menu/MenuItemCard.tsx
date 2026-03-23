"use client";

import type { MenuItem } from "@/features/menu/types";
import { calculateTotalWithTaxCents } from "@/lib/pricing";

type Props = {
  item: MenuItem;
  onClick: () => void;
};

export default function MenuItemCard({ item, onClick }: Props) {
  const minPriceBase = item.variations.reduce(
    (min, v) => Math.min(min, v.price),
    item.variations[0]?.price ?? 0
  );
  const minPrice = calculateTotalWithTaxCents(minPriceBase);
  const singleSize = item.variations.length === 1;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
    >
      {/* IMAGE - fixed aspect, consistent crop */}
      <div className="aspect-square bg-neutral-100 flex items-center justify-center shrink-0 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <span className="text-neutral-400 text-sm">Coming Soon</span>
        )}
      </div>

      {/* NAME & PRICE - fixed min-height for consistent card sizing */}
      <div className="p-4 flex flex-col flex-1 min-h-[7rem]">
        <h3 className="font-medium text-[var(--color-charcoal)] line-clamp-2">
          {item.name.replace(/-/g, " ")}
        </h3>
        <span className="font-semibold text-[var(--color-charcoal)] mt-2">
          {singleSize ? `$${(minPrice / 100).toFixed(2)}` : `From $${(minPrice / 100).toFixed(2)}`}
        </span>
        <span className="mt-auto pt-3 text-[var(--color-orange)] font-medium text-sm">
          Customize & Add
        </span>
      </div>
    </button>
  );
} 