import { NextResponse } from "next/server";
import { fetchCatalogItems } from "@/features/square/catalog";
import { transformCatalog } from "@/features/menu/transform";

export async function GET() {
  try {
    // 1️⃣ Fetch raw Square catalog objects
    const catalogObjects = await fetchCatalogItems();

    if (!catalogObjects || !catalogObjects.length) {
      return NextResponse.json([], { status: 200 });
    }

    // 2️⃣ Transform into frontend-friendly structure
    const menuItems = transformCatalog(catalogObjects);

    return NextResponse.json(menuItems, { status: 200 });

  } catch (error) {
    console.error("Square catalog fetch failed:", error);

    return NextResponse.json(
      { error: "Failed to fetch Square catalog" },
      { status: 500 }
    );
  }
}