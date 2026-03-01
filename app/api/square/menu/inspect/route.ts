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
    const targetId = "M7VL4YNWPGK5E453ORGSO7IE";

    const res = await squareClient.catalog.search({
      objectTypes: ["ITEM"],
      includeRelatedObjects: true,
    });

    const combined = [...(res.objects ?? []), ...(res.relatedObjects ?? [])];
    const match = combined.find((o: any) => o?.id === targetId) ?? null;

    return NextResponse.json(
      jsonSafe({
        targetId,
        totals: {
          objects: res.objects?.length ?? 0,
          related: res.relatedObjects?.length ?? 0,
          combined: combined.length,
        },
        match,
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}