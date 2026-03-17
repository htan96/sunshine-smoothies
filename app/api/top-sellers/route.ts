import { NextResponse } from "next/server";
import { SquareClient } from "square";
import { loadMenu } from "@/features/menu/loadMenu";

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
});

export async function GET() {

  try {

    const locationIds =
      process.env.SQUARE_LOCATION_IDS?.split(",").filter(Boolean) ??
      (process.env.SQUARE_LOCATION_ID ? [process.env.SQUARE_LOCATION_ID] : []);

    const locationId = locationIds[0];

    if (!locationId || locationIds.length === 0) {
      return NextResponse.json({
        success: false,
        items: [],
        error: "SQUARE_LOCATION_IDS or SQUARE_LOCATION_ID not configured",
      });
    }

    const startAt = new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 30
    ).toISOString();

    let cursor: string | undefined = undefined;
    const allOrders: any[] = [];

    /*
    ==========================
    Fetch orders (COMPLETED only, sorted by created_at)
    ==========================
    */

    do {
      const res = await squareClient.orders.search({
        locationIds,
        cursor,
        limit: 500,
        query: {
          filter: {
            stateFilter: { states: ["COMPLETED"] },
            dateTimeFilter: {
              createdAt: { startAt },
            },
          },
          sort: {
            sortField: "CREATED_AT",
            sortOrder: "DESC",
          },
        },
      });

      allOrders.push(...(res.orders ?? []));

      cursor = res.cursor ?? undefined;

    } while (cursor);

    /*
    ==========================
    Count quantity per variation (Square line items use variation ID)
    ==========================
    */

    const variationCounts: Record<string, number> = {};

    for (const order of allOrders) {
      for (const line of order.lineItems ?? []) {
        const variationId = line.catalogObjectId;
        if (!variationId) continue;

        variationCounts[variationId] =
          (variationCounts[variationId] ?? 0) + Number(line.quantity ?? 1);
      }
    }

    /*
    ==========================
    Load catalog (same source as menu for consistency)
    ==========================
    */

    const items = await loadMenu(locationId);

    /*
    ==========================
    Aggregate by item (sum all sizes/variations)
    ==========================
    */

    const scored = items.map((item) => {
      let totalQuantity = 0;
      for (const variation of item.variations) {
        totalQuantity += variationCounts[variation.id] ?? 0;
      }
      return {
        id: item.id,
        name: item.name,
        image: item.image,
        sales: totalQuantity,
      };
    });

    let topItems = scored
      .filter((i) => i.sales > 0)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 6);

    // Fallback: when no sales data, show featured items from menu
    if (topItems.length === 0) {
      topItems = items
        .filter((i) => i.categoryName?.toLowerCase().includes("smoothie"))
        .slice(0, 6)
        .map((i) => ({
          id: i.id,
          name: i.name,
          image: i.image ?? null,
          sales: 0,
        }));
      if (topItems.length === 0) {
        topItems = items.slice(0, 6).map((i) => ({
          id: i.id,
          name: i.name,
          image: i.image ?? null,
          sales: 0,
        }));
      }
    }

    return NextResponse.json({
      success: true,
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