"use client";

import { matchModifierToMenuItem } from "@/lib/matchModifierToItem";
import type { MenuItem, MenuModifierList } from "@/features/menu/types";

type Props = {
  list: MenuModifierList;
  selectedModifiers: Record<string, string[]>;
  toggleModifier: (list: MenuModifierList, modifierId: string) => void;
  allMenuItems: MenuItem[];
};

export default function FuelPackDrinksSection({
  list,
  selectedModifiers,
  toggleModifier,
  allMenuItems,
}: Props) {
  return (
    <div className="pb-6 border-b border-neutral-100">
      <h3 className="text-sm font-semibold text-[var(--color-charcoal)] mb-3">
        Choose your drink
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {list.modifiers.map((modifier) => {
          const matchedItem = matchModifierToMenuItem(modifier.name, allMenuItems);
          const displayName = matchedItem?.name ?? modifier.name;
          const image = matchedItem?.image ?? null;
          const selected = selectedModifiers[list.id]?.includes(modifier.id);

          return (
            <button
              key={modifier.id}
              type="button"
              onClick={() => toggleModifier(list, modifier.id)}
              className={`rounded-xl overflow-hidden text-left transition border-2 ${
                selected
                  ? "border-[var(--color-orange)] bg-[var(--color-orange-light)]/30"
                  : "border-neutral-100 bg-white hover:border-neutral-200"
              }`}
            >
              <div className="aspect-square bg-neutral-100 relative">
                {image ? (
                  <img
                    src={image}
                    alt={displayName}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                    {displayName}
                  </div>
                )}
              </div>
              <p className="p-2 text-sm font-medium text-[var(--color-charcoal)] line-clamp-2">
                {displayName}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
