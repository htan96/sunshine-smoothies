import { NextRequest, NextResponse } from "next/server";
import { handleFuelOrder } from "@/lib/fuel/engine";
import { squareClient } from "@/lib/square/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
console.log("WEBHOOK BODY:", JSON.stringify(body, null, 2));
    // Only process order updates
    if (body.type !== "order.updated") {
      return NextResponse.json({ received: true });
    }

    // Correct location of orderId
    const orderId = body?.data?.object?.order_id;

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    // Retrieve order
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