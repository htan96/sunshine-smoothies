// features/square/inventory.ts
import { squareClient } from "./squareClient";

export async function fetchInStockVariationIds(
  variationIds: string[],
  locationId: string
): Promise<Set<string>> {
  if (!variationIds.length) return new Set();

  const chunkSize = 500;
  const inStock = new Set<string>();

  for (let i = 0; i < variationIds.length; i += chunkSize) {
    const chunk = variationIds.slice(i, i + chunkSize);

    const res: any = await squareClient.inventory.batchGetCounts({
      catalogObjectIds: chunk,
      locationIds: [locationId],
      states: ["IN_STOCK"],
    });

    const counts = res?.result?.counts ?? res?.counts ?? [];

    for (const c of counts) {
      const qty = Number(c.quantity ?? 0);
      if (qty > 0 && c.catalogObjectId) {
        inStock.add(c.catalogObjectId);
      }
    }
  }

  return inStock;
}