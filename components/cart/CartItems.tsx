type Props = {
  items: any[];
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
};

export default function CartItems({
  items,
  removeItem,
  updateQuantity,
}: Props) {
  return (
    <div className="border-t pt-6 space-y-6">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-medium">{item.itemName}</p>

              <p className="text-sm text-neutral-500">
                {item.variationName}
              </p>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              className="text-xs text-neutral-400 hover:text-red-500 transition"
            >
              Remove
            </button>
          </div>

          <div className="flex justify-between items-center">

            <div className="flex items-center bg-neutral-100 rounded-full">

              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="px-4 py-1 text-sm"
              >
                −
              </button>

              <span className="px-4 text-sm">
                {item.quantity}
              </span>

              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="px-4 py-1 text-sm"
              >
                +
              </button>

            </div>

            <span className="font-medium text-sm">

              $
              {(
                ((item.basePrice +
                  item.modifiers.reduce(
                    (sum: number, m: any) =>
                      sum + m.price * m.quantity,
                    0
                  )) *
                  item.quantity) /
                100
              ).toFixed(2)}

            </span>

          </div>
        </div>
      ))}
    </div>
  );
}