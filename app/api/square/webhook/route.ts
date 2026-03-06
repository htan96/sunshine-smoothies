import { NextRequest, NextResponse } from "next/server";
import { handleFuelOrder } from "@/lib/fuel/engine";
import { squareClient } from "@/lib/square/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("WEBHOOK BODY:", body);

    // Only process order.updated events
    if (body.type !== "order.updated") {
      return NextResponse.json({ received: true });
    }

    const orderState = body?.data?.object?.order_updated?.state;

    // Ignore updates until order is completed
    if (orderState !== "COMPLETED") {
      return NextResponse.json({ received: true });
    }

    const orderId = body?.data?.id;

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    // Retrieve full order from Square
    const orderResponse = await squareClient.orders.get(orderId);

    const order = orderResponse.order;

    if (!order) {
      return NextResponse.json({ received: true });
    }

    await handleFuelOrder(order);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}