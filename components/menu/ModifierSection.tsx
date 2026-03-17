"use client";

import { useState } from "react";
import type { MenuModifierList } from "@/features/menu/types";

type Props = {
  list: MenuModifierList;
  selectedModifiers: Record<string, string[]>;
  toggleModifier: (list: MenuModifierList, modifierId: string) => void;
  selectedVariationName?: string;
  itemDescription?: string;
};

function normalize(word: string) {
  let w = word.toLowerCase().trim();

  if (w.endsWith("ies")) {
    w = w.replace("ies", "y");
  } else if (w.endsWith("s")) {
    w = w.slice(0, -1);
  }

  return w;
}

export default function ModifierSection({
  list,
  selectedModifiers,
  toggleModifier,
  selectedVariationName,
  itemDescription,
}: Props) {

  const [open, setOpen] = useState(false);

  const description = itemDescription?.toLowerCase() || "";

  const normalizedListName = list.name?.toLowerCase() || "";

  const isComboList = normalizedListName.includes("combo");

  const isLarge =
    selectedVariationName?.toLowerCase().includes("large");

  const disabledCombo = isComboList && !isLarge;

  const isExtraFruit =
    normalizedListName.includes("extra fruit");

  const isExtraVeg =
    normalizedListName.includes("extra vegetables") ||
    normalizedListName.includes("extra vegetable");

  // Split ingredients
  const descriptionIngredients = description
    .split(",")
    .map((i) => i.trim().toLowerCase())
    .filter((i) => !i.includes("juice"));

  const normalizedIngredients = descriptionIngredients.map(normalize);

  let filteredModifiers = list.modifiers;

  if (isExtraFruit || isExtraVeg) {

    filteredModifiers = list.modifiers.filter((modifier) => {

      const name = modifier.name.toLowerCase();

      const normalizedName = normalize(name);

      // 1️⃣ Exact match first
      if (descriptionIngredients.includes(name)) {
        return true;
      }

      // 2️⃣ Then normalized match
      if (normalizedIngredients.includes(normalizedName)) {
        return true;
      }

      return false;

    });

  }

  if ((isExtraFruit || isExtraVeg) && filteredModifiers.length === 0) {
    return null;
  }

  return (
    <div className="pb-6 border-b border-neutral-100">

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left"
      >
        <h2 className="text-lg font-semibold">
          {list.name}
        </h2>

        <span className="text-xl">
          {open ? "▾" : "▸"}
        </span>
      </button>

      {disabledCombo && (
        <p className="text-xs text-neutral-500 mt-1">
          Only available with Large smoothies
        </p>
      )}

      {open && (
        <div className="flex flex-wrap gap-2 mt-4">

          {filteredModifiers.map((modifier) => {

            const selected =
              selectedModifiers[list.id]?.includes(modifier.id);

            return (
              <button
                key={modifier.id}
                disabled={disabledCombo}
                onClick={() => toggleModifier(list, modifier.id)}
                className={`px-4 py-2 rounded-full text-sm border transition
                ${
                  selected
                    ? "bg-[var(--color-orange)] text-black border-[var(--color-orange)]"
                    : "bg-white border-neutral-100"
                }
                ${
                  disabledCombo
                    ? "opacity-40 cursor-not-allowed"
                    : "hover:border-neutral-200"
                }`}
              >
                {modifier.name}

                {modifier.price > 0 && (
                  <span className="ml-1 opacity-70">
                    +${(modifier.price / 100).toFixed(2)}
                  </span>
                )}

              </button>
            );
          })}

        </div>
      )}

    </div>
  );
}