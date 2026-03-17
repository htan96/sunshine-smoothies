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

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.startsWith("+")) return phone;
  return `+${digits}`;
}

export async function POST(req: Request) {
  try {

    const body = await req.json();

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

    if (phoneRequired) {
      if (!phone || !phone.trim()) {
        return NextResponse.json(
          { error: "Phone number required" },
          { status: 400 }
        );
      }
      const digits = phone.replace(/\D/g, "");
      const valid = digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
      if (!valid) {
        return NextResponse.json(
          { error: "Please enter a valid 10-digit phone number" },
          { status: 400 }
        );
      }
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
      .filter((item: any) => item.quantity > 0)
      .map((item: any) => {
        const lineItem: {
          quantity: string;
          catalogObjectId: string;
          modifiers?: { catalogObjectId: string; quantity?: string; name?: string }[];
        } = {
          quantity: String(item.quantity),
          catalogObjectId: item.variationId,
        };
        if (item.modifiers && Array.isArray(item.modifiers) && item.modifiers.length > 0) {
          lineItem.modifiers = item.modifiers.map((m: { modifierId: string; quantity?: number; name?: string }) => ({
            catalogObjectId: m.modifierId,
            quantity: String(m.quantity ?? 1),
            name: m.name,
          }));
        }
        return lineItem;
      });

    if (!lineItems.length) {
      return NextResponse.json(
        { error: "Invalid cart items" },
        { status: 400 }
      );
    }

    /* -------------------------------- */
    /* Ensure Square Customer           */
    /* -------------------------------- */

    let customerId = squareCustomerId;

    if (!customerId && phone) {

      try {

        const normalizedPhone = normalizePhone(phone);

        const search = await squareClient.customers.search({
          query: {
            filter: {
              phoneNumber: {
                exact: normalizedPhone
              }
            }
          }
        });

        const existing = search.customers?.[0];

        if (existing) {
          customerId = existing.id;
        } else {

          const created =
            await squareClient.customers.create({
              phoneNumber: normalizedPhone
            });

          customerId = created.customer?.id ?? null;

        }

      } catch (error) {
        // Customer lookup/create failed - continue without customerId
      }
    }

    /* -------------------------------- */
    /* Build Metadata (NO EMPTY VALUES) */
/* -------------------------------- */

const metadata: Record<string, string> = {
  fuel_phone: phone ?? "",
  fuel_pack: fuelPackInCart ? "true" : "false",
  fuel_redeem: redemptionInCart ? "true" : "false",
};

if (packSize) metadata.pack_size = packSize;
if (redemptionSize) metadata.redemption_size = redemptionSize;
if (pickupTime) metadata.pickup_time = pickupTime;
if (notes && notes.trim() !== "") metadata.notes = notes;


    /* -------------------------------- */
    /* Create Payment Link              */
    /* -------------------------------- */

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Server misconfiguration: missing NEXT_PUBLIC_BASE_URL" },
        { status: 500 }
      );
    }

    const paymentLinkResponse =
      await squareClient.checkout.paymentLinks.create({

        idempotencyKey: randomUUID(),

        order: {

          locationId: locationId,

          lineItems: lineItems,

          ...(customerId && { customerId }),

          metadata,

          pricingOptions: {
            autoApplyTaxes: true,
            autoApplyDiscounts: true
          }

        },

        checkoutOptions: {
          redirectUrl: `${baseUrl}/ordersuccess`,
        }

      });

    const paymentLink = paymentLinkResponse.paymentLink;

    return NextResponse.json({
      url: paymentLink?.url
    });

  } catch (error: unknown) {
    console.error("Checkout failed:", error);
    return NextResponse.json(
      { error: "Checkout failed. Please try again." },
      { status: 500 }
    );
  }
}