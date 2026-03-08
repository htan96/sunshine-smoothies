"use client";

import type { MenuModifierList } from "@/features/menu/types";

type Props = {
  list: MenuModifierList;
  selectedModifiers: Record<string, string[]>;
  toggleModifier: (list: MenuModifierList, modifierId: string) => void;
  selectedVariationName?: string;
};

export default function ModifierSection({
  list,
  selectedModifiers,
  toggleModifier,
  selectedVariationName,
}: Props) {

  console.log("Modifier list name:", list.name);
  console.log("Selected variation:", selectedVariationName);

  const isLarge =
    selectedVariationName?.toLowerCase().includes("large");

  if (
    list.name.toLowerCase().includes("combo") &&
    !isLarge
  ) {
    return null;
  }
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">
        {list.name}
      </h2>

      <div className="flex flex-wrap gap-3">
        {list.modifiers.map((modifier) => {

          const selected =
            selectedModifiers[list.id]?.includes(modifier.id);

          return (
            <button
              key={modifier.id}
              onClick={() => toggleModifier(list, modifier.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selected
                  ? "bg-black text-white"
                  : "bg-neutral-200 hover:bg-neutral-300"
              }`}
            >
              {modifier.name}

              {modifier.price > 0 && (
                <span className="ml-1 text-xs opacity-80">
                  +${(modifier.price / 100).toFixed(2)}
                </span>
              )}

            </button>
          );
        })}
      </div>
    </div>
  );
}