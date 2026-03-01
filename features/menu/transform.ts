// features/menu/transform.ts

import {
  MenuItem,
  MenuVariation,
  MenuModifier,
  MenuModifierList,
  MenuCategory,
} from "./types";

export function transformCatalog(
  objects: any[],
  locationId: string
): { categories: MenuCategory[]; items: MenuItem[] } {
  const modifierListMap = new Map<string, MenuModifierList>();
  const categoryMap = new Map<string, string>();
  const imageMap = new Map<string, string>();

  const categories: MenuCategory[] = [];

  /*
  ==========================
  Build Categories
  ==========================
  */
  for (const obj of objects) {
    if (obj.type === "CATEGORY" && obj.categoryData) {
      if (categoryMap.has(obj.id)) continue;

      const category: MenuCategory = {
        id: obj.id,
        name: obj.categoryData.name,
        ordinal: obj.categoryData.ordinal ?? "0",
      };

      categories.push(category);
      categoryMap.set(obj.id, obj.categoryData.name);
    }
  }

  /*
  ==========================
  Build Modifier Lists
  ==========================
  */
  for (const obj of objects) {
    if (obj.type !== "MODIFIER_LIST" || !obj.modifierListData) continue;

    const modifiers: MenuModifier[] = (obj.modifierListData.modifiers ?? [])
      .map((mod: any): MenuModifier | null => {
        if (!mod.modifierData) return null;

        return {
          id: mod.id,
          name: mod.modifierData.name ?? "Unnamed",
          price: Number(mod.modifierData.priceMoney?.amount ?? 0),
        };
      })
      .filter((m: MenuModifier | null): m is MenuModifier => m !== null);

    modifierListMap.set(obj.id, {
      id: obj.id,
      name: obj.modifierListData.name ?? "Options",
      min: Number(obj.modifierListData.minSelectedModifiers ?? 0),
      max: Number(obj.modifierListData.maxSelectedModifiers ?? 0),
      allowQuantities: obj.modifierListData.allowQuantities ?? false,
      modifiers,
    });
  }

  /*
  ==========================
  Build Image Map
  ==========================
  */
  for (const obj of objects) {
    if (obj.type === "IMAGE" && obj.imageData) {
      imageMap.set(obj.id, obj.imageData.url);
    }
  }

  /*
  ==========================
  Build Items
  ==========================
  */
  const items: MenuItem[] = [];

  for (const obj of objects) {
    if (obj.type !== "ITEM") continue;
    if (obj.isDeleted) continue;

    const itemData = obj.itemData;
    if (!itemData) continue;

    // ❌ Skip archived
    if (itemData.isArchived) continue;

    // ❌ Skip if not available at location
    const isAtLocation =
      obj.presentAtAllLocations ||
      (obj.presentAtLocationIds ?? []).includes(locationId);

    if (!isAtLocation) continue;

    /*
    -------------------------
    Variations
    -------------------------
    */
    const variationsAll: MenuVariation[] = (itemData.variations ?? [])
      .map((variation: any): MenuVariation | null => {
        if (variation.type !== "ITEM_VARIATION" || !variation.itemVariationData)
          return null;

        if (variation.isDeleted) return null;

        const v = variation.itemVariationData;
        const amount = v.priceMoney?.amount;

        // Some items might not have a price in catalog
        if (amount == null) return null;

        // ✅ Square “sold out” override lives here
        const override = (v.locationOverrides ?? []).find(
          (o: any) => o.locationId === locationId
        );

        const isSoldOut = override?.soldOut ?? false;

        return {
          id: variation.id,
          name: v.name ?? "Default",
          price: Number(amount),
          isSoldOut,
          trackInventory: v.trackInventory ?? false, // (optional debug)
        };
      })
      .filter((v: MenuVariation | null): v is MenuVariation => v !== null);

    if (!variationsAll.length) continue;

    // ✅ Hide sold-out variations (recommended)
    const variations = variationsAll.filter((v) => !v.isSoldOut);

    // ✅ If ALL variations sold out, hide the entire item
    if (!variations.length) continue;

    /*
    -------------------------
    Modifiers
    -------------------------
    */
    const modifiers: MenuModifierList[] = (itemData.modifierListInfo ?? [])
      .map((info: any) => modifierListMap.get(info.modifierListId))
      .filter((m: MenuModifierList | undefined): m is MenuModifierList => m !== undefined);

    /*
    -------------------------
    Category
    -------------------------
    */
    const categoryId = itemData.categories?.[0]?.id ?? null;

    const categoryName =
      (categoryId && categoryMap.get(categoryId)) || "Uncategorized";

    /*
    -------------------------
    Image
    -------------------------
    */
    const imageId = itemData.imageIds?.[0] ?? null;
    const image = (imageId && imageMap.get(imageId)) ?? null;

    /*
    -------------------------
    Push Final Item
    -------------------------
    */
    items.push({
      id: obj.id,
      name: itemData.name ?? "Unnamed Item",
      description: itemData.description ?? "",
      image,
      categoryId,
      categoryName,
      variations,
      modifiers,

      // TEMP DEBUG FIELDS
      isArchived: itemData.isArchived ?? false,
      presentAtAllLocations: obj.presentAtAllLocations ?? false,
      presentAtLocationIds: obj.presentAtLocationIds ?? [],
    });
  }

  /*
  ==========================
  Filter Categories By Location
  ==========================
  */
  const categoryIdsWithItems = new Set(
    items.map((item) => item.categoryId).filter((id): id is string => Boolean(id))
  );

  const filteredCategories = categories.filter((cat) =>
    categoryIdsWithItems.has(cat.id)
  );

  return {
    categories: filteredCategories,
    items,
  };
}