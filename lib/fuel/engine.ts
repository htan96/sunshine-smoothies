import { supabase } from "@/lib/supabase";
import { squareClient } from "@/lib/square/client";

// Fuel Pack Purchases
export const PACK_VARIATIONS = {
  MEDIUM: "KXQQMGMMFQ6W3HR4KSCALRAV",
  LARGE: "XWUYXYSNYYWNVJU3EJSIYTLL",
  XL: "JM44WSKHPJGAMNSJTSOQIH4R",
  JUMBO: "NW2DIXVFXRFELXRUNRDB3NE2",
};

// Fuel Pack Redemptions
export const REDEEM_VARIATIONS = {
  MEDIUM: "RMILMPJ3UMVOMOH4LFBQDS4H",
  LARGE: "BWJMGIMUZHU3EVPBEKMFMPEB",
  XL: "F7QLDQMENXO4CIOQO6QPHIV5",
  JUMBO: "7XQ7EXVJELMIM63UDTLMLAC7",
};

function formatDisplay(balance: {
  fuel_medium: number;
  fuel_large: number;
  fuel_xl: number;
  fuel_jumbo: number;
}) {
  return `FM-${balance.fuel_medium} FL-${balance.fuel_large} FXL-${balance.fuel_xl} FJ-${balance.fuel_jumbo}`;
}

function normalizePhone(phone?: string | null) {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");

  // US normalization
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  // fallback
  if (phone.startsWith("+")) {
    return phone;
  }

  return `+${digits}`;
}

async function getCustomerPhone(customerId: string) {
  try {
    const response = await squareClient.customers.get({
      customerId,
    });

    const customer = response.customer;
    const rawPhone = customer?.phoneNumber ?? null;
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

  const { error } = await supabase.from("fuel_transactions").insert({
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

export async function handleFuelOrder(order: any) {
  console.log("Fuel engine received order:", order);

  const orderId = order.id;
  const customerId = order.customerId;

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
    console.log("No phone found for customer. Skipping fuel processing.");
    return;
  }

  // Prevent duplicate processing
  const { data: existingProcessed, error: processedLookupError } = await supabase
    .from("processed_orders")
    .select("order_id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (processedLookupError) {
    console.error("Failed checking processed_orders:", processedLookupError);
    throw processedLookupError;
  }

  if (existingProcessed) {
    console.log("Order already processed:", orderId);
    return;
  }

  // Get balance by PHONE first
  const { data: existingBalance, error: balanceLookupError } = await supabase
    .from("customer_fuel_balances")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (balanceLookupError) {
    console.error("Failed looking up balance by phone:", balanceLookupError);
    throw balanceLookupError;
  }

  let balance = existingBalance || {
    phone,
    square_customer_id: customerId,
    fuel_medium: 0,
    fuel_large: 0,
    fuel_xl: 0,
    fuel_jumbo: 0,
  };

  // Always keep the most recent Square customer id
  balance.square_customer_id = customerId;
  balance.phone = phone;

  console.log("Starting balance:", balance);

  for (const item of order.lineItems) {
    console.log("Processing item:", item);

    const variationId = item.catalogObjectId;
    const quantity = Number(item.quantity || 1);

    console.log("Variation ID:", variationId);

    // PACK PURCHASES
    if (variationId === PACK_VARIATIONS.MEDIUM) {
      const credits = 8 * quantity;
      balance.fuel_medium += credits;
      await recordTransaction(phone, customerId, orderId, "PACK", "MEDIUM", credits);
    }

    if (variationId === PACK_VARIATIONS.LARGE) {
      const credits = 8 * quantity;
      balance.fuel_large += credits;
      await recordTransaction(phone, customerId, orderId, "PACK", "LARGE", credits);
    }

    if (variationId === PACK_VARIATIONS.XL) {
      const credits = 8 * quantity;
      balance.fuel_xl += credits;
      await recordTransaction(phone, customerId, orderId, "PACK", "XL", credits);
    }

    if (variationId === PACK_VARIATIONS.JUMBO) {
      const credits = 8 * quantity;
      balance.fuel_jumbo += credits;
      await recordTransaction(phone, customerId, orderId, "PACK", "JUMBO", credits);
    }

    // REDEMPTIONS
    if (variationId === REDEEM_VARIATIONS.MEDIUM) {
      if (balance.fuel_medium >= quantity) {
        balance.fuel_medium -= quantity;
        await recordTransaction(phone, customerId, orderId, "REDEEM", "MEDIUM", quantity);
      } else {
        console.log("Blocked medium redemption, insufficient balance:", {
          phone,
          requested: quantity,
          available: balance.fuel_medium,
        });
      }
    }

    if (variationId === REDEEM_VARIATIONS.LARGE) {
      if (balance.fuel_large >= quantity) {
        balance.fuel_large -= quantity;
        await recordTransaction(phone, customerId, orderId, "REDEEM", "LARGE", quantity);
      } else {
        console.log("Blocked large redemption, insufficient balance:", {
          phone,
          requested: quantity,
          available: balance.fuel_large,
        });
      }
    }

    if (variationId === REDEEM_VARIATIONS.XL) {
      if (balance.fuel_xl >= quantity) {
        balance.fuel_xl -= quantity;
        await recordTransaction(phone, customerId, orderId, "REDEEM", "XL", quantity);
      } else {
        console.log("Blocked XL redemption, insufficient balance:", {
          phone,
          requested: quantity,
          available: balance.fuel_xl,
        });
      }
    }

    if (variationId === REDEEM_VARIATIONS.JUMBO) {
      if (balance.fuel_jumbo >= quantity) {
        balance.fuel_jumbo -= quantity;
        await recordTransaction(phone, customerId, orderId, "REDEEM", "JUMBO", quantity);
      } else {
        console.log("Blocked jumbo redemption, insufficient balance:", {
          phone,
          requested: quantity,
          available: balance.fuel_jumbo,
        });
      }
    }
  }

  console.log("Updated balance:", balance);

  const { error: upsertError } = await supabase.from("customer_fuel_balances").upsert(
    {
      phone,
      square_customer_id: customerId,
      fuel_medium: balance.fuel_medium,
      fuel_large: balance.fuel_large,
      fuel_xl: balance.fuel_xl,
      fuel_jumbo: balance.fuel_jumbo,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "phone",
    }
  );

  if (upsertError) {
    console.error("Failed updating customer_fuel_balances:", upsertError);
    throw upsertError;
  }

  const { error: processedInsertError } = await supabase.from("processed_orders").insert({
    order_id: orderId,
    phone,
  });

  if (processedInsertError) {
    console.error("Failed inserting processed order:", processedInsertError);
    throw processedInsertError;
  }

  const display = formatDisplay(balance);

  console.log("Updating Square customer name:", display);

  try {
    await squareClient.customers.update({
      customerId,
      familyName: display,
    });
  } catch (error) {
    console.error("Failed to update Square customer display:", error);
  }

  console.log("Fuel engine finished successfully.");
}