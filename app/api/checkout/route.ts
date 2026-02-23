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
      locationName,
      locationAddress,
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

    const lineItems = items.map((item: any) => ({
      quantity: String(item.quantity),
      catalogObjectId: item.variationId,
      modifiers:
        item.modifiers?.map((mod: any) => ({
          catalogObjectId: mod.modifierId,
        })) || [],
    }));

    const response =
      await squareClient.checkout.paymentLinks.create({
        idempotencyKey: randomUUID(),
        order: {
          locationId: locationId, // 🔥 NOW DYNAMIC
          lineItems,
          metadata: {
            pickupTime: pickupTime || "Not provided",
            notes: notes || "",
            pickupLocation: locationName || "",
            pickupAddress: locationAddress || "",
          },
        },
        checkoutOptions: {
          redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/ordersuccess`,
        },
      });

    return NextResponse.json({
      url: response.paymentLink?.url,
    });

  } catch (error) {
    console.error("Checkout error:", error);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}