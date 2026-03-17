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
  checkoutModalOpen: boolean;

  openCart: () => void;
  openCartDrawer: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openCheckoutModal: () => void;
  closeCheckoutModal: () => void;

  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  replaceItem: (cartItemId: string, newItem: Omit<CartItem, "id">) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  getItemCount: () => number;
  getCartTotal: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      checkoutModalOpen: false,

      openCart: () =>
        set((state) => {
          const testingMode =
            process.env.NEXT_PUBLIC_CHECKOUT_TESTING_MODE === "true";
          if (testingMode) return { checkoutModalOpen: true };
          return { isOpen: true };
        }),
      openCartDrawer: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () =>
        set((state) => {
          const testingMode =
            process.env.NEXT_PUBLIC_CHECKOUT_TESTING_MODE === "true";
          if (testingMode)
            return { checkoutModalOpen: !state.checkoutModalOpen };
          return { isOpen: !state.isOpen };
        }),
      openCheckoutModal: () => set({ checkoutModalOpen: true }),
      closeCheckoutModal: () => set({ checkoutModalOpen: false }),

      addItem: (newItem) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.itemId === newItem.itemId &&
              item.variationId === newItem.variationId &&
              JSON.stringify(item.modifiers) ===
                JSON.stringify(newItem.modifiers)
          );

          const testingMode =
            process.env.NEXT_PUBLIC_CHECKOUT_TESTING_MODE === "true";

          if (existingIndex !== -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity +=
              newItem.quantity;

            return {
              items: updatedItems,
              ...(testingMode
                ? { checkoutModalOpen: true }
                : { isOpen: true }),
            };
          }

          return {
            items: [...state.items, newItem],
            ...(testingMode
              ? { checkoutModalOpen: true }
              : { isOpen: true }),
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      replaceItem: (cartItemId, newItem) =>
        set((state) => {
          const filtered = state.items.filter((i) => i.id !== cartItemId);
          const updated = [
            ...filtered,
            { ...newItem, id: cartItemId },
          ];
          return { items: updated };
        }),

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