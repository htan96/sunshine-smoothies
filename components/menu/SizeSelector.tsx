"use client";

import type { MenuVariation } from "@/features/menu/types";

type Props = {
  variations: MenuVariation[];
  selectedVariation: MenuVariation;
  onSelect: (variation: MenuVariation) => void;
};

export default function SizeSelector({
  variations,
  selectedVariation,
  onSelect,
}: Props) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Size Options</h2>

      <div className="space-y-3">
        {variations.map((variation) => (
          <button
            key={variation.id}
            onClick={() => onSelect(variation)}
            className={`w-full px-5 py-4 rounded-xl transition flex justify-between items-center ${
              selectedVariation.id === variation.id
                ? "bg-black text-white"
                : "bg-neutral-100 hover:bg-neutral-200"
            }`}
          >
            <span>{variation.name}</span>
            <span>${(variation.price / 100).toFixed(2)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}