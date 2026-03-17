import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { handleFuelOrder } from "@/lib/fuel/engine";
import { squareClient } from "@/lib/square/client";
import { supabase } from "@/lib/supabase";

function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  signatureKey: string | undefined,
  notificationUrl: string
): boolean {
  if (!signatureKey || !signatureHeader) return false;

  const payload = notificationUrl + rawBody;
  const expected = createHmac("sha256", signatureKey)
    .update(payload)
    .digest("base64");

  if (expected.length !== signatureHeader.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(expected, "base64"),
      Buffer.from(signatureHeader, "base64")
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get("x-square-hmacsha256-signature");
    const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
    const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL;

    if (signatureKey && notificationUrl) {
      if (!verifyWebhookSignature(rawBody, signatureHeader, signatureKey, notificationUrl)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);

    if (body.type !== "order.updated") {
      return NextResponse.json({ received: true });
    }

    const orderState = body?.data?.object?.order_updated?.state;

    if (orderState !== "COMPLETED") {
      return NextResponse.json({ received: true });
    }

    const orderId = body?.data?.object?.order_updated?.order_id;

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    // Prevent duplicate processing
    const { data: existing } = await supabase
      .from("processed_orders")
      .select("order_id")
      .eq("order_id", orderId)
      .single();

    if (existing) {
      return NextResponse.json({ received: true });
    }

    const response = await squareClient.orders.get({
      orderId: orderId
    });

    const order = response.order;

    if (!order) {
      return NextResponse.json({ received: true });
    }

    await handleFuelOrder(order);

    await supabase.from("processed_orders").insert({
      order_id: orderId
    });

    return NextResponse.json({ success: true });

  } catch (error) {

    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}