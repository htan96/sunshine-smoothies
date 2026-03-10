import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SquareClient } from "square";

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

    console.log("CHECKOUT BODY:", body);

    const {
      items,
      pickupTime,
      notes,
      locationId,
      phone,
      squareCustomerId
    } = body;

    /* -------------------------------- */
    /* Basic Validation                 */
    /* -------------------------------- */

    if (!items || items.length === 0) {
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

    const redemptionItem = items.find((item:any) =>
      Object.values(REDEEM_VARIATIONS).includes(item.variationId)
    );

    const packItem = items.find((item:any) =>
      Object.values(PACK_VARIATIONS).includes(item.variationId)
    );

    const redemptionInCart = Boolean(redemptionItem);
    const fuelPackInCart = Boolean(packItem);

    const redemptionSize = redemptionItem
      ? Object.entries(REDEEM_VARIATIONS).find(
          ([, id]) => id === redemptionItem.variationId
        )?.[0]
      : null;

    const packSize = packItem
      ? Object.entries(PACK_VARIATIONS).find(
          ([, id]) => id === packItem.variationId
        )?.[0]
      : null;

    const phoneRequired = redemptionInCart || fuelPackInCart;

    if (phoneRequired && !phone) {
      return NextResponse.json(
        { error: "Phone number required" },
        { status: 400 }
      );
    }

    /* -------------------------------- */
    /* Validate Pack + Redemption Size  */
    /* -------------------------------- */

    if (fuelPackInCart && redemptionInCart && packSize !== redemptionSize) {
      return NextResponse.json(
        { error: "Pack size must match redemption size." },
        { status: 400 }
      );
    }

    /* -------------------------------- */
    /* Build Square Line Items          */
    /* -------------------------------- */

    const lineItems = items
      .filter((item:any) => item.quantity > 0)
      .map((item:any) => ({
        quantity: String(item.quantity),
        catalogObjectId: item.variationId
      }));

    if (!lineItems.length) {
      console.error("No valid line items");
      return NextResponse.json(
        { error: "Invalid cart items" },
        { status: 400 }
      );
    }

    console.log("SQUARE LINE ITEMS:", lineItems);

    /* -------------------------------- */
    /* Ensure Square Customer           */
    /* -------------------------------- */

    let customerId = squareCustomerId;

    if (!customerId && phone) {

      try {

        const customerResponse = await squareClient.customers.search({
          query: {
            filter: {
              phoneNumber: {
                exact: `+1${phone}`
              }
            }
          }
        });

        const existingCustomer =
          customerResponse.customers?.[0];

        if (existingCustomer) {

          customerId = existingCustomer.id;

        } else {

          const newCustomer =
            await squareClient.customers.create({
              phoneNumber: `+1${phone}`,
            });

          customerId = newCustomer.customer?.id ?? null;

        }

      } catch (err) {

        console.error("Customer lookup failed:", err);

      }

    }

    /* -------------------------------- */
    /* Create Payment Link              */
    /* -------------------------------- */

    const paymentLinkResponse =
      await squareClient.checkout.paymentLinks.create({

        idempotencyKey: randomUUID(),

        order: {

          locationId: locationId,

          lineItems: lineItems,

          ...(customerId && {
            customerId: customerId
          }),

          metadata: {
            fuel_phone: phone || "",
            fuel_pack: fuelPackInCart ? "true" : "false",
            fuel_redeem: redemptionInCart ? "true" : "false",
            pack_size: packSize || "",
            redemption_size: redemptionSize || "",
            pickup_time: pickupTime || "",
            notes: notes || ""
          },

          pricingOptions: {
            autoApplyTaxes: true,
            autoApplyDiscounts: true
          }

        },

        checkoutOptions: {

          redirectUrl:
            `${process.env.NEXT_PUBLIC_BASE_URL}/ordersuccess`,

        }

      });

    const paymentLink = paymentLinkResponse.paymentLink;

    return NextResponse.json({
      url: paymentLink?.url
    });

  } catch (error:any) {

    console.error("Checkout error:", error);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );

  }
}