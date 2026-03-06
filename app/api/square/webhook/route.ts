import { NextRequest, NextResponse } from "next/server";
import { handleFuelOrder } from "@/lib/fuel/engine";
import { squareClient } from "@/lib/square/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("WEBHOOK BODY:", JSON.stringify(body, null, 2));

    if (body.type !== "order.updated") {
      return NextResponse.json({ received: true });
    }

    const orderState = body?.data?.object?.order_updated?.state;

    // Only run when order is finished
    if (orderState !== "COMPLETED") {
      console.log("Order not completed yet");
      return NextResponse.json({ received: true });
    }

    const orderId = body?.data?.object?.order_updated?.order_id;

    if (!orderId) {
      console.log("No orderId found in webhook");
      return NextResponse.json({ received: true });
    }

    console.log("Retrieving order:", orderId);

const response = await squareClient.orders.get({
  orderId: orderId
});
    const order = response.order;

    if (!order) {
      console.log("Square returned no order");
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