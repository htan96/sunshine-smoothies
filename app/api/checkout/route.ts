import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  SquareClient,
  FulfillmentType,
  FulfillmentState,
  FulfillmentPickupDetailsScheduleType,
} from "square";

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, pickupTime, notes, locationId } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!locationId) {
      return NextResponse.json({ error: "Missing location ID" }, { status: 400 });
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
        type: FulfillmentType.Pickup,
        state: FulfillmentState.Proposed,
        pickupDetails: {
          scheduleType: FulfillmentPickupDetailsScheduleType.Scheduled,
          pickupAt: pickupTime,
          note: notes || "",
          recipient: {
            displayName: "Pickup Customer",
          },
        },
      },
    ];

    // ✅ STEP 1 — Create order (forces tax calculation)
    const orderResponse = await squareClient.orders.create({
      idempotencyKey: randomUUID(),
      order: {
        locationId,
        lineItems,
        fulfillments,
        pricingOptions: {
          autoApplyTaxes: true,
          autoApplyDiscounts: true,
        },
      },
    });

    const createdOrder = orderResponse.order;

    if (!createdOrder?.id) {
      throw new Error("Order creation failed");
    }

    console.log("ORDER TOTALS:", createdOrder.totalMoney);
    console.log("ORDER TAXES:", createdOrder.taxes);

    // ✅ STEP 2 — Create payment link using that order
const paymentLinkResponse =
  await squareClient.checkout.paymentLinks.create({
    idempotencyKey: randomUUID(),
    order: {
      locationId,
      lineItems,
      fulfillments,
      pricingOptions: {
        autoApplyTaxes: true,
        autoApplyDiscounts: true,
      },
    },
    checkoutOptions: {
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/ordersuccess`,
    },
  });
    const paymentLink = paymentLinkResponse.paymentLink;

    return NextResponse.json({
      url: paymentLink?.url,
      orderId: createdOrder.id,
    });

  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}