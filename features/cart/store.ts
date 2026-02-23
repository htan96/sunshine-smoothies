import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  itemId: string;
  itemName: string;
  image?: string;
  variationId: string;
  variationName: string;
  basePrice: number;
  modifiers: {
    modifierListId: string;
    modifierId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  quantity: number;
};

type CartStore = {
  items: CartItem[];
  isOpen: boolean;

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void; // 🔥 added
  clearCart: () => void;

  getItemCount: () => number;
  getCartTotal: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () =>
        set((state) => ({ isOpen: !state.isOpen })),

      addItem: (newItem) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.itemId === newItem.itemId &&
              item.variationId === newItem.variationId &&
              JSON.stringify(item.modifiers) ===
                JSON.stringify(newItem.modifiers)
          );

          if (existingIndex !== -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity +=
              newItem.quantity;

            return {
              items: updatedItems,
              isOpen: true,
            };
          }

          return {
            items: [...state.items, newItem],
            isOpen: true,
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id
                ? { ...item, quantity: Math.max(1, quantity) }
                : item
            )
            .filter((item) => item.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),

      getItemCount: () =>
        get().items.reduce(
          (total, item) => total + item.quantity,
          0
        ),

      getCartTotal: () =>
        get().items.reduce((total, item) => {
          const modifierTotal = item.modifiers.reduce(
            (sum, m) => sum + m.price * m.quantity,
            0
          );

          return (
            total +
            (item.basePrice + modifierTotal) *
              item.quantity
          );
        }, 0),
    }),
    {
      name: "sunshine-cart",
    }
  )
);