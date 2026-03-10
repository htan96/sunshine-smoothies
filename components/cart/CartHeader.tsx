"use client";

type Props = {
  closeCart: () => void;
};

export default function CartHeader({ closeCart }: Props) {
  return (
    <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
      <h2 className="text-lg font-semibold tracking-tight">
        Your Order
      </h2>

      <button
        onClick={closeCart}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition"
      >
        ✕
      </button>
    </div>
  );
}