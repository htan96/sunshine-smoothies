// app/api/square/menu/inspect/route.ts

import { NextResponse } from "next/server";
import { squareClient } from "@/features/square/squareClient";

function jsonSafe(value: any) {
  return JSON.parse(
    JSON.stringify(value, (_key, v) =>
      typeof v === "bigint" ? v.toString() : v
    )
  );
}

export async function GET() {
  try {
    const targetId = "M7VL4YNWPGK5E453ORGSO7IE"; // Your ITEM ID

    const res = await squareClient.catalog.search({
      objectTypes: ["ITEM", "ITEM_VARIATION", "TAX"],
      includeRelatedObjects: true,
    });

    const combined = [
      ...(res.objects ?? []),
      ...(res.relatedObjects ?? []),
    ];

const item = combined.find(
  (o: any) => o?.id === targetId && o?.type === "ITEM"
) as any;

const taxIds =
  item && item.type === "ITEM"
    ? item.itemData?.taxIds ?? []
    : [];

    const taxObjects = combined.filter(
      (o: any) => o?.type === "TAX"
    );

    return NextResponse.json(
      jsonSafe({
        item,
        taxIds,
        taxObjects,
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}