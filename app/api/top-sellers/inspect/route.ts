import { NextResponse } from "next/server";
import { SquareClient } from "square";
import { loadMenu } from "@/features/menu/loadMenu";

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
});

function jsonSafe(value: unknown) {
  return JSON.parse(
    JSON.stringify(value, (_key, v) =>
      typeof v === "bigint" ? v.toString() : v
    )
  );
}

export async function GET() {
  try {
    const locationIds =
      process.env.SQUARE_LOCATION_IDS?.split(",").filter(Boolean) ??
      (process.env.SQUARE_LOCATION_ID ? [process.env.SQUARE_LOCATION_ID] : []);
    const locationId = locationIds[0];

    const startAt = new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 30
    ).toISOString();

    const config = {
      locationIds,
      locationId: locationId ?? "(none)",
      dateRange: "last 30 days",
      startAt,
      hasToken: !!process.env.SQUARE_ACCESS_TOKEN,
    };

    if (!locationId || locationIds.length === 0) {
      return NextResponse.json(
        jsonSafe({ config, error: "SQUARE_LOCATION_IDS not configured" }),
        { status: 200 }
      );
    }

    /*
     * Fetch orders
     */
    let cursor: string | undefined = undefined;
    const allOrders: any[] = [];

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
     * Variation counts from orders
     */
    const variationCounts: Record<string, number> = {};
    const sampleLineItems: Array<{
      catalogObjectId: string;
      quantity: number;
      name?: string;
    }> = [];

    for (const order of allOrders) {
      for (const line of order.lineItems ?? []) {
        const variationId = line.catalogObjectId;
        if (!variationId) continue;

        variationCounts[variationId] =
          (variationCounts[variationId] ?? 0) + Number(line.quantity ?? 1);

        if (sampleLineItems.length < 10) {
          sampleLineItems.push({
            catalogObjectId: variationId,
            quantity: Number(line.quantity ?? 1),
            name: line.name,
          });
        }
      }
    }

    /*
     * Load menu and build variation → item map
     */
    const items = await loadMenu(locationId);

    const variationToItem: Record<string, { itemId: string; itemName: string; variationName: string }> = {};
    for (const item of items) {
      for (const v of item.variations) {
        variationToItem[v.id] = {
          itemId: item.id,
          itemName: item.name,
          variationName: v.name,
        };
      }
    }

    /*
     * Score each item
     */
    const scored = items.map((item) => {
      let totalQuantity = 0;
      const breakdown: Array<{ variationId: string; variationName: string; qty: number }> = [];
      for (const variation of item.variations) {
        const qty = variationCounts[variation.id] ?? 0;
        totalQuantity += qty;
        if (qty > 0) {
          breakdown.push({
            variationId: variation.id,
            variationName: variation.name,
            qty,
          });
        }
      }
      return {
        id: item.id,
        name: item.name,
        sales: totalQuantity,
        breakdown: breakdown.length ? breakdown : undefined,
      };
    });

    const withSales = scored.filter((s) => s.sales > 0);
    const top6 = [...withSales].sort((a, b) => b.sales - a.sales).slice(0, 6);

    /*
     * Variation IDs in orders that DON'T match any menu variation
     */
    const orderVariationIds = new Set(Object.keys(variationCounts));
    const menuVariationIds = new Set(
      items.flatMap((i) => i.variations.map((v) => v.id))
    );
    const unmatchedVariationIds = [...orderVariationIds].filter(
      (id) => !menuVariationIds.has(id)
    );

    return NextResponse.json(
      jsonSafe({
        config,
        summary: {
          ordersCount: allOrders.length,
          uniqueVariationIdsInOrders: orderVariationIds.size,
          menuItemsCount: items.length,
          menuVariationIdsCount: menuVariationIds.size,
          itemsWithSales: withSales.length,
          unmatchedVariationIdsCount: unmatchedVariationIds.length,
        },
        sampleLineItemsFromOrders: sampleLineItems,
        variationCountsTop20: Object.entries(variationCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([id, qty]) => ({
            variationId: id,
            quantity: qty,
            mappedToItem: variationToItem[id],
          })),
        unmatchedVariationIds: unmatchedVariationIds.slice(0, 10),
        top6Scored: top6,
        allScoredWithSales: withSales,
        usedFallback: withSales.length === 0,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Top sellers inspect error:", error);
    return NextResponse.json(
      jsonSafe({ error: String(error) }),
      { status: 500 }
    );
  }
}
