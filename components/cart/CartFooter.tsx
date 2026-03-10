type Props = {
  total: number;
  orderingOpen: boolean;
  redemptionInCart: boolean;
  phone: string;
  checkingFuel: boolean;
  handleCheckout: () => void;
};

export default function CartFooter({
  total,
  orderingOpen,
  redemptionInCart,
  phone,
  checkingFuel,
  handleCheckout,
}: Props) {
  return (
    <div className="border-t border-neutral-100 px-6 py-5 bg-white space-y-4">

      {!orderingOpen && (
        <p className="text-xs text-red-500 text-center">
          Online ordering is available daily from 8:00 AM to 6:00 PM.
        </p>
      )}

      <div className="flex justify-between text-lg font-semibold">
        <span>Total</span>
        <span>${(total / 100).toFixed(2)}</span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={
          !orderingOpen ||
          (redemptionInCart && !phone.trim()) ||
          checkingFuel
        }
        className={`w-full py-4 rounded-full font-semibold transition ${
          orderingOpen &&
          (!redemptionInCart || phone.trim())
            ? "bg-black text-white hover:opacity-90"
            : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
        }`}
      >

        {!orderingOpen
          ? "Ordering Closed (8AM–6PM)"
          : redemptionInCart && !phone.trim()
          ? "Enter Phone Number to Redeem"
          : checkingFuel
          ? "Checking Balance..."
          : "Checkout"}

      </button>
    </div>
  );
}