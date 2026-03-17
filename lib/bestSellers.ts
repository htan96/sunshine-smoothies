import { SquareClient } from "square";
import { loadMenu } from "@/features/menu/loadMenu";

export type BestSellerItem = {
  id: string;
  name: string;
  image: string | null;
};

async function fetchRawCatalog(squareClient: SquareClient): Promise<any[]> {
  const objects: any[] = [];
  let cursor: string | undefined = undefined;
  do {
    const res = await squareClient.catalog.list({ cursor });
    const pageObjects = (res as any).objects ?? (res as any).result?.objects ?? [];
    objects.push(...pageObjects);
    cursor = (res as any).cursor ?? (res as any).result?.cursor ?? undefined;
  } while (cursor);
  return objects;
}

function buildVariationToItemFromRawCatalog(objects: any[]): Map<string, string> {
  const variationToItemId = new Map<string, string>();
  for (const obj of objects) {
    if (obj.type !== "ITEM" || obj.isDeleted) continue;
    const itemData = obj.itemData;
    if (!itemData?.variations) continue;
    for (const v of itemData.variations) {
      const vid = typeof v === "string" ? v : v?.id;
      if (vid) variationToItemId.set(vid, obj.id);
    }
  }
  return variationToItemId;
}

export async function getBestSellersItems(): Promise<BestSellerItem[]> {
  try {
    const locationIds =
      process.env.SQUARE_LOCATION_IDS?.split(",").filter(Boolean) ??
      (process.env.SQUARE_LOCATION_ID ? [process.env.SQUARE_LOCATION_ID] : []);

    const locationId = locationIds[0];
    if (!locationId || !process.env.SQUARE_ACCESS_TOKEN) {
      return getFallbackItems();
    }

    const squareClient = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN,
    });

    const [allOrders, rawCatalog, items] = await Promise.all([
      (async () => {
        const orders: any[] = [];
        let cursor: string | undefined = undefined;
        const startAt = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
        do {
          const res = await squareClient.orders.search({
            locationIds,
            cursor,
            limit: 500,
            query: {
              filter: {
                stateFilter: { states: ["COMPLETED"] },
                dateTimeFilter: { createdAt: { startAt } },
              },
              sort: { sortField: "CREATED_AT", sortOrder: "DESC" },
            },
          });
          orders.push(...(res.orders ?? []));
          cursor = res.cursor ?? undefined;
        } while (cursor);
        return orders;
      })(),
      fetchRawCatalog(squareClient),
      loadMenu(locationId),
    ]);

    const variationCounts: Record<string, number> = {};
    for (const order of allOrders) {
      for (const line of order.lineItems ?? []) {
        const id = line.catalogObjectId;
        if (id) {
          variationCounts[id] =
            (variationCounts[id] ?? 0) + Number(line.quantity ?? 1);
        }
      }
    }

    const variationToItemId = buildVariationToItemFromRawCatalog(rawCatalog);

    const itemSales: Record<string, number> = {};
    for (const [variationId, qty] of Object.entries(variationCounts)) {
      const itemId = variationToItemId.get(variationId);
      if (itemId) {
        itemSales[itemId] = (itemSales[itemId] ?? 0) + qty;
      }
    }

    const menuItemById = new Map(items.map((i) => [i.id, i]));
    const top = Object.entries(itemSales)
      .filter(([itemId]) => menuItemById.has(itemId))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([itemId]) => {
        const item = menuItemById.get(itemId)!;
        return { id: item.id, name: item.name, image: item.image };
      });

    if (top.length > 0) return top;

    const featured = items
      .filter((i) => i.categoryName?.toLowerCase().includes("smoothie"))
      .slice(0, 6);
    const toUse = featured.length >= 3 ? featured : items.slice(0, 6);
    return toUse.map((i) => ({
      id: i.id,
      name: i.name,
      image: i.image,
    }));
  } catch (err) {
    console.error("getBestSellersItems:", err);
    return getFallbackItems();
  }
}

async function getFallbackItems(): Promise<BestSellerItem[]> {
  try {
    const locationId =
      process.env.SQUARE_LOCATION_IDS?.split(",").filter(Boolean)[0] ??
      process.env.SQUARE_LOCATION_ID;
    if (!locationId || !process.env.SQUARE_ACCESS_TOKEN) return [];

    const items = await loadMenu(locationId);
    const featured = items
      .filter((i) => i.categoryName?.toLowerCase().includes("smoothie"))
      .slice(0, 6);
    const toUse = featured.length >= 3 ? featured : items.slice(0, 6);
    return toUse.map((i) => ({
      id: i.id,
      name: i.name,
      image: i.image,
    }));
  } catch {
    return [];
  }
}
