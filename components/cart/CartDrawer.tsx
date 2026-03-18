"use client";

import { useState, useEffect } from "react";
import { useCartStore, type CartItem } from "@/features/cart/store";
import { useLocationStore } from "@/features/location/store";
import { PACK_VARIATIONS, REDEEM_VARIATIONS, getFuelVariationDisplayName } from "@/lib/fuelConstants";
import { isLocationClosed, getLocationClosureMessage } from "@/lib/locationClosures";
import LocationGate from "@/components/location/LocationGate";
import MenuItemModal from "@/components/menu/MenuItemModal";
import EmbeddedCheckout from "@/components/checkout/EmbeddedCheckout";
import type { MenuItem } from "@/features/menu/types";

/* -------------------------------- */
/* ORDERING HOURS CONFIG            */
/* -------------------------------- */

const ORDER_START_HOUR = 8;
const ORDER_END_HOUR = 18;

const PREP_TIME_MINUTES = 20;
const SLOT_INTERVAL = 15;

function isWithinOrderingHours() {
  const now = new Date();
  const hour = now.getHours();
  return hour >= ORDER_START_HOUR && hour < ORDER_END_HOUR;
}

/* -------------------------------- */
/* HELPERS                          */
/* -------------------------------- */

function getReadyTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() + PREP_TIME_MINUTES);
  return now;
}

function generatePickupSlots() {
  const now = new Date();
  const start = new Date(now.getTime() + PREP_TIME_MINUTES * 60000);

  const closing = new Date();
  closing.setHours(ORDER_END_HOUR, 0, 0, 0);

  const slots = [];

  const firstSlot = new Date(start);
  firstSlot.setMinutes(
    Math.ceil(firstSlot.getMinutes() / SLOT_INTERVAL) * SLOT_INTERVAL
  );

  let current = firstSlot;

  while (current <= closing) {
    slots.push({
      date: new Date(current),
      label: current.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      value: current.toISOString(),
    });

    current = new Date(current.getTime() + SLOT_INTERVAL * 60000);
  }

  return slots;
}

function isValidUSPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* -------------------------------- */
/* TYPES                            */
/* -------------------------------- */

type FuelBalances = {
  medium: number;
  large: number;
  xl: number;
  jumbo: number;
};

/* -------------------------------- */
/* COMPONENT                        */
/* -------------------------------- */

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getCartTotal,
    clearCart,
  } = useCartStore();

  const selectedLocation = useLocationStore((state) => state.selectedLocation);

  const [pickupDate, setPickupDate] = useState<Date>(getReadyTime());
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  const [checkingFuel, setCheckingFuel] = useState(false);
  const [squareCustomerId, setSquareCustomerId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showLocationGate, setShowLocationGate] = useState(false);

  const [fuelBalances, setFuelBalances] = useState<FuelBalances>({
    medium: 0,
    large: 0,
    xl: 0,
    jumbo: 0,
  });

  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [menuItemForEdit, setMenuItemForEdit] = useState<MenuItem | null>(null);
  const [menuItemsForEdit, setMenuItemsForEdit] = useState<MenuItem[]>([]);

  const [showEmbeddedCheckout, setShowEmbeddedCheckout] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [orderSubtotal, setOrderSubtotal] = useState<number>(0);
  const [orderTax, setOrderTax] = useState<number>(0);

  const orderingOpen = isWithinOrderingHours();
  const testingMode = process.env.NEXT_PUBLIC_CHECKOUT_TESTING_MODE === "true";
  const canOrder = orderingOpen || testingMode;
  const timeSlots = generatePickupSlots();
  const readyTime = getReadyTime();

  useEffect(() => {
    if (!isOpen) {
      setShowEmbeddedCheckout(false);
      setOrderId(null);
      setOrderTotal(0);
      setOrderSubtotal(0);
      setOrderTax(0);
      setCheckoutError(null);
    }
  }, [isOpen]);

  /* -------------------------------- */
  /* Detect Redemption Items          */
  /* -------------------------------- */

  const redemptionItem = items.find((item) =>
    Object.values(REDEEM_VARIATIONS).includes(item.variationId)
  );

  const redemptionInCart = Boolean(redemptionItem);

  const redemptionSize = redemptionItem
    ? Object.entries(REDEEM_VARIATIONS).find(
        ([, id]) => id === redemptionItem.variationId
      )?.[0]
    : null;

  const redemptionQuantity = redemptionItem
    ? Number(redemptionItem.quantity || 0)
    : 0;

  /* -------------------------------- */
  /* Fetch menu item for edit         */
  /* -------------------------------- */

  useEffect(() => {
    if (!editingCartItem || !selectedLocation) {
      setMenuItemForEdit(null);
      setMenuItemsForEdit([]);
      if (!selectedLocation && editingCartItem) setEditingCartItem(null);
      return undefined;
    }

    let mounted = true;

    async function fetchItem() {
      try {
        const res = await fetch(
          `/api/square/catalog?location=${selectedLocation!.id}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!mounted) return;
        const fetchedItems: MenuItem[] = data?.items ?? [];
        const found = fetchedItems.find((i) => i.id === editingCartItem!.itemId);
        if (mounted) {
          setMenuItemForEdit(found ?? null);
          setMenuItemsForEdit(fetchedItems);
          if (!found) setEditingCartItem(null);
        }
      } catch {
        if (mounted) {
          setMenuItemForEdit(null);
          setMenuItemsForEdit([]);
          setEditingCartItem(null);
        }
      }
    }

    fetchItem();
    return () => {
      mounted = false;
    };
  }, [editingCartItem?.id, editingCartItem?.itemId, selectedLocation?.id]);

  /* -------------------------------- */
  /* Detect Fuel Pack Purchases       */
  /* -------------------------------- */

  const fuelPackItem = items.find((item) =>
    Object.values(PACK_VARIATIONS).includes(item.variationId)
  );

  const fuelPackInCart = Boolean(fuelPackItem);

  const packSize = fuelPackItem
    ? Object.entries(PACK_VARIATIONS).find(
        ([, id]) => id === fuelPackItem.variationId
      )?.[0]
    : null;

  const phoneRequired = redemptionInCart || fuelPackInCart;

  /* -------------------------------- */
  /* Fuel Balance Check               */
  /* -------------------------------- */

  async function checkFuelBalance() {
    if (!phone) return null;

    setCheckingFuel(true);

    try {
      const res = await fetch("/api/fuel/check-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          size: redemptionSize ?? undefined,
        }),
      });

      const data = await res.json();

      if (data?.squareCustomerId) {
        setSquareCustomerId(data.squareCustomerId);
      }

      setFuelBalances({
        medium: data?.balances?.medium ?? 0,
        large: data?.balances?.large ?? 0,
        xl: data?.balances?.xl ?? 0,
        jumbo: data?.balances?.jumbo ?? 0,
      });

      return data;
    } catch (error) {
      console.error("Fuel balance check failed:", error);
      return null;
    } finally {
      setCheckingFuel(false);
    }
  }

  /* -------------------------------- */
  /* Checkout                         */
  /* -------------------------------- */

  async function handleCheckout() {
    setCheckoutError(null);

    if (!selectedLocation) {
      setCheckoutError("Please select a pickup location.");
      setShowLocationGate(true);
      return;
    }

    const pickupTimeForCheck = new Date(pickupDate);
    if (isLocationClosed(selectedLocation.id, pickupTimeForCheck)) {
      setCheckoutError(
        getLocationClosureMessage(selectedLocation.id, pickupTimeForCheck) ??
          "This location is closed for the selected pickup time. Please choose another location or time."
      );
      setShowLocationGate(true);
      return;
    }

    if (!canOrder) {
      setCheckoutError("Online ordering is available between 8AM and 6PM.");
      return;
    }

    if (!email.trim()) {
      setCheckoutError("Email is required for your receipt.");
      return;
    }
    if (!isValidEmail(email)) {
      setCheckoutError("Please enter a valid email address.");
      return;
    }

    if (phoneRequired) {
      if (!phone.trim()) {
        setCheckoutError("Phone number is required for this order.");
        return;
      }
      if (!isValidUSPhone(phone)) {
        setCheckoutError("Please enter a valid 10-digit phone number.");
        return;
      }
    }

    if (fuelPackInCart && redemptionInCart && packSize !== redemptionSize) {
      setCheckoutError("Fuel Pack redemption must match the pack size.");
      return;
    }

    if (redemptionInCart) {
      const data = await checkFuelBalance();

      if (!data?.allowed) {
        setCheckoutError(data?.message || "No drinks remaining.");
        return;
      }

      const remaining =
        redemptionSize === "MEDIUM"
          ? data.balances?.medium ?? 0
          : redemptionSize === "LARGE"
          ? data.balances?.large ?? 0
          : redemptionSize === "XL"
          ? data.balances?.xl ?? 0
          : redemptionSize === "JUMBO"
          ? data.balances?.jumbo ?? 0
          : 0;

      if (redemptionQuantity > remaining) {
        setCheckoutError(`You only have ${remaining} drink${remaining === 1 ? "" : "s"} remaining.`);
        return;
      }
    }

    const res = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items,
        pickupTime: pickupDate.toISOString(),
        notes,
        locationId: selectedLocation.id,
        phone,
        squareCustomerId,
        displayName: displayName.trim() || undefined,
        email: email.trim() || undefined,
      }),
    });

    const data = await res.json();

    if (data.orderId && typeof data.total === "number") {
      setOrderId(data.orderId);
      setOrderTotal(data.total);
      setOrderSubtotal(data.subtotal ?? data.total);
      setOrderTax(data.tax ?? 0);
      setShowEmbeddedCheckout(true);
    } else {
      setCheckoutError(data?.error || "Checkout failed. Please try again.");
    }
  }

  function handlePaymentSuccess() {
    clearCart();
    closeCart();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    const params = orderId ? `?orderId=${encodeURIComponent(orderId)}` : "";
    window.location.href = `${baseUrl}/ordersuccess${params}`;
  }

  function handleEmbeddedCheckoutBack() {
    setShowEmbeddedCheckout(false);
    setOrderId(null);
    setOrderTotal(0);
    setOrderSubtotal(0);
    setOrderTax(0);
    setCheckoutError(null);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />

      <div className="relative w-full md:w-[440px] bg-white h-full flex flex-col">

        {/* HEADER - v3 */}

        <div className="px-6 py-5 border-b border-neutral-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[var(--color-charcoal)]">
            {showEmbeddedCheckout ? "Payment" : "Your Order"}
          </h2>
          <button
            onClick={closeCart}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 text-[var(--color-muted)] transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* BODY - Cart or Embedded Checkout */}

        {showEmbeddedCheckout && orderId && selectedLocation ? (
          <EmbeddedCheckout
            items={items.map((i) => ({
              ...i,
              variationName: getFuelVariationDisplayName(i.variationId) ?? i.variationName,
            }))}
            total={orderTotal}
            subtotal={orderSubtotal}
            tax={orderTax}
            orderId={orderId}
            locationId={selectedLocation.id}
            allowQuickCheckout={true}
            onSuccess={handlePaymentSuccess}
            onBack={handleEmbeddedCheckoutBack}
            onError={setCheckoutError}
            error={checkoutError}
          />
        ) : (
        <>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* LOCATION - v3 */}

          <div className="bg-[var(--color-orange-light)]/50 border border-[var(--color-orange)]/20 p-4 rounded-xl">
            {selectedLocation ? (
              <>
                <p className="font-medium text-[var(--color-charcoal)]">{selectedLocation.name}</p>
                <p className="text-sm text-[var(--color-muted)]">
                  {selectedLocation.address}
                </p>
                {selectedLocation && isLocationClosed(selectedLocation.id, pickupDate) && (
                  <p className="mt-2 text-sm text-amber-600 font-medium">
                    Closed for selected pickup time. Choose another time or location.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setShowLocationGate(true)}
                  className="mt-2 text-sm text-[var(--color-orange)] hover:text-[var(--color-orange-dark)] font-medium"
                >
                  Change location
                </button>
              </>
            ) : (
              <>
                <p className="font-medium text-[var(--color-charcoal)]">Pickup location</p>
                <p className="text-sm text-[var(--color-muted)] mb-2">
                  Select where you&apos;d like to pick up your order.
                </p>
                <button
                  type="button"
                  onClick={() => setShowLocationGate(true)}
                  className="text-sm text-[var(--color-orange)] hover:text-[var(--color-orange-dark)] font-medium"
                >
                  Select location →
                </button>
              </>
            )}
          </div>

         {/* PICKUP TIME - v3 */}

<div className="space-y-3">

  <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
    Ready Around {readyTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
  </p>

  {/* MOBILE TIME PODS */}

  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 md:hidden">

    {timeSlots.map((time) => (
      <button
        key={time.value}
        onClick={() => setPickupDate(time.date)}
        className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
          pickupDate.getTime() === time.date.getTime()
            ? "bg-[var(--color-orange)] text-black border border-[var(--color-orange)]"
            : "bg-neutral-100 text-[var(--color-charcoal)] border border-transparent hover:bg-neutral-200"
        }`}
      >
        {time.label}
      </button>
    ))}

  </div>

  {/* DESKTOP SELECTOR */}

  <div className="hidden md:block">

    <select
      value={pickupDate.toISOString()}
      onChange={(e) => {
        const selected = timeSlots.find(slot => slot.value === e.target.value)
        if (selected) setPickupDate(selected.date)
      }}
      className="w-full border border-neutral-100 rounded-xl px-4 py-3 bg-white text-[var(--color-charcoal)] focus:border-[var(--color-orange)] focus:ring-1 focus:ring-[var(--color-orange)] focus:outline-none"
    >

      {timeSlots.map((slot) => (
        <option key={slot.value} value={slot.value}>
          {slot.label}
        </option>
      ))}

    </select>

  </div>

</div>

          {/* EMAIL (for receipt) */}

          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-2">
              Email for receipt <span className="normal-case font-normal">(required)</span>
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setCheckoutError(null);
              }}
              placeholder="you@example.com"
              className="w-full bg-neutral-100 rounded-xl px-4 py-3 text-[var(--color-charcoal)] placeholder:text-[var(--color-muted)] focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent focus:outline-none"
            />
          </div>

          {/* DISPLAY NAME (optional) */}

          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-2">
              Name for order <span className="normal-case font-normal">(optional)</span>
            </p>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full bg-neutral-100 rounded-xl px-4 py-3 text-[var(--color-charcoal)] placeholder:text-[var(--color-muted)] focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent focus:outline-none"
            />
          </div>

          {/* PHONE INPUT */}

          {phoneRequired && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-2">
                Phone Number Required
              </p>

              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value;
                  setPhone(value);
                  setCheckoutError(null);

                  if (redemptionInCart && isValidUSPhone(value)) {
                    checkFuelBalance();
                  }
                }}
                placeholder="Enter phone number"
                className="w-full bg-neutral-100 rounded-xl px-4 py-3 text-[var(--color-charcoal)] placeholder:text-[var(--color-muted)] focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent focus:outline-none"
              />
            </div>
          )}

          {/* FUEL BALANCES */}

          {redemptionInCart && phone && (
            <div className="bg-[var(--color-orange-light)]/50 border border-[var(--color-orange)]/20 rounded-xl px-4 py-4 space-y-2">
              <p className="text-sm font-semibold text-[var(--color-charcoal)]">
                Fuel Balance
              </p>

              <div className="flex justify-between text-sm text-[var(--color-charcoal)]">
                <span>Medium</span>
                <span>{fuelBalances.medium}</span>
              </div>

              <div className="flex justify-between text-sm text-[var(--color-charcoal)]">
                <span>Large</span>
                <span>{fuelBalances.large}</span>
              </div>

              <div className="flex justify-between text-sm text-[var(--color-charcoal)]">
                <span>XL</span>
                <span>{fuelBalances.xl}</span>
              </div>

              <div className="flex justify-between text-sm text-[var(--color-charcoal)]">
                <span>Jumbo</span>
                <span>{fuelBalances.jumbo}</span>
              </div>
            </div>
          )}

          {/* CART ITEMS */}

          {items.map((item) => (
            <div key={item.id} className="border border-neutral-100 rounded-xl p-4">

              <p className="font-medium text-[var(--color-charcoal)]">{item.itemName}</p>

              <p className="text-sm text-[var(--color-muted)]">
                {getFuelVariationDisplayName(item.variationId) ?? item.variationName}
              </p>

              {item.modifiers && item.modifiers.length > 0 && (
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  + {item.modifiers.map((m) => `${m.name}${(m.quantity ?? 1) > 1 ? ` (×${m.quantity})` : ""}`).join(", ")}
                </p>
              )}

              <div className="flex justify-between items-center mt-3">

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                    className="w-9 h-9 rounded-full border border-neutral-100 flex items-center justify-center text-[var(--color-charcoal)] hover:bg-neutral-50 transition"
                  >
                    −
                  </button>

                  <span className="font-medium text-[var(--color-charcoal)] w-6 text-center">{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                    className="w-9 h-9 rounded-full border border-neutral-100 flex items-center justify-center text-[var(--color-charcoal)] hover:bg-neutral-50 transition"
                  >
                    +
                  </button>

                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingCartItem(item)}
                    className="text-sm text-[var(--color-orange)] hover:text-[var(--color-orange-dark)] font-medium transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-[var(--color-orange)] hover:text-[var(--color-orange-dark)] font-medium transition"
                  >
                    Remove
                  </button>
                </div>

              </div>

            </div>
          ))}

        </div>

        {/* FOOTER - v3 */}

        <div className="border-t border-neutral-100 p-6">

          {checkoutError && (
            <p className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">
              {checkoutError}
            </p>
          )}

          <div className="flex justify-between text-lg font-semibold mb-4 text-[var(--color-charcoal)]">
            <span>Total</span>
            <span>${(getCartTotal() / 100).toFixed(2)}</span>
          </div>

          {(() => {
            const locationClosedForPickup =
              selectedLocation && isLocationClosed(selectedLocation.id, pickupDate);
            return (
              <button
                type="button"
                onClick={handleCheckout}
                disabled={
                  !canOrder ||
                  !email.trim() ||
                  !isValidEmail(email) ||
                  (phoneRequired && (!phone.trim() || !isValidUSPhone(phone))) ||
                  checkingFuel ||
                  !!locationClosedForPickup
                }
                className={`w-full py-4 rounded-full font-semibold transition ${
                  canOrder &&
                  email.trim() &&
                  isValidEmail(email) &&
                  (!phoneRequired || (phone.trim() && isValidUSPhone(phone))) &&
                  selectedLocation &&
                  !checkingFuel &&
                  !locationClosedForPickup
                    ? "bg-[var(--color-orange)] text-black hover:opacity-90"
                    : "bg-neutral-200 text-[var(--color-muted)] cursor-not-allowed"
                }`}
              >
                {!selectedLocation
                  ? "Select Location"
                  : !canOrder
                  ? "Ordering Closed"
                  : locationClosedForPickup
                  ? "Location Closed — Change Time/Location"
                  : !email.trim()
                  ? "Enter Email for Receipt"
                  : !isValidEmail(email)
                  ? "Enter Valid Email"
                  : phoneRequired && !phone.trim()
                  ? "Enter Phone Number"
                  : phoneRequired && !isValidUSPhone(phone)
                  ? "Enter Valid Phone"
                  : checkingFuel
                  ? "Checking Balance..."
                  : "Checkout"}
              </button>
            );
          })()}

        </div>
        </>
        )}

      </div>

      {showLocationGate && (
        <LocationGate onClose={() => setShowLocationGate(false)} />
      )}

      <MenuItemModal
        item={menuItemForEdit}
        isOpen={Boolean(editingCartItem && menuItemForEdit)}
        onClose={() => setEditingCartItem(null)}
        existingCartItem={editingCartItem}
        allMenuItems={menuItemsForEdit}
      />
    </div>
  );
}