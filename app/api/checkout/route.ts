import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  SquareClient,
  FulfillmentType,
  FulfillmentState,
  FulfillmentPickupDetailsScheduleType,
} from "square";

/* -------------------------------- */
/* Square Client                    */
/* -------------------------------- */

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
});

/* -------------------------------- */
/* Fuel Pack Variations             */
/* -------------------------------- */

const PACK_VARIATIONS = {
  MEDIUM: "KXQQMGMMFQ6W3HR4KSCALRAV",
  LARGE: "XWUYXYSNYYWNVJU3EJSIYTLL",
  XL: "JM44WSKHPJGAMNSJTSOQIH4R",
  JUMBO: "NW2DIXVFXRFELXRUNRDB3NE2",
};

/* -------------------------------- */
/* Redemption Variations            */
/* -------------------------------- */

const REDEEM_VARIATIONS = {
  MEDIUM: "RMILMPJ3UMVOMOH4LFBQDS4H",
  LARGE: "BWJMGIMUZHU3EVPBEKMFMPEB",
  XL: "F7QLDQMENXO4CIOQO6QPHIV5",
  JUMBO: "7XQ7EXVJELMIM63UDTLMLAC7",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      items,
      pickupTime,
      notes,
      locationId,
      squareCustomerId,
      phone,
    } = body;

    /* -------------------------------- */
    /* Basic Validation                 */
    /* -------------------------------- */

    if (!items?.length) {
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

    /* -------------------------------- */
    /* Detect Packs + Redemption        */
    /* -------------------------------- */

    const redemptionInCart = items.some((item: any) =>
      Object.values(REDEEM_VARIATIONS).includes(item.variationId)
    );

    const fuelPackInCart = items.some((item: any) =>
      Object.values(PACK_VARIATIONS).includes(item.variationId)
    );

    const phoneRequired = redemptionInCart || fuelPackInCart;

    if (phoneRequired && !phone) {
      return NextResponse.json(
        { error: "Phone number required" },
        { status: 400 }
      );
    }

    if (redemptionInCart && !squareCustomerId) {
      return NextResponse.json(
        { error: "Customer verification required for redemption" },
        { status: 400 }
      );
    }

    /* -------------------------------- */
    /* Build Line Items                 */
    /* -------------------------------- */

    const lineItems = items.map((item: any) => ({
      quantity: String(item.quantity),
      catalogObjectId: item.variationId,
      modifiers:
        item.modifiers?.map((mod: any) => ({
          catalogObjectId: mod.modifierId,
        })) || [],
    }));

    /* -------------------------------- */
    /* Pickup Fulfillment               */
    /* -------------------------------- */

    const fulfillments = [
      {
        type: FulfillmentType.Pickup,
        state: FulfillmentState.Proposed,
        pickupDetails: {
          scheduleType:
            FulfillmentPickupDetailsScheduleType.Scheduled,
          pickupAt: pickupTime,
          note: notes || "",
          recipient: {
            displayName: "Pickup Customer",
          },
        },
      },
    ];

    /* -------------------------------- */
    /* Create Square Order              */
    /* -------------------------------- */

    const orderResponse = await squareClient.orders.create({
      idempotencyKey: randomUUID(),

      order: {
        locationId,

        ...(squareCustomerId && {
          customerId: squareCustomerId,
        }),

        lineItems,

        fulfillments,

        metadata: {
          fuel_phone: phone || "",
          fuel_pack: fuelPackInCart ? "true" : "false",
          fuel_redeem: redemptionInCart ? "true" : "false",
        },

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

    /* -------------------------------- */
    /* Create Payment Link              */
    /* -------------------------------- */

    const paymentLinkResponse =
      await squareClient.checkout.paymentLinks.create({
        idempotencyKey: randomUUID(),

        order: {
          id: createdOrder.id,
          locationId,
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

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}