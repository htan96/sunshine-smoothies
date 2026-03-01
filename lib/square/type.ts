// features/menu/types.ts

export type MenuCategory = {
  id: string;
  name: string;
  ordinal: string;
};

export type MenuModifier = {
  id: string;
  name: string;
  price: number;
};

export type MenuModifierList = {
  id: string;
  name: string;
  min: number;
  max: number;
  allowQuantities: boolean;
  modifiers: MenuModifier[];
};

export type MenuVariation = {
  id: string;
  name: string;
  price: number;
  soldOut?: boolean; // ✅ NEW
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  categoryId: string | null;
  categoryName: string;
  variations: MenuVariation[];
  modifiers: MenuModifierList[];

  soldOut?: boolean; // ✅ NEW

  // TEMP DEBUG FIELDS (optional – keep if you want)
  isArchived?: boolean;
  presentAtAllLocations?: boolean;
  presentAtLocationIds?: string[];
};