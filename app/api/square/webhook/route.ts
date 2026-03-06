import { NextRequest, NextResponse } from "next/server";
import { handleFuelOrder } from "@/lib/fuel/engine";
import { squareClient } from "@/lib/square/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("WEBHOOK BODY:", body);

    if (body.type !== "order.updated") {
      return NextResponse.json({ received: true });
    }

    const orderState = body?.data?.object?.order_updated?.state;

    if (orderState !== "COMPLETED") {
      return NextResponse.json({ received: true });
    }

    const orderId = body?.data?.id;

    if (!orderId) {
      console.log("No order id found");
      return NextResponse.json({ received: true });
    }

    console.log("Fetching order:", orderId);

    const orderResponse = await squareClient.orders.get(orderId);

    const order = orderResponse.order;

    if (!order) {
      console.log("Order retrieval failed");
      return NextResponse.json({ received: true });
    }

    console.log("Order retrieved:", order.id);

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