import { NextRequest, NextResponse } from "next/server";
import { fetchCatalogItems } from "@/features/square/catalog";
import { transformCatalog } from "@/features/menu/transform";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get("location");

    if (!locationId) {
      return NextResponse.json(
        { error: "Location required" },
        { status: 400 }
      );
    }

    // Fetch raw catalog from Square
    const objects = await fetchCatalogItems();

    // Transform catalog (returns { items, categories })
    const { items, categories } = transformCatalog(
      objects,
      locationId
    );

    return NextResponse.json({
      items,
      categories,
    });
  } catch (error) {
    console.error("Catalog error:", error);

    return NextResponse.json(
      { error: "Failed to fetch catalog" },
      { status: 500 }
    );
  }
}