import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SquareClient } from "square";

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { items, pickupTime, notes, locationId } = body;

    if (!items?.length) {
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

    const lineItems = items.map((item: any) => ({
      quantity: String(item.quantity),
      catalogObjectId: item.variationId,
      modifiers:
        item.modifiers?.map((mod: any) => ({
          catalogObjectId: mod.modifierId,
        })) || [],
    }));

    const fulfillments = [
      {
        type: "PICKUP",
        state: "PROPOSED",
        pickupDetails: {
          scheduleType: "SCHEDULED",
          pickupAt: pickupTime,
          note: notes || "",
        },
      },
    ] as any;

    // STEP 1: Create order (this triggers tax calculation)
    const orderResponse = await squareClient.orders.create({
      idempotencyKey: randomUUID(),
      order: {
        locationId,
        lineItems,
        fulfillments,
      },
    });

    const createdOrder = orderResponse.order;

    if (!createdOrder?.id) {
      throw new Error("Order creation failed");
    }

    // STEP 2: Create payment link using FULL order object
const { paymentLink } =
  await squareClient.checkout.paymentLinks.create({
    idempotencyKey: randomUUID(),
    order: {
      locationId,
      lineItems,
      fulfillments,
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