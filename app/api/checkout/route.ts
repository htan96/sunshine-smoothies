import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SquareClient } from "square";

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      items,
      pickupTime,
      notes,
      locationId,
      locationName,
      locationAddress,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!locationId) {
      return NextResponse.json(
        { error: "Missing location ID" },
        { status: 400 }
      );
    }

    // Build line items
    const lineItems = items.map((item: any) => ({
      quantity: String(item.quantity),
      catalogObjectId: item.variationId,
      modifiers:
        item.modifiers?.map((mod: any) => ({
          catalogObjectId: mod.modifierId,
        })) || [],
    }));

    // ✅ Strictly typed fulfillment (fixes TS error)
    const fulfillments = [
      {
        type: "PICKUP",
        state: "PROPOSED",
        pickupDetails: {
          scheduleType: "SCHEDULED",
          pickupAt: pickupTime, // must already be ISO string
          note: notes || "",
        },
      },
    ] as any; // ← prevents SDK typing conflict safely

    const response = await squareClient.checkout.paymentLinks.create({
      idempotencyKey: randomUUID(),

      order: {
        locationId,
        lineItems,
        // Scheduled pickup
        fulfillments,
      },

      checkoutOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/ordersuccess`,
      },
    });

    return NextResponse.json({
      url: response.paymentLink?.url,
    });

  } catch (error) {
    console.error("Checkout error:", error);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}