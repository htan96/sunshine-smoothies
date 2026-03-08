"use client";

import type { MenuModifierList } from "@/features/menu/types";

type Props = {
  list: MenuModifierList;
  selectedModifiers: Record<string, string[]>;
  toggleModifier: (list: MenuModifierList, modifierId: string) => void;
  description?: string;
  selectedVariationName?: string;
};

function getVisibleModifiers(
  list: MenuModifierList,
  description?: string,
  selectedVariationName?: string
) {
  const recipeIngredients =
    description
      ?.split(",")
      .map((i) => i.trim().toLowerCase())
      .filter(Boolean) || [];

  const listName = list.name.toLowerCase();

  return list.modifiers.filter((modifier) => {
    const modifierName = modifier.name.toLowerCase();

    // Combo only if Large
    if (modifierName.includes("combo")) {
      if (selectedVariationName?.toLowerCase() !== "large") {
        return false;
      }
    }

    // Extra Fruit / Vegetable filtering
    if (
      listName === "extra fruit" ||
      listName === "extra fruits" ||
      listName === "extra vegetable" ||
      listName === "extra vegetables"
    ) {
      return recipeIngredients.includes(modifierName);
    }

    return true;
  });
}

export default function ModifierSection({
  list,
  selectedModifiers,
  toggleModifier,
  description,
  selectedVariationName,
}: Props) {
  const visibleModifiers = getVisibleModifiers(
    list,
    description,
    selectedVariationName
  );

  if (visibleModifiers.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{list.name}</h2>

      <div className="grid grid-cols-2 gap-3">
        {visibleModifiers.map((modifier) => {
          const selected =
            selectedModifiers[list.id]?.includes(modifier.id);

          return (
            <button
              key={modifier.id}
              onClick={() => toggleModifier(list, modifier.id)}
              className={`px-4 py-3 rounded-xl transition flex justify-between items-center ${
                selected
                  ? "bg-black text-white"
                  : "bg-neutral-100 hover:bg-neutral-200"
              }`}
            >
              <span>{modifier.name}</span>

              {modifier.price > 0 && (
                <span>+${(modifier.price / 100).toFixed(2)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}