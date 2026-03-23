"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { WalletErrorBoundary } from "./WalletErrorBoundary";

const PaymentForm = dynamic(
  () =>
    import("react-square-web-payments-sdk").then((mod) => mod.PaymentForm),
  { ssr: false }
);

const CreditCard = dynamic(
  () => import("react-square-web-payments-sdk").then((mod) => mod.CreditCard),
  { ssr: false }
);

const ApplePay = dynamic(
  () => import("react-square-web-payments-sdk").then((mod) => mod.ApplePay),
  { ssr: false }
);

const GooglePay = dynamic(
  () => import("react-square-web-payments-sdk").then((mod) => mod.GooglePay),
  { ssr: false }
);

/* -------------------------------- */
/* Types                            */
/* -------------------------------- */

type CartItem = {
  id: string;
  itemName: string;
  variationName: string;
  modifiers?: { name: string; quantity?: number }[];
  quantity: number;
};

export type EmbeddedCheckoutProps = {
  items: CartItem[];
  total: number; // cents
  subtotal?: number; // cents, before tax
  tax?: number; // cents
  orderId: string;
  locationId: string;
  /** When true, show Apple Pay / Google Pay as quick checkout (no fuel pack/redemption in cart) */
  allowQuickCheckout?: boolean;
  onSuccess: () => void;
  onBack: () => void;
  onError: (message: string) => void;
  error?: string | null;
};

/* -------------------------------- */
/* Component                        */
/* -------------------------------- */

const SQUARE_APP_ID = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;

export default function EmbeddedCheckout({
  items,
  total,
  subtotal = total,
  tax = 0,
  orderId,
  locationId,
  allowQuickCheckout = false,
  onSuccess,
  onBack,
  onError,
  error,
}: EmbeddedCheckoutProps) {
  const [submitting, setSubmitting] = useState(false);
  const [tipPercent, setTipPercent] = useState<number | "custom">(0);
  const [customTipCents, setCustomTipCents] = useState("");
  const [hideWallets, setHideWallets] = useState(false);

  // Hide wallets on localhost / non-HTTPS (domain won't be registered for Apple Pay)
  // Also catch PaymentMethodUnsupportedError when it fires
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.protocol !== "https:")
    ) {
      setHideWallets(true);
      return;
    }
    const handler = (e: PromiseRejectionEvent) => {
      const msg = e.reason?.message ?? String(e.reason ?? "");
      if (
        e.reason?.name === "PaymentMethodUnsupportedError" ||
        msg.includes("not registered") ||
        msg.includes("domain")
      ) {
        setHideWallets(true);
        e.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  const tipCents =
    tipPercent === "custom"
      ? Math.round(parseFloat(customTipCents || "0") * 100)
      : Math.round((subtotal * (tipPercent / 100)));
  const totalWithTip = total + tipCents;

  if (!SQUARE_APP_ID) {
    return (
      <div className="p-6 text-center text-red-600">
        Square is not configured. Add NEXT_PUBLIC_SQUARE_APPLICATION_ID to your
        environment.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Order Summary */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <h3 className="font-semibold text-[var(--color-charcoal)]">
          Order Summary
        </h3>

        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between text-sm text-[var(--color-charcoal)]"
            >
              <span>
                {item.quantity}× {item.itemName} ({item.variationName})
                {item.modifiers && item.modifiers.length > 0 && (
                  <span className="text-[var(--color-muted)]">
                    {" "}
                    + {item.modifiers.map((m) => m.name).join(", ")}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-1 pt-2 border-t border-neutral-100">
          {tax > 0 ? (
            <>
              <div className="flex justify-between text-sm text-[var(--color-charcoal)]">
                <span>Subtotal</span>
                <span className="tabular-nums">${(subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--color-charcoal)]">
                <span>Tax{subtotal > 0 ? ` (${Math.round((tax / subtotal) * 100)}%)` : ""}</span>
                <span className="tabular-nums">${(tax / 100).toFixed(2)}</span>
              </div>
            </>
          ) : null}
          <div className="flex justify-between font-bold text-[var(--color-charcoal)] pt-2">
            <span>Total</span>
            <span className="tabular-nums">${(total / 100).toFixed(2)}</span>
          </div>
          <p className="text-xs text-[var(--color-muted)] pt-0.5">
            Tax included · Matches cart total
          </p>
        </div>

        {/* Tip options */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-charcoal)]">
            Add a tip
          </p>
          <div className="flex gap-2 flex-wrap">
            {[
              [0, "No tip"],
              [15, "15%"],
              [20, "20%"],
              [25, "25%"],
            ].map(([pct, label]) => (
              <button
                key={pct}
                type="button"
                onClick={() => {
                  setTipPercent(pct as number);
                  setCustomTipCents("");
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  tipPercent === pct
                    ? "bg-[var(--color-orange)] text-black"
                    : "bg-neutral-100 text-[var(--color-charcoal)] hover:bg-neutral-200"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setTipPercent("custom")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                tipPercent === "custom"
                  ? "bg-[var(--color-orange)] text-black"
                  : "bg-neutral-100 text-[var(--color-charcoal)] hover:bg-neutral-200"
              }`}
            >
              Custom
            </button>
          </div>
          {tipPercent === "custom" && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-sm text-[var(--color-muted)]">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={customTipCents}
                onChange={(e) => setCustomTipCents(e.target.value)}
                placeholder="0.00"
                className="w-24 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-orange)] focus:border-transparent focus:outline-none"
              />
            </div>
          )}
          {tipCents > 0 && (
            <div className="flex justify-between text-sm text-[var(--color-charcoal)]">
              <span>Tip</span>
              <span>${(tipCents / 100).toFixed(2)}</span>
            </div>
          )}
          {tipCents > 0 && (
            <div className="flex justify-between font-semibold text-[var(--color-charcoal)] pt-1 border-t border-neutral-100">
              <span>Total with tip</span>
              <span>${(totalWithTip / 100).toFixed(2)}</span>
            </div>
          )}
        </div>

        {error && (
          <p className="px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">
            {error}
          </p>
        )}

        {/* Payment */}
        <div className="pt-4">
          <h3 className="font-semibold text-[var(--color-charcoal)] mb-3">
            Payment
          </h3>
          <PaymentForm
            applicationId={SQUARE_APP_ID}
            locationId={locationId}
            createPaymentRequest={() => ({
              countryCode: "US",
              currencyCode: "USD",
              total: {
                amount: (totalWithTip / 100).toFixed(2),
                label: "Total",
              },
            })}
            cardTokenizeResponseReceived={async (tokenResult) => {
              const token =
                tokenResult && "token" in tokenResult
                  ? tokenResult.token
                  : undefined;
              if (!token) {
                onError("Failed to tokenize card.");
                return;
              }
              setSubmitting(true);

              try {
                const res = await fetch("/api/checkout/payment", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    sourceId: token,
                    orderId,
                    locationId,
                    tipCents: tipCents > 0 ? tipCents : undefined,
                  }),
                });

                const data = await res.json();

                if (!res.ok) {
                  onError(data?.error || "Payment failed.");
                  setSubmitting(false);
                  return;
                }

                onSuccess();
              } catch (err) {
                console.error("Payment error:", err);
                onError("Payment failed. Please try again.");
                setSubmitting(false);
              }
            }}
          >
            {allowQuickCheckout && !hideWallets && (
              <div className="space-y-3 mb-4">
                <p className="text-sm text-[var(--color-muted)]">
                  Quick checkout
                </p>
                <div className="flex flex-col gap-2">
                  <WalletErrorBoundary>
                    <div className="min-h-[44px]">
                      <ApplePay id="apple-pay-container" />
                    </div>
                  </WalletErrorBoundary>
                  <WalletErrorBoundary>
                    <div className="min-h-[40px]">
                      <GooglePay
                        id="google-pay-container"
                        buttonSizeMode="fill"
                        buttonType="long"
                      />
                    </div>
                  </WalletErrorBoundary>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1 border-t border-neutral-100" />
                  <span className="text-xs text-[var(--color-muted)]">
                    or pay with card
                  </span>
                  <div className="flex-1 border-t border-neutral-100" />
                </div>
              </div>
            )}
            <CreditCard
              render={(PayButton) => (
                <div className="space-y-3 mt-4">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onBack}
                      disabled={submitting}
                      className="flex-1 py-3 rounded-full font-medium border border-neutral-200 text-[var(--color-charcoal)] hover:bg-neutral-50 disabled:opacity-50 transition"
                    >
                      Back
                    </button>
                    <PayButton
                      className="flex-1 py-3 rounded-full font-semibold bg-[var(--color-orange)] text-black hover:opacity-90 disabled:opacity-50 transition"
                      isLoading={submitting}
                    >
                      {submitting ? "Processing…" : "Pay $" + (totalWithTip / 100).toFixed(2)}
                    </PayButton>
                  </div>
                  <p className="text-center text-xs text-[var(--color-muted)]">
                    <a
                      href="https://squareup.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[var(--color-charcoal)] transition"
                    >
                      Powered by Square
                    </a>
                  </p>
                </div>
              )}
            />
          </PaymentForm>
        </div>
      </div>
    </div>
  );
}
