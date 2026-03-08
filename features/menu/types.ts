// features/menu/types.ts

export type MenuVariation = {
  id: string;
  name: string;
  price: number;
  isSoldOut: boolean;          // ✅ NEW
  trackInventory?: boolean;    // (optional debug)
};

export type MenuModifier = {
  id: string;
  name: string;
  price: number;
  image?: string | null;   // ✅ add this
};

export type MenuModifierList = {
  id: string;
  name: string;
  min: number;
  max: number;
  allowQuantities: boolean;
  modifiers: MenuModifier[];
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

  // 🔎 TEMP DEBUG FIELDS
  isArchived?: boolean;
  presentAtAllLocations?: boolean;
  presentAtLocationIds?: string[];
};

export type MenuCategory = {
  id: string;
  name: string;
  ordinal: string;
};

export type MenuResponse = {
  categories: MenuCategory[];
  items: MenuItem[];
};