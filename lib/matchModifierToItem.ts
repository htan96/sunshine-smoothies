import type { MenuItem } from "@/features/menu/types";

/**
 * Match a modifier (e.g. "Mango Madness") to a menu item by name.
 * Used for fuel pack drinks: show the actual drink's name and photo.
 */
export function matchModifierToMenuItem(
  modifierName: string,
  items: MenuItem[]
): MenuItem | null {
  const mod = modifierName.trim();
  if (!mod) return null;

  const modLower = mod.toLowerCase();
  const drinkCategories = ["smoothie", "juice", "smoothies", "juices"];

  function isLikelyDrink(item: MenuItem): boolean {
    const cat = item.categoryName?.toLowerCase() ?? "";
    return drinkCategories.some((c) => cat.includes(c));
  }

  function preferDrinks<T extends MenuItem>(arr: T[]): T[] {
    const drinks = arr.filter(isLikelyDrink);
    return drinks.length > 0 ? drinks : arr;
  }

  // 1. Exact match (case-insensitive)
  const exact = items.find(
    (i) => i.name.toLowerCase() === modLower
  );
  if (exact) return exact;

  // 2. Item name contains modifier (e.g. modifier "Mango Madness" matches item "Mango Madness Smoothie")
  const containsMatches = items.filter(
    (i) =>
      i.name.toLowerCase().includes(modLower) ||
      modLower.includes(i.name.toLowerCase())
  );
  const contains = preferDrinks(containsMatches)[0];
  if (contains) return contains;

  // 3. Normalized match (strip common suffixes)
  const strip = (s: string) =>
    s
      .toLowerCase()
      .replace(/\s*(smoothie|juice|drink)\s*$/i, "")
      .trim();
  const modStripped = strip(mod);
  const normalizedMatches = items.filter((i) => {
    const itemStripped = strip(i.name);
    return itemStripped === modStripped || itemStripped.includes(modStripped);
  });
  const normalized = preferDrinks(normalizedMatches)[0];
  if (normalized) return normalized;

  // 4. Fuzzy: any item whose name starts with or contains the modifier
  const fuzzyMatches = items.filter((i) => {
    const n = i.name.toLowerCase();
    return n.startsWith(modLower) || modLower.startsWith(n);
  });
  const fuzzy = preferDrinks(fuzzyMatches)[0];
  if (fuzzy) return fuzzy;

  return null;
}
