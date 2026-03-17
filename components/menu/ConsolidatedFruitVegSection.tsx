"use client";

import { useState } from "react";
import type { MenuModifier, MenuModifierList } from "@/features/menu/types";

function normalize(word: string) {
  let w = word.toLowerCase().trim();
  if (w.endsWith("ies")) w = w.replace("ies", "y");
  else if (w.endsWith("s")) w = w.slice(0, -1);
  return w;
}

type ConsolidatedOption = {
  id: string;
  name: string;
  price: number;
  modifierListId: string;
};

type Props = {
  itemModifiers: MenuModifierList[];
  itemDescription?: string;
  selectedModifiers: Record<string, string[]>;
  toggleModifier: (list: MenuModifierList, modifierId: string) => void;
};

function isFruitList(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("fruit");
}

function isVegList(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("vegetable") || n.includes("vegetables");
}

function isAddList(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("add ") || n.startsWith("add");
}

function isExtraList(name: string): boolean {
  const n = name.toLowerCase();
  return n.includes("extra ");
}

export default function ConsolidatedFruitVegSection({
  itemModifiers,
  itemDescription,
  selectedModifiers,
  toggleModifier,
}: Props) {
  const [open, setOpen] = useState(false);
  const description = itemDescription?.toLowerCase() || "";
  const descriptionIngredients = description
    .split(",")
    .map((i) => i.trim().toLowerCase())
    .filter((i) => !i.includes("juice"));
  const normalizedIngredients = descriptionIngredients.map(normalize);

  const fruitLists = itemModifiers.filter((l) => isFruitList(l.name));
  const vegLists = itemModifiers.filter((l) => isVegList(l.name));
  const addFruit = fruitLists.find((l) => isAddList(l.name));
  const extraFruit = fruitLists.find((l) => isExtraList(l.name));
  const addVeg = vegLists.find((l) => isAddList(l.name));
  const extraVeg = vegLists.find((l) => isExtraList(l.name));

  function inDescription(modifierName: string): boolean {
    const name = modifierName.toLowerCase();
    const norm = normalize(name);
    return (
      descriptionIngredients.includes(name) || normalizedIngredients.includes(norm)
    );
  }

  function pickModifier(
    addList: MenuModifierList | undefined,
    extraList: MenuModifierList | undefined,
    modifierName: string
  ): { mod: MenuModifier; list: MenuModifierList } | null {
    const isInDesc = inDescription(modifierName);

    if (isInDesc && extraList) {
      const mod = extraList.modifiers.find(
        (m) => normalize(m.name) === normalize(modifierName)
      );
      if (mod) return { mod, list: extraList };
    }
    if (addList) {
      const mod = addList.modifiers.find(
        (m) => normalize(m.name) === normalize(modifierName)
      );
      if (mod) return { mod, list: addList };
    }
    if (extraList && !addList) {
      const mod = extraList.modifiers.find(
        (m) => normalize(m.name) === normalize(modifierName)
      );
      if (mod) return { mod, list: extraList };
    }
    return null;
  }

  function buildOptions(
    addList: MenuModifierList | undefined,
    extraList: MenuModifierList | undefined
  ): ConsolidatedOption[] {
    const seen = new Set<string>();
    const options: ConsolidatedOption[] = [];
    const sources = [addList, extraList].filter(Boolean) as MenuModifierList[];

    for (const list of sources) {
      for (const mod of list.modifiers) {
        const key = normalize(mod.name);
        if (seen.has(key)) continue;
        const picked = pickModifier(addList, extraList, mod.name);
        if (picked) {
          seen.add(key);
          options.push({
            id: picked.mod.id,
            name: picked.mod.name,
            price: picked.mod.price,
            modifierListId: picked.list.id,
          });
        }
      }
    }
    return options;
  }

  const fruitOptions = buildOptions(addFruit, extraFruit);
  const vegOptions = buildOptions(addVeg, extraVeg);

  if (fruitOptions.length === 0 && vegOptions.length === 0) return null;

  const listMap = new Map<string, MenuModifierList>();
  for (const list of itemModifiers) {
    listMap.set(list.id, list);
  }

  return (
    <div className="pb-6 border-b border-neutral-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left"
      >
        <h2 className="text-lg font-semibold">
          Customize
        </h2>
        <span className="text-xl">{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-neutral-500">
            Add (not in smoothie): $1 • Extra (already included): $0.50
          </p>
          {fruitOptions.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {fruitOptions.map((opt) => {
                  const list = listMap.get(opt.modifierListId);
                  if (!list) return null;
                  const selected = selectedModifiers[list.id]?.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleModifier(list, opt.id)}
                      className={`px-4 py-2 rounded-full text-sm border transition ${
                        selected
                          ? "bg-[var(--color-orange)] text-black border-[var(--color-orange)]"
                          : "bg-white border-neutral-100 hover:border-neutral-200"
                      }`}
                    >
                      {opt.name}
                      <span className="ml-1 opacity-70">
                        +${(opt.price / 100).toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {vegOptions.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {vegOptions.map((opt) => {
                  const list = listMap.get(opt.modifierListId);
                  if (!list) return null;
                  const selected = selectedModifiers[list.id]?.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleModifier(list, opt.id)}
                      className={`px-4 py-2 rounded-full text-sm border transition ${
                        selected
                          ? "bg-[var(--color-orange)] text-black border-[var(--color-orange)]"
                          : "bg-white border-neutral-100 hover:border-neutral-200"
                      }`}
                    >
                      {opt.name}
                      <span className="ml-1 opacity-70">
                        +${(opt.price / 100).toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
