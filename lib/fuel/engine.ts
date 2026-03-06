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

function formatDisplay(balance: any) {
  return `FM-${balance.fuel_medium} FL-${balance.fuel_large} FXL-${balance.fuel_xl} FJ-${balance.fuel_jumbo}`;
}

async function recordTransaction(
  customerId: string,
  orderId: string,
  type: string,
  size: string,
  quantity: number
) {
  console.log("Recording transaction:", { customerId, orderId, type, size, quantity });

  await supabase.from("fuel_transactions").insert({
    square_customer_id: customerId,
    order_id: orderId,
    type,
    size,
    quantity,
  });
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

  // Prevent duplicate processing
  const { data: existing } = await supabase
    .from("processed_orders")
    .select("order_id")
    .eq("order_id", orderId)
    .single();

  if (existing) {
    console.log("Order already processed:", orderId);
    return;
  }

  // Get existing balance
  const { data: existingBalance } = await supabase
    .from("customer_fuel_balances")
    .select("*")
    .eq("square_customer_id", customerId)
    .single();

  let balance = existingBalance || {
    square_customer_id: customerId,
    fuel_medium: 0,
    fuel_large: 0,
    fuel_xl: 0,
    fuel_jumbo: 0,
  };

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
      await recordTransaction(customerId, orderId, "PACK", "MEDIUM", credits);
    }

    if (variationId === PACK_VARIATIONS.LARGE) {
      const credits = 8 * quantity;
      balance.fuel_large += credits;
      await recordTransaction(customerId, orderId, "PACK", "LARGE", credits);
    }

    if (variationId === PACK_VARIATIONS.XL) {
      const credits = 8 * quantity;
      balance.fuel_xl += credits;
      await recordTransaction(customerId, orderId, "PACK", "XL", credits);
    }

    if (variationId === PACK_VARIATIONS.JUMBO) {
      const credits = 8 * quantity;
      balance.fuel_jumbo += credits;
      await recordTransaction(customerId, orderId, "PACK", "JUMBO", credits);
    }

    // REDEMPTIONS
    if (variationId === REDEEM_VARIATIONS.MEDIUM && balance.fuel_medium > 0) {
      balance.fuel_medium -= quantity;
      await recordTransaction(customerId, orderId, "REDEEM", "MEDIUM", quantity);
    }

    if (variationId === REDEEM_VARIATIONS.LARGE && balance.fuel_large > 0) {
      balance.fuel_large -= quantity;
      await recordTransaction(customerId, orderId, "REDEEM", "LARGE", quantity);
    }

    if (variationId === REDEEM_VARIATIONS.XL && balance.fuel_xl > 0) {
      balance.fuel_xl -= quantity;
      await recordTransaction(customerId, orderId, "REDEEM", "XL", quantity);
    }

    if (variationId === REDEEM_VARIATIONS.JUMBO && balance.fuel_jumbo > 0) {
      balance.fuel_jumbo -= quantity;
      await recordTransaction(customerId, orderId, "REDEEM", "JUMBO", quantity);
    }
  }

  console.log("Updated balance:", balance);

  // Update balance
  await supabase.from("customer_fuel_balances").upsert({
    square_customer_id: customerId,
    fuel_medium: balance.fuel_medium,
    fuel_large: balance.fuel_large,
    fuel_xl: balance.fuel_xl,
    fuel_jumbo: balance.fuel_jumbo,
    updated_at: new Date(),
  });

  // Mark order as processed
  await supabase.from("processed_orders").insert({
    order_id: orderId,
  });

  // Update Square customer display
  const display = formatDisplay(balance);

  console.log("Updating Square customer name:", display);

  await squareClient.customers.update({
    customerId: customerId,
    familyName: display,
  });

  console.log("Fuel engine finished successfully.");
}