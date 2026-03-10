import { NextResponse } from "next/server";
import { SquareClient } from "square";
import { loadMenu } from "@/features/menu/loadMenu";

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
});

export async function GET() {

  try {

    const locationIds =
      process.env.SQUARE_LOCATION_IDS?.split(",") ?? [];

    const locationId = locationIds[0];

    const startAt = new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 30
    ).toISOString();

    let cursor: string | undefined = undefined;
    const allOrders: any[] = [];

    /*
    ==========================
    Fetch orders
    ==========================
    */

    do {

      const res = await squareClient.orders.search({
        locationIds,
        cursor,
        limit: 500,
        query: {
          filter: {
            dateTimeFilter: {
              createdAt: { startAt },
            },
          },
        },
      });

      allOrders.push(...(res.orders ?? []));

      cursor = res.cursor ?? undefined;

    } while (cursor);

    /*
    ==========================
    Count variation sales
    ==========================
    */

    const variationCounts: Record<string, number> = {};

    for (const order of allOrders) {
      for (const line of order.lineItems ?? []) {

        const id = line.catalogObjectId;
        if (!id) continue;

        variationCounts[id] =
          (variationCounts[id] ?? 0) +
          Number(line.quantity ?? 1);
      }
    }

/*
==========================
Fetch catalog
==========================
*/

const catalog = await (squareClient.catalog as any).search({
  query: {
    objectTypes: [
      "ITEM",
      "IMAGE",
      "CATEGORY",
      "MODIFIER_LIST",
      "ITEM_VARIATION",
    ],
  },
});

const objects = catalog.objects ?? [];

const { transformCatalog } = await import("@/features/menu/transform");

const { items } = transformCatalog(objects, locationId);
    /*
    ==========================
    Score items
    ==========================
    */

    const scored = items.map((item) => {

      let sales = 0;

      for (const variation of item.variations) {
        sales += variationCounts[variation.id] ?? 0;
      }

      return {
        id: item.id,
        name: item.name,
        image: item.image,
        sales,
      };
    });

    const topItems = scored
      .filter((i) => i.sales > 0)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 6);

    return NextResponse.json({
  success: true,
  ordersAnalyzed: allOrders.length,
  variationIds: Object.keys(variationCounts).slice(0, 10),
  menuItemsCount: items.length,
  firstMenuItem: items[0] ?? null,
  items: topItems,
});

  } catch (error) {

    console.error("Top sellers error:", error);

    return NextResponse.json({
      success: false,
      items: [],
    });

  }

}