import { NextRequest, NextResponse } from "next/server";
import { handleFuelOrder } from "@/lib/fuel/engine";
import { squareClient } from "@/lib/square/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Only process order updates
    if (body.type !== "order.updated") {
      return NextResponse.json({ received: true });
    }

    // Get order ID
    const orderId = body?.data?.id;

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    // Fetch order from Square
    const orderResponse = await squareClient.orders.get(orderId);

    const order = orderResponse.order;

    if (!order) {

      return NextResponse.json({ received: true });
    }
    console.log("Square order received:", order.id);
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