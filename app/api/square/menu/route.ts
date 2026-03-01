// app/api/square/menu/route.ts

import { NextResponse } from "next/server";
import { fetchCatalogItems } from "@/features/square/catalog";
import { transformCatalog } from "@/features/menu/transform";

function jsonSafe(value: any) {
  return JSON.parse(
    JSON.stringify(value, (_key, v) =>
      typeof v === "bigint" ? v.toString() : v
    )
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locationId =
      searchParams.get("location") ?? process.env.SQUARE_LOCATION_ID;

    if (!locationId) {
      return NextResponse.json({ error: "Missing location ID" }, { status: 500 });
    }

    const catalogObjects = await fetchCatalogItems();

    if (!catalogObjects?.length) {
      return NextResponse.json({ categories: [], items: [] }, { status: 200 });
    }

    const menu = transformCatalog(catalogObjects, locationId);

    return NextResponse.json(jsonSafe(menu), { status: 200 });
  } catch (error) {
    console.error("Square catalog fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch Square catalog" },
      { status: 500 }
    );
  }
}