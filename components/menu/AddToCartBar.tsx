"use client";

type Props = {
  quantity: number;
  setQuantity: (fn: (q: number) => number) => void;
  totalPrice: number;
  onAdd: () => void;
};

export default function AddToCartBar({
  quantity,
  setQuantity,
  totalPrice,
  onAdd,
}: Props) {
  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 w-full bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">

        <div className="flex items-center gap-4">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-4 py-2 bg-neutral-200 rounded-lg"
          >
            −
          </button>

          <span className="text-lg font-semibold">{quantity}</span>

          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-4 py-2 bg-neutral-200 rounded-lg"
          >
            +
          </button>
        </div>

        <div className="text-lg font-semibold">
          Total: ${(totalPrice / 100).toFixed(2)}
        </div>

        <button
          onClick={onAdd}
          className="bg-black text-white px-8 py-3 rounded-full text-lg font-semibold hover:opacity-90 transition"
        >
          Add to Order
        </button>

      </div>
    </div>
  );
}