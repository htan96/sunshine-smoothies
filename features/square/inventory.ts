// features/square/inventory.ts

import { squareClient } from "./squareClient";

export async function fetchInStockVariationIds(
  variationIds: string[],
  locationId: string
): Promise<Set<string>> {
  if (!variationIds.length) return new Set();

  const inStock = new Set<string>();
  const chunkSize = 500;

  for (let i = 0; i < variationIds.length; i += chunkSize) {
    const chunk = variationIds.slice(i, i + chunkSize);

    // ✅ Use the method your inventory client supports
    // If TS complains here, tell me what IntelliSense shows under squareClient.inventory.
    const res: any = await (squareClient as any).inventory.batchGetCounts({
      catalogObjectIds: chunk,
      locationIds: [locationId],
      // states: ["IN_STOCK"], // keep off during debugging
    });

    const counts = res?.counts ?? res?.result?.counts ?? [];

    for (const c of counts) {
      const qty = Number(c.quantity ?? 0);
      if (qty > 0 && c.catalogObjectId) {
        inStock.add(c.catalogObjectId);
      }
    }
  }

  return inStock;
}