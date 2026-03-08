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
      objectTypes: ["ITEM", "MODIFIER_LIST"]
    });

    const cleaned = cleanBigInt(response);
    const objects = cleaned.objects || [];

    // Separate items + modifier lists
    const items = objects.filter((o: any) => o.type === "ITEM");
    const modifierLists = objects.filter((o: any) => o.type === "MODIFIER_LIST");

    // Create lookup for modifier lists
    const modifierMap: Record<string, any> = {};

    modifierLists.forEach((list: any) => {
      modifierMap[list.id] = {
        id: list.id,
        name: list.modifierListData?.name,
        modifiers:
          list.modifierListData?.modifiers?.map((m: any) => ({
            id: m.id,
            name: m.modifierData?.name,
            price: m.modifierData?.priceMoney?.amount || 0
          })) || []
      };
    });

    // Build final debug output
    const result = items.map((item: any) => ({
      name: item.itemData?.name,
      itemId: item.id,
      variationId: item.itemData?.variations?.[0]?.id,

      modifierLists:
        item.itemData?.modifierListInfo?.map((info: any) => ({
          id: info.modifierListId,
          name: modifierMap[info.modifierListId]?.name || "Unknown",
          modifiers: modifierMap[info.modifierListId]?.modifiers || []
        })) || []
    }));

    return NextResponse.json(result);

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch catalog" });
  }
}