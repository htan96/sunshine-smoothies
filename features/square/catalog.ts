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

  // Dedupe by object ID
  return Array.from(new Map(combined.map((obj) => [obj.id, obj])).values());
}

export async function fetchCatalogItemsWithStock(locationId: string): Promise<{
  objects: CatalogObject[];
  inStockVariationIds: Set<string>;
}> {
  const objects = await fetchCatalogItems();

  const variationIds = objects
    .filter((o: any) => o.type === "ITEM_VARIATION")
    .map((o: any) => o.id);

  const inStockVariationIds = await fetchInStockVariationIds(
    variationIds,
    locationId
  );

  return { objects, inStockVariationIds };
}