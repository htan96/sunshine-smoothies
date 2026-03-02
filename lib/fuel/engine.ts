import { supabase } from "@/lib/supabase";
import { squareClient } from "@/lib/square/client";

// 🔥 REPLACE THESE WITH YOUR REAL VARIATION IDs
export const PACK_VARIATIONS = {
  MEDIUM: "REPLACE_MEDIUM_PACK_ID",
  LARGE: "REPLACE_LARGE_PACK_ID",
  XL: "REPLACE_XL_PACK_ID",
  JUMBO: "REPLACE_JUMBO_PACK_ID",
};

export const REDEEM_VARIATIONS = {
  MEDIUM: "REPLACE_MEDIUM_REDEEM_ID",
  LARGE: "REPLACE_LARGE_REDEEM_ID",
  XL: "REPLACE_XL_REDEEM_ID",
  JUMBO: "REPLACE_JUMBO_REDEEM_ID",
};

function formatDisplay(balance: any) {
  return `FM-${balance.fuel_medium} FL-${balance.fuel_large} FXL-${balance.fuel_xl} FJ-${balance.fuel_jumbo}`;
}

export async function handleFuelOrder(order: any) {
  const orderId = order.id;
  const customerId = order.customer_id;

  if (!customerId) return;

  // 1️⃣ Prevent duplicate processing
  const { data: existing } = await supabase
    .from("processed_orders")
    .select("order_id")
    .eq("order_id", orderId)
    .single();

  if (existing) return;

  // 2️⃣ Get existing balance
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

  // 3️⃣ Process line items
  for (const item of order.line_items || []) {
    const variationId = item.variation_id;
    const quantity = Number(item.quantity || 1);

    // PACK PURCHASES
    if (variationId === PACK_VARIATIONS.MEDIUM) {
      balance.fuel_medium += 8;
      await recordTransaction(customerId, orderId, "PACK", "MEDIUM", 8);
    }

    if (variationId === PACK_VARIATIONS.LARGE) {
      balance.fuel_large += 8;
      await recordTransaction(customerId, orderId, "PACK", "LARGE", 8);
    }

    if (variationId === PACK_VARIATIONS.XL) {
      balance.fuel_xl += 8;
      await recordTransaction(customerId, orderId, "PACK", "XL", 8);
    }

    if (variationId === PACK_VARIATIONS.JUMBO) {
      balance.fuel_jumbo += 8;
      await recordTransaction(customerId, orderId, "PACK", "JUMBO", 8);
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

  // 4️⃣ Upsert updated balance
  await supabase.from("customer_fuel_balances").upsert({
    square_customer_id: customerId,
    fuel_medium: balance.fuel_medium,
    fuel_large: balance.fuel_large,
    fuel_xl: balance.fuel_xl,
    fuel_jumbo: balance.fuel_jumbo,
    updated_at: new Date(),
  });

  // 5️⃣ Mark order as processed
  await supabase.from("processed_orders").insert({
    order_id: orderId,
  });

  // 6️⃣ Update Square Customer Last Name
  const display = formatDisplay(balance);

await squareClient.customers.update({
  customerId: customerId,
  familyName: display,
});
async function recordTransaction(
  customerId: string,
  orderId: string,
  type: string,
  size: string,
  quantity: number
) {
  await supabase.from("fuel_transactions").insert({
    square_customer_id: customerId,
    order_id: orderId,
    type,
    size,
    quantity,
  });
}}