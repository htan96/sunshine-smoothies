import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SquareClient } from "square";

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = body?.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!process.env.SQUARE_LOCATION_ID) {
      return NextResponse.json(
        { error: "Location ID not configured" },
        { status: 500 }
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
          locationId: process.env.SQUARE_LOCATION_ID,
          lineItems,
        },
        checkoutOptions: {
          redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order-success`,
        },
      });

    const checkoutUrl = response.paymentLink?.url;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Failed to create checkout link" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutUrl });

  } catch (error) {
    console.error("Checkout error:", error);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}