import { NextResponse } from "next/server";
import { fetchCatalogItemsWithStock } from "@/features/square/catalog";
import { transformCatalog } from "@/features/menu/transform";

export async function GET(req: Request) {
  try {
    // ✅ prefer query param, fallback to env
    const { searchParams } = new URL(req.url);
    const locationId =
      searchParams.get("location") ?? process.env.SQUARE_LOCATION_ID;

    if (!locationId) {
      return NextResponse.json(
        { error: "Missing location ID" },
        { status: 500 }
      );
    }

    // 1️⃣ Fetch catalog + stock info
    const { objects: catalogObjects, inStockVariationIds } =
      await fetchCatalogItemsWithStock(locationId);

    if (!catalogObjects || !catalogObjects.length) {
      return NextResponse.json(
        { categories: [], items: [] },
        { status: 200 }
      );
    }

    // 2️⃣ Transform into frontend-friendly structure (keeps items, marks sold out)
    const menu = transformCatalog(
      catalogObjects,
      locationId,
      inStockVariationIds
    );

    return NextResponse.json(menu, { status: 200 });
  } catch (error) {
    console.error("Square catalog fetch failed:", error);

    return NextResponse.json(
      { error: "Failed to fetch Square catalog" },
      { status: 500 }
    );
  }
}