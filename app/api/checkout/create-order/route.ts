import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SquareClient } from "square";
import { fetchCatalogItems } from "@/features/square/catalog";
import { transformCatalog } from "@/features/menu/transform";

/* -------------------------------- */
/* Square Client                    */
/* -------------------------------- */

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
});

/* -------------------------------- */
/* Fuel Pack Variations             */
/* -------------------------------- */

const PACK_VARIATIONS: Record<string, string> = {
  MEDIUM: "KXQQMGMMFQ6W3HR4KSCALRAV",
  LARGE: "XWUYXYSNYYWNVJU3EJSIYTLL",
  XL: "JM44WSKHPJGAMNSJTSOQIH4R",
  JUMBO: "NW2DIXVFXRFELXRUNRDB3NE2",
};

/* -------------------------------- */
/* Redemption Variations            */
/* -------------------------------- */

const REDEEM_VARIATIONS: Record<string, string> = {
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

type CartItem = {
  variationId: string;
  quantity: number;
  itemName?: string;
  modifiers?: { modifierId: string; quantity?: number; name?: string }[];
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      items,
      pickupTime,
      notes,
      locationId,
      phone,
      squareCustomerId,
      displayName,
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
    /* Location verification            */
    /* -------------------------------- */

    const catalogObjects = await fetchCatalogItems();
    const { items: locationItems } = transformCatalog(
      catalogObjects,
      locationId
    );
    const availableVariationIds = new Set(
      locationItems.flatMap((i) => i.variations.map((v) => v.id))
    );

    const unavailableItems: string[] = [];
    for (const item of items as CartItem[]) {
      if (!availableVariationIds.has(item.variationId)) {
        unavailableItems.push(item.itemName ?? "Unknown item");
      }
    }
    if (unavailableItems.length > 0) {
      const unique = [...new Set(unavailableItems)];
      return NextResponse.json(
        {
          error:
            unique.length === 1
              ? `${unique[0]} is not available at your selected pickup location. Please change location or remove it from your cart.`
              : `Some items are not available at your selected pickup location: ${unique.join(", ")}. Please change location or remove them from your cart.`,
        },
        { status: 400 }
      );
    }

    /* -------------------------------- */
    /* Detect Packs + Redemption        */
    /* -------------------------------- */

    const redemptionItem = items.find((item: CartItem) =>
      Object.values(REDEEM_VARIATIONS).includes(item.variationId)
    );

    const packItem = items.find((item: CartItem) =>
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
      const valid =
        digits.length === 10 ||
        (digits.length === 11 && digits.startsWith("1"));
      if (!valid) {
        return NextResponse.json(
          { error: "Please enter a valid 10-digit phone number" },
          { status: 400 }
        );
      }
    }

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
      .filter((item: CartItem) => item.quantity > 0)
      .map((item: CartItem) => {
        const lineItem: {
          quantity: string;
          catalogObjectId: string;
          modifiers?: {
            catalogObjectId: string;
            quantity?: string;
            name?: string;
          }[];
        } = {
          quantity: String(item.quantity),
          catalogObjectId: item.variationId,
        };
        if (
          item.modifiers &&
          Array.isArray(item.modifiers) &&
          item.modifiers.length > 0
        ) {
          lineItem.modifiers = item.modifiers.map(
            (m: { modifierId: string; quantity?: number; name?: string }) => ({
              catalogObjectId: m.modifierId,
              quantity: String(m.quantity ?? 1),
              name: m.name,
            })
          );
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
    const displayNameTrimmed =
      typeof displayName === "string" ? displayName.trim() : "";

    if (!customerId && (phone || displayNameTrimmed)) {
      try {
        if (phone) {
          const normalizedPhone = normalizePhone(phone);

          const search = await squareClient.customers.search({
            query: {
              filter: {
                phoneNumber: {
                  exact: normalizedPhone,
                },
              },
            },
          });

          const existing = search.customers?.[0];

          if (existing) {
            customerId = existing.id;
          } else {
            const created = await squareClient.customers.create({
              phoneNumber: normalizedPhone,
              ...(displayNameTrimmed && { givenName: displayNameTrimmed }),
            });
            customerId = created.customer?.id ?? null;
          }
        } else if (displayNameTrimmed) {
          const created = await squareClient.customers.create({
            givenName: displayNameTrimmed,
          });
          customerId = created.customer?.id ?? null;
        }
      } catch {
        // Customer lookup/create failed - continue without customerId
      }
    }

    /* -------------------------------- */
    /* Build Metadata                   */
    /* -------------------------------- */

    const metadata: Record<string, string> = {
      fuel_phone: (phone && phone.trim()) ? phone.trim() : "-",
      fuel_pack: fuelPackInCart ? "true" : "false",
      fuel_redeem: redemptionInCart ? "true" : "false",
    };
    if (packSize) metadata.pack_size = packSize;
    if (redemptionSize) metadata.redemption_size = redemptionSize;
    if (pickupTime) metadata.pickup_time = pickupTime;
    if (notes && notes.trim() !== "") metadata.notes = notes;
    if (displayNameTrimmed) metadata.display_name = displayNameTrimmed;

    /* -------------------------------- */
    /* Create Order                     */
    /* -------------------------------- */

    const orderResponse = await squareClient.orders.create({
      idempotencyKey: randomUUID(),
      order: {
        locationId,
        lineItems,
        ...(customerId && { customerId }),
        metadata,
        pricingOptions: {
          autoApplyTaxes: true,
          autoApplyDiscounts: true,
        },
      },
    });

    const order = orderResponse.order;
    if (!order?.id) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    const totalCents = Number(order.totalMoney?.amount ?? 0);
    const totalTaxCents = Number(order.totalTaxMoney?.amount ?? 0);
    const subtotalCents = totalCents - totalTaxCents;

    return NextResponse.json({
      orderId: order.id,
      total: totalCents,
      subtotal: subtotalCents,
      tax: totalTaxCents,
      version: order.version,
    });
  } catch (error: unknown) {
    console.error("Create order failed:", error);
    return NextResponse.json(
      { error: "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}
