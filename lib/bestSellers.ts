import { SquareClient } from "square";
import { fetchCatalogItems, fetchFullCatalog } from "@/features/square/catalog";
import { loadMenu } from "@/features/menu/loadMenu";
import { transformCatalog } from "@/features/menu/transform";

export type BestSellerItem = {
  id: string;
  name: string;
  image: string | null;
};

async function getCatalogForVariationMap(): Promise<any[]> {
  const objects = await fetchFullCatalog();
  return objects as any[];
}

function buildVariationToItemFromRawCatalog(objects: any[]): Map<string, string> {
  const variationToItemId = new Map<string, string>();
  for (const obj of objects) {
    if (obj.isDeleted) continue;
    if (obj.type === "ITEM") {
      const itemData = obj.itemData;
      if (!itemData?.variations) continue;
      for (const v of itemData.variations) {
        const vid = typeof v === "string" ? v : v?.id;
        if (vid) variationToItemId.set(vid, obj.id);
      }
    } else if (obj.type === "ITEM_VARIATION") {
      const vData = obj.itemVariationData;
      const itemId = vData?.itemId ?? vData?.item_id;
      if (obj.id && itemId) variationToItemId.set(obj.id, itemId);
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

    const [allOrders, rawCatalogForMap, catalogForMenu] = await Promise.all([
      (async () => {
        const orders: any[] = [];
        let cursor: string | undefined = undefined;
        const startAt = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString();
        const maxPages = 3;
        let pageCount = 0;
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
          pageCount++;
          if (pageCount >= maxPages || !cursor) break;
        } while (cursor);
        return orders;
      })(),
      getCatalogForVariationMap(),
      fetchCatalogItems(),
    ]);

    const variationToItemId = buildVariationToItemFromRawCatalog(rawCatalogForMap);
    const { items } = transformCatalog(catalogForMenu as any[], locationId);

    if (items.length === 0) {
      return getFallbackItems();
    }

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

    // Debug: uncomment to see in terminal when loading home page
    // console.log("[BestSellers] orders:", allOrders.length, "variations in orders:", Object.keys(variationCounts).length, "variation->item map:", variationToItemId.size);

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
      .filter((i) => {
        const cat = (i.categoryName ?? "").toLowerCase();
        return cat.includes("smoothie") || cat.includes("juice") || cat.includes("drink");
      })
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
      .filter((i) => {
        const cat = (i.categoryName ?? "").toLowerCase();
        return cat.includes("smoothie") || cat.includes("juice") || cat.includes("drink");
      })
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
