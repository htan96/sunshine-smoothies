// features/square/catalog.ts

import { squareClient } from "./squareClient";
import type { CatalogObject } from "square";

export async function fetchCatalogItems(): Promise<CatalogObject[]> {
  const response = await squareClient.catalog.search({
    objectTypes: ["ITEM"],
    includeRelatedObjects: true,
  });

  const objects = response.objects ?? [];
  const related = response.relatedObjects ?? [];

  // Combine primary + related
  const combined = [...objects, ...related];

  // 🔥 Dedupe by object ID (prevents duplicate categories/images/modifiers)
  const uniqueObjects = Array.from(
    new Map(combined.map((obj) => [obj.id, obj])).values()
  );

  return uniqueObjects;
}