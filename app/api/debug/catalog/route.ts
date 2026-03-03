import { NextResponse } from "next/server";
import { squareClient } from "@/lib/square/client";

export async function GET() {
  const response = await squareClient.catalog.list({
    types: "ITEM",
  });

  const safe = JSON.parse(
    JSON.stringify(response, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  const objects = safe.response?.objects || [];

  const names = objects.map((obj: any) => obj.itemData?.name);

  return NextResponse.json(names);
}