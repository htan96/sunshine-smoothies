import { supabase } from "@/lib/supabase";
import { squareClient } from "@/lib/square/client";

/* -------------------------------- */
/* Fuel Pack Purchases              */
/* -------------------------------- */

export const PACK_VARIATIONS = {
  MEDIUM: "KXQQMGMMFQ6W3HR4KSCALRAV",
  LARGE: "XWUYXYSNYYWNVJU3EJSIYTLL",
  XL: "JM44WSKHPJGAMNSJTSOQIH4R",
  JUMBO: "NW2DIXVFXRFELXRUNRDB3NE2",
};

/* -------------------------------- */
/* Redemption Variations            */
/* -------------------------------- */

export const REDEEM_VARIATIONS = {
  MEDIUM: "RMILMPJ3UMVOMOH4LFBQDS4H",
  LARGE: "BWJMGIMUZHU3EVPBEKMFMPEB",
  XL: "F7QLDQMENXO4CIOQO6QPHIV5",
  JUMBO: "7XQ7EXVJELMIM63UDTLMLAC7",
};

/* -------------------------------- */
/* Display Format Helper            */
/* -------------------------------- */

function formatDisplay(balance: {
  fuel_medium: number;
  fuel_large: number;
  fuel_xl: number;
  fuel_jumbo: number;
}) {
  return `FM-${balance.fuel_medium} FL-${balance.fuel_large} FXL-${balance.fuel_xl} FJ-${balance.fuel_jumbo}`;
}

/* -------------------------------- */
/* Phone Normalization              */
/* -------------------------------- */

function normalizePhone(phone?: string | null) {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (phone.startsWith("+")) return phone;

  return `+${digits}`;
}

/* -------------------------------- */
/* Get Customer Phone               */
/* -------------------------------- */

async function getCustomerPhone(customerId: string) {
  try {
    const response = await squareClient.customers.get({
      customerId,
    });

    const rawPhone = response.customer?.phoneNumber ?? null;
    const normalizedPhone = normalizePhone(rawPhone);

    console.log("Square customer fetched:", {
      customerId,
      rawPhone,
      normalizedPhone,
    });

    return normalizedPhone;
  } catch (error) {
    console.error("Failed to fetch Square customer phone:", error);
    return null;
  }
}

/* -------------------------------- */
/* Record Transaction               */
/* -------------------------------- */

async function recordTransaction(
  phone: string,
  customerId: string,
  orderId: string,
  type: string,
  size: string,
  quantity: number
) {
  console.log("Recording transaction:", {
    phone,
    customerId,
    orderId,
    type,
    size,
    quantity,
  });

  const { error } = await supabase
    .from("fuel_transactions")
    .insert({
      phone,
      square_customer_id: customerId,
      order_id: orderId,
      type,
      size,
      quantity,
    });

  if (error) {
    console.error("Failed to record transaction:", error);
    throw error;
  }
}

/* -------------------------------- */
/* Fuel Engine                      */
/* -------------------------------- */

export async function handleFuelOrder(order: any) {
  console.log("Fuel engine received order:", order);

  const orderId = order.id;
  const customerId = order.customerId;

  if (!orderId) {
    console.log("Order has no id. Skipping.");
    return;
  }

  /* -------------------------------- */
  /* Prevent Double Processing        */
  /* -------------------------------- */

  const { data: existingTransactions, error: existingError } = await supabase
    .from("fuel_transactions")
    .select("order_id")
    .eq("order_id", orderId)
    .limit(1);

  if (existingError) {
    console.error("Failed checking existing transactions:", existingError);
    throw existingError;
  }

  if (existingTransactions && existingTransactions.length > 0) {
    console.log("Order already processed. Skipping:", orderId);
    return;
  }

  if (!customerId) {
    console.log("No customer attached to order. Skipping.");
    return;
  }

  if (!order.lineItems || order.lineItems.length === 0) {
    console.log("Order has no line items.");
    return;
  }

  const phone = await getCustomerPhone(customerId);

  if (!phone) {
    console.log("No phone found for customer. Skipping.");
    return;
  }

  /* -------------------------------- */
  /* Fetch Existing Balance           */
  /* -------------------------------- */

  const { data: existingBalance, error: balanceFetchError } = await supabase
    .from("customer_fuel_balances")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (balanceFetchError) {
    console.error("Failed fetching customer_fuel_balances:", balanceFetchError);
    throw balanceFetchError;
  }

  let balance = existingBalance || {
    phone,
    square_customer_id: customerId,
    fuel_medium: 0,
    fuel_large: 0,
    fuel_xl: 0,
    fuel_jumbo: 0,
  };

  balance.square_customer_id = customerId;

  console.log("Starting balance:", balance);

  /* -------------------------------- */
  /* Process Order Line Items         */
  /* -------------------------------- */

  for (const item of order.lineItems) {
    const variationId = item.catalogObjectId;
    const quantity = Number(item.quantity || 1);

    console.log("Processing item:", variationId, "qty:", quantity);

    /* ---------- PACK PURCHASES ---------- */

    if (variationId === PACK_VARIATIONS.MEDIUM) {
      const credits = 8 * quantity;
      balance.fuel_medium += credits;

      await recordTransaction(
        phone,
        customerId,
        orderId,
        "PACK",
        "MEDIUM",
        credits
      );
    } else if (variationId === PACK_VARIATIONS.LARGE) {
      const credits = 8 * quantity;
      balance.fuel_large += credits;

      await recordTransaction(
        phone,
        customerId,
        orderId,
        "PACK",
        "LARGE",
        credits
      );
    } else if (variationId === PACK_VARIATIONS.XL) {
      const credits = 8 * quantity;
      balance.fuel_xl += credits;

      await recordTransaction(
        phone,
        customerId,
        orderId,
        "PACK",
        "XL",
        credits
      );
    } else if (variationId === PACK_VARIATIONS.JUMBO) {
      const credits = 8 * quantity;
      balance.fuel_jumbo += credits;

      await recordTransaction(
        phone,
        customerId,
        orderId,
        "PACK",
        "JUMBO",
        credits
      );
    }

    /* ---------- REDEMPTIONS ---------- */

    else if (variationId === REDEEM_VARIATIONS.MEDIUM) {
      if (balance.fuel_medium >= quantity) {
        balance.fuel_medium -= quantity;

        await recordTransaction(
          phone,
          customerId,
          orderId,
          "REDEEM",
          "MEDIUM",
          quantity
        );
      } else {
        console.log("Redemption skipped (insufficient balance)", {
          phone,
          size: "MEDIUM",
          balance: balance.fuel_medium,
          attempted: quantity,
        });
      }
    } else if (variationId === REDEEM_VARIATIONS.LARGE) {
      if (balance.fuel_large >= quantity) {
        balance.fuel_large -= quantity;

        await recordTransaction(
          phone,
          customerId,
          orderId,
          "REDEEM",
          "LARGE",
          quantity
        );
      } else {
        console.log("Redemption skipped (insufficient balance)", {
          phone,
          size: "LARGE",
          balance: balance.fuel_large,
          attempted: quantity,
        });
      }
    } else if (variationId === REDEEM_VARIATIONS.XL) {
      if (balance.fuel_xl >= quantity) {
        balance.fuel_xl -= quantity;

        await recordTransaction(
          phone,
          customerId,
          orderId,
          "REDEEM",
          "XL",
          quantity
        );
      } else {
        console.log("Redemption skipped (insufficient balance)", {
          phone,
          size: "XL",
          balance: balance.fuel_xl,
          attempted: quantity,
        });
      }
    } else if (variationId === REDEEM_VARIATIONS.JUMBO) {
      if (balance.fuel_jumbo >= quantity) {
        balance.fuel_jumbo -= quantity;

        await recordTransaction(
          phone,
          customerId,
          orderId,
          "REDEEM",
          "JUMBO",
          quantity
        );
      } else {
        console.log("Redemption skipped (insufficient balance)", {
          phone,
          size: "JUMBO",
          balance: balance.fuel_jumbo,
          attempted: quantity,
        });
      }
    }
  }

  console.log("Updated balance:", balance);

  /* -------------------------------- */
  /* Save Balance Snapshot            */
  /* -------------------------------- */

  const { error: upsertError } = await supabase
    .from("customer_fuel_balances")
    .upsert(
      {
        phone,
        square_customer_id: customerId,
        fuel_medium: balance.fuel_medium,
        fuel_large: balance.fuel_large,
        fuel_xl: balance.fuel_xl,
        fuel_jumbo: balance.fuel_jumbo,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "phone" }
    );

  if (upsertError) {
    console.error("Failed updating customer_fuel_balances:", upsertError);
    throw upsertError;
  }

  /* -------------------------------- */
  /* Update Square Customer Display   */
  /* -------------------------------- */

  const display = formatDisplay(balance);

  console.log("Updating Square customer name:", display);

  try {
    await squareClient.customers.update({
      customerId,
      familyName: display,
    });
  } catch (error) {
    console.error("Failed updating Square customer display:", error);
  }

  console.log("Fuel engine finished successfully.");
}