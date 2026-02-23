import { NextResponse } from "next/server";
import { squareClient } from "@/features/square/squareClient";

export async function GET() {
  try {
    const response = await squareClient.catalog.list({
      types: "CATEGORY",
    });

    return NextResponse.json(response.data ?? []);
  } catch (error) {
    console.error("Category fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}