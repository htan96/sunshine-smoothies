"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/features/cart/store";

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-10 h-10"
    >
      <path d="M5 12l5 5 10-10" />
    </svg>
  );
}

function OrderSuccessContent() {
  const clearCart = useCartStore((state) => state.clearCart);
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");
  const checkoutId = searchParams.get("checkoutId");

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const orderRef = orderId || checkoutId;
  const shortOrderId = orderId?.slice(-8).toUpperCase() || checkoutId?.slice(-8)?.toUpperCase();

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 sm:px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
          {/* Success header */}
          <div className="bg-[var(--color-orange)] px-8 pt-12 pb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white text-[var(--color-orange)] mb-6">
              <CheckIcon />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[var(--color-charcoal)]">
              Order Confirmed
            </h1>
            <p className="mt-2 text-[var(--color-charcoal)]/80 text-sm sm:text-base">
              Thank you for your order
            </p>
          </div>

          <div className="px-8 py-8">
            <p className="text-[var(--color-muted)] text-center text-sm leading-relaxed">
              We&apos;re preparing your order now. You&apos;ll receive a receipt by email shortly.
            </p>

            {orderRef && (
              <div className="mt-6 px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <p className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-1">
                  Order reference
                </p>
                <p className="font-mono text-sm font-medium text-[var(--color-charcoal)] break-all">
                  {shortOrderId ? `#${shortOrderId}` : orderRef}
                </p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Keep this for your records
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/menu"
                className="flex-1 inline-flex items-center justify-center rounded-full bg-[var(--color-orange)] px-6 py-3.5 font-semibold text-[var(--color-charcoal)] hover:opacity-90 transition text-center"
              >
                Order Again
              </Link>
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center rounded-full border border-neutral-200 px-6 py-3.5 font-medium text-[var(--color-charcoal)] hover:bg-neutral-50 transition text-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-muted)]">
          Questions? Visit our{" "}
          <Link href="/location" className="text-[var(--color-orange)] hover:underline">
            locations
          </Link>{" "}
          page for contact info.
        </p>
      </div>
    </div>
  );
}

export default function OrderSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-neutral-100 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-neutral-200 rounded mx-auto" />
              <div className="h-4 w-64 bg-neutral-100 rounded mx-auto" />
            </div>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
