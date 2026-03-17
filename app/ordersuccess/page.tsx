"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/features/cart/store";

function OrderSuccessContent() {
  const clearCart = useCartStore((state) => state.clearCart);
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");
  const checkoutId = searchParams.get("checkoutId");

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-[var(--color-charcoal)]">
          🎉 Order Confirmed!
        </h1>
        <p className="text-[var(--color-muted)] mb-6">
          Thank you for your order. We&apos;re preparing it now.
        </p>
        {(orderId || checkoutId) && (
          <p className="text-sm text-neutral-500 mb-6 font-mono">
            {orderId && <>Order: {orderId}</>}
            {orderId && checkoutId && " • "}
            {checkoutId && <>Checkout: {checkoutId}</>}
          </p>
        )}
        <Link
          href="/menu"
          className="inline-block rounded-full bg-[var(--color-orange)] px-8 py-3 font-semibold text-black hover:opacity-90 transition"
        >
          Order Again
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
          <p className="text-neutral-500">Loading...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}