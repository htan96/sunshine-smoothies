"use client";

import { useEffect } from "react";
import { useCartStore } from "@/features/cart/store";

export default function OrderSuccess() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4">
          🎉 Order Confirmed!
        </h1>
        <p className="text-neutral-600">
          Thank you for your order. We’re preparing it now.
        </p>
      </div>
    </div>
  );
}