import { NextResponse } from "next/server";
import { squareClient } from "@/lib/square/client";

function cleanBigInt(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function GET() {
  try {
    const response: any = await squareClient.catalog.search({
      objectTypes: ["ITEM"]
    });

    const cleaned = cleanBigInt(response);
    const objects = cleaned.objects || [];

    const items = objects.map((item: any) => ({
      name: item.itemData?.name,
      itemId: item.id,
      variationId: item.itemData?.variations?.[0]?.id,

      // 👇 THIS IS WHAT WE NEED
      modifierLists: item.itemData?.modifierListInfo || []
    }));

    return NextResponse.json(items);

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch catalog" });
  }
}