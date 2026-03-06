import { NextRequest, NextResponse } from "next/server";
import { handleFuelOrder } from "@/lib/fuel/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Only process order updates
    if (body.type !== "order.updated") {
      return NextResponse.json({ received: true });
    }

    const order = body?.data?.object?.order;

    // Safety check
    if (!order) {
      return NextResponse.json({ received: true });
    }

    await handleFuelOrder(order);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}