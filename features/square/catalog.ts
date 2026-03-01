// features/square/catalog.ts

import { squareClient } from "./squareClient";
import type { CatalogObject } from "square";
import { fetchInStockVariationIds } from "./inventory";

export async function fetchCatalogItems(): Promise<CatalogObject[]> {
  const response = await squareClient.catalog.search({
    objectTypes: ["ITEM"],
    includeRelatedObjects: true,
  });

  const objects = response.objects ?? [];
  const related = response.relatedObjects ?? [];
  const combined = [...objects, ...related];

  const uniqueObjects = Array.from(
    new Map(combined.map((obj) => [obj.id, obj])).values()
  );

  return uniqueObjects;
}

// Optional: stock wrapper (only useful when trackInventory = true)
export async function fetchCatalogItemsWithStock(locationId: string): Promise<{
  objects: CatalogObject[];
  inStockVariationIds: Set<string>;
}> {
  const objects: any[] = await fetchCatalogItems();

  // Variations nested under ITEM.itemData.variations
  const variationIds: string[] = [];
  for (const obj of objects) {
    if (obj.type === "ITEM" && obj.itemData?.variations) {
      for (const v of obj.itemData.variations) {
        if (v?.id) variationIds.push(v.id);
      }
    }
  }

  const inStockVariationIds = await fetchInStockVariationIds(
    variationIds,
    locationId
  );

  return { objects, inStockVariationIds };
}