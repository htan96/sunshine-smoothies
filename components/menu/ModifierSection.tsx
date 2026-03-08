"use client";

import type { MenuModifierList } from "@/features/menu/types";

type Props = {
  list: MenuModifierList;
  selectedModifiers: Record<string, string[]>;
  toggleModifier: (list: MenuModifierList, modifierId: string) => void;
  description?: string;
};

export default function ModifierSection({
  list,
  selectedModifiers,
  toggleModifier,
  description,
}: Props) {

  // Parse ingredients from the recipe description
  const recipeIngredients =
    description
      ?.split(",")
      .map((i) => i.trim().toLowerCase())
      .filter(Boolean) || [];

  // Normalize list name for comparisons
  const listName = list.name.toLowerCase();

  // Determine which modifiers should be visible
  const visibleModifiers = list.modifiers.filter((modifier) => {
    const modifierName = modifier.name.toLowerCase();

    // Only filter EXTRA ingredient lists
    if (
      listName === "extra fruit" ||
      listName === "extra fruits" ||
      listName === "extra vegetable" ||
      listName === "extra vegetables"
    ) {
      return recipeIngredients.includes(modifierName);
    }

    // All other modifier lists remain unchanged
    return true;
  });

  // If nothing to show, hide the section entirely
  if (visibleModifiers.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{list.name}</h2>

      <div className="space-y-3">
        {visibleModifiers.map((modifier) => {
          const selected =
            selectedModifiers[list.id]?.includes(modifier.id);

          return (
            <button
              key={modifier.id}
              onClick={() => toggleModifier(list, modifier.id)}
              className={`w-full px-5 py-4 rounded-xl transition flex justify-between items-center ${
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