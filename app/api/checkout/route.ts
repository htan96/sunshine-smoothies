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

    // 🧾 Build line items
    const lineItems = items.map((item: any) => ({
      quantity: String(item.quantity),
      catalogObjectId: item.variationId,
      modifiers:
        item.modifiers?.map((mod: any) => ({
          catalogObjectId: mod.modifierId,
        })) || [],
    }));

    // 🚚 Scheduled Pickup Fulfillment
    const fulfillments = [
      {
        type: "PICKUP",
        state: "PROPOSED",
        pickupDetails: {
          scheduleType: "SCHEDULED",
          pickupAt: pickupTime, // Must be ISO string
          note: notes || "",
        },
      },
    ] as any;

    // ✅ STEP 1: Create Order (forces Square to calculate tax)
    const { order } = await squareClient.orders.create({
      idempotencyKey: randomUUID(),
      order: {
        locationId,
        lineItems,
        fulfillments,
      },
    });

    if (!order?.id) {
      throw new Error("Failed to create order");
    }

    // ✅ STEP 2: Create Payment Link using that order
const { paymentLink } =
  await squareClient.checkout.paymentLinks.create({
    idempotencyKey: randomUUID(),
    order: {
      id: order.id,
      locationId: locationId, // ✅ REQUIRED in your SDK version
    },
    checkoutOptions: {
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/ordersuccess`,
    },
  });

return NextResponse.json({
  url: paymentLink?.url,
});
  } catch (error) {
    console.error("Checkout error:", error);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}