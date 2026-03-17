"use client";

import { useCartStore } from "@/features/cart/store";
import CartDrawer from "./CartDrawer";
import CheckoutModal from "@/components/checkout/CheckoutModal";

const TESTING_MODE =
  process.env.NEXT_PUBLIC_CHECKOUT_TESTING_MODE === "true";

export default function CartWithCheckoutModal() {
  const checkoutModalOpen = useCartStore((s) => s.checkoutModalOpen);
  const closeCheckoutModal = useCartStore((s) => s.closeCheckoutModal);
  const openCartDrawer = useCartStore((s) => s.openCartDrawer);

  return (
    <>
      <CartDrawer />
      {TESTING_MODE && (
        <CheckoutModal
          isOpen={checkoutModalOpen}
          onClose={closeCheckoutModal}
          onContinueToPayment={() => {
            closeCheckoutModal();
            openCartDrawer();
          }}
          testingMode={TESTING_MODE}
        />
      )}
    </>
  );
}
