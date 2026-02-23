import { NextResponse } from "next/server";
import { fetchCatalogItems } from "@/features/square/catalog";

export async function GET() {
  try {
    const items = await fetchCatalogItems();

    console.log("FIRST ITEM FULL OBJECT:");
    console.dir(items[0], { depth: 5 });

    return NextResponse.json({
      success: true,
      totalItems: items.length,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
