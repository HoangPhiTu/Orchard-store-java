import { useMemo } from "react";
import { useCartStore } from "@/stores/cart-store";

export function useCart() {
  const cart = useCartStore();
  const totalItems = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items]
  );
  return { ...cart, totalItems };
}
