import { NextResponse } from "next/server";
import { getBestSellersItems } from "@/lib/bestSellers";
import { SquareClient } from "square";
import { fetchCatalogItems } from "@/features/square/catalog";
import { loadMenu } from "@/features/menu/loadMenu";

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

export async function GET() {
  try {
    const locationIds =
      process.env.SQUARE_LOCATION_IDS?.split(",").filter(Boolean) ??
      (process.env.SQUARE_LOCATION_ID ? [process.env.SQUARE_LOCATION_ID] : []);

    const locationId = locationIds[0];
    if (!locationId || !process.env.SQUARE_ACCESS_TOKEN) {
      return NextResponse.json({
        error: "Missing SQUARE_LOCATION_ID or SQUARE_ACCESS_TOKEN",
        config: { locationIds, hasToken: !!process.env.SQUARE_ACCESS_TOKEN },
      });
    }

    const squareClient = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN!,
    });

    const startAt = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
    const orders: any[] = [];
    let cursor: string | undefined = undefined;

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

    const variationCounts: Record<string, number> = {};
    const sampleCatalogIds: string[] = [];
    for (const order of orders) {
      for (const line of order.lineItems ?? []) {
        const id = line.catalogObjectId;
        if (id) {
          variationCounts[id] = (variationCounts[id] ?? 0) + Number(line.quantity ?? 1);
          if (sampleCatalogIds.length < 5) sampleCatalogIds.push(id);
        }
      }
    }

    const rawCatalog = await fetchCatalogItems();
    const variationToItemId = buildVariationToItemFromRawCatalog(rawCatalog as any);
    const items = await loadMenu(locationId);

    const itemSales: Record<string, number> = {};
    for (const [variationId, qty] of Object.entries(variationCounts)) {
      const itemId = variationToItemId.get(variationId);
      if (itemId) itemSales[itemId] = (itemSales[itemId] ?? 0) + qty;
    }

    const menuItemById = new Map(items.map((i) => [i.id, i]));
    const top = Object.entries(itemSales)
      .filter(([itemId]) => menuItemById.has(itemId))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([itemId, sales]) => {
        const item = menuItemById.get(itemId)!;
        return { id: item.id, name: item.name, sales };
      });

    const unmatchedCount = Object.keys(variationCounts).filter(
      (id) => !variationToItemId.has(id)
    ).length;

    return NextResponse.json({
      ordersCount: orders.length,
      variationIdsInOrders: Object.keys(variationCounts).length,
      variationToItemMapSize: variationToItemId.size,
      unmatchedVariationIds: unmatchedCount,
      sampleCatalogIdsFromOrders: sampleCatalogIds,
      sampleMapped: sampleCatalogIds.map((id) => ({
        id,
        mapsToItem: variationToItemId.get(id) ?? null,
      })),
      itemSalesCount: Object.keys(itemSales).length,
      topItems: top,
      menuItemsCount: items.length,
      result: await getBestSellersItems(),
    });
  } catch (err) {
    console.error("Debug best-sellers error:", err);
    return NextResponse.json(
      { error: String(err), stack: err instanceof Error ? err.stack : undefined },
      { status: 500 }
    );
  }
}
