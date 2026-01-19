import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";
import { useApi, getBaseURL } from "../lib/api";
import { useAuth } from "./AuthContext";

// ------------------
// Types
// ------------------

export interface CartItem {
  productId: string;
  quantity: number;
  size: string;
  color: string;
  price?: number;
  name?: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  addItem: (item: any, size?: string, color?: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string, size: string, color: string) => Promise<void>;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  itemCount: number;
  total: number;
}

// ------------------
// Context
// ------------------

const CartContext = createContext<CartContextType | undefined>(undefined);

// ------------------
// Provider
// ------------------

export const CartProvider = ({ children }: { children: React.ReactNode }) => {

  const api = useApi();
  const { auth, isLoading: authLoading } = useAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ------------------
  // Load cart on auth change
  // ------------------

  useEffect(() => {

    if (authLoading) return;

    if (auth) {
      // merge any guest cart stored locally into the user's server cart, then fetch
      mergeGuestCart();
    } else {
      loadGuestCart();
    }

  }, [auth, authLoading]);

  // ------------------
  // Merge guest cart on login
  // ------------------

  const mergeGuestCart = async () => {
    try {
      const local = localStorage.getItem('guest_cart');
      if (!local) {
        await fetchCart();
        return;
      }

      const guestItems: CartItem[] = JSON.parse(local);
      if (!guestItems || !guestItems.length) {
        await fetchCart();
        return;
      }

      setIsLoading(true);
      // backend expects items array with productId and quantity (and optional size/color)
      await api.post('/cart/merge', { items: guestItems });
      localStorage.removeItem('guest_cart');
      await fetchCart();
    } catch (err) {
      // fallback: just fetch server cart
      await fetchCart();
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------
  // Guest Helpers
  // ------------------

  const loadGuestCart = () => {
    const local = localStorage.getItem("guest_cart");
    setItems(local ? JSON.parse(local) : []);
  };

  const saveGuestCart = (data: CartItem[]) => {
    localStorage.setItem("guest_cart", JSON.stringify(data));
  };

  // ------------------
  // Backend Fetch
  // ------------------

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/cart");
      // backend returns { success, data: cart }
      const serverItems = res?.data?.data?.items || [];

      const apiBase = getBaseURL();
      const origin = apiBase.replace(/\/api\/?$/, '');

      const normalizeUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('/products/')) return url;
        return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
      };

      const mapped: CartItem[] = serverItems.map((it: any) => ({
        productId: it.product?._id || it.product?.id || it.product,
        quantity: it.quantity || 0,
        size: it.size || '',
        color: it.color || '',
        price: it.price || it.product?.price || 0,
        name: it.product?.name || it.product?.title || '',
        image: normalizeUrl(it.product?.image || (it.product?.images && it.product.images[0]) || '')
      }));

      setItems(mapped);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------
  // Add Item
  // ------------------

  const addItem = async (item: any, size?: string, color?: string, quantity?: number) => {
    // Accept several signatures for backward compatibility:
    // - addItem(cartItem)
    // - addItem(product, size, color, quantity?)
    // - addItem(productId, size, color, quantity?)

    let payload: CartItem;

    if (item && typeof item === 'object' && 'productId' in item) {
      payload = item;
    } else if (item && typeof item === 'object' && 'id' in item) {
      // product object
      payload = {
        productId: item.id,
        quantity: quantity || 1,
        size: size || item.size || '',
        color: color || item.color || item.colors?.[0] || '',
        price: item.price,
        name: item.name,
        image: item.image || (item.images && item.images[0])
      };
    } else if (typeof item === 'string') {
      payload = {
        productId: item,
        quantity: quantity || 1,
        size: size || '',
        color: color || ''
      };
    } else {
      // fallback: try to coerce
      payload = { productId: item?.productId || '', quantity: item?.quantity || 1, size: item?.size || '', color: item?.color || '' };
    }

    if (!payload.productId) return;

    if (!auth) {
      setItems(prev => {
        const updated = [...prev, payload];
        saveGuestCart(updated);
        return updated;
      });
      setIsOpen(true);
      return;
    }

    await api.post("/cart/add", {
      productId: payload.productId,
      quantity: payload.quantity,
      size: payload.size,
      color: payload.color
    });
    await fetchCart();
    setIsOpen(true);
  };

  // ------------------
  // Remove Item
  // ------------------

  const removeItem = async (productId: string, size: string, color: string) => {

    if (!auth) {
      setItems(prev => {
        const updated = prev.filter(
          i =>
            !(
              i.productId === productId &&
              i.size === size &&
              i.color === color
            )
        );
        saveGuestCart(updated);
        return updated;
      });
      return;
    }

    await api.delete(`/cart/remove/${productId}`, {
      data: { size, color }
    });

    await fetchCart();
  };

  // ------------------
  // Update Quantity
  // ------------------

  const updateQuantity = async (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => {

    if (!auth) {
      setItems(prev => {
        const updated = prev.map(item =>
          item.productId === productId &&
            item.size === size &&
            item.color === color
            ? { ...item, quantity }
            : item
        );
        saveGuestCart(updated);
        return updated;
      });
      return;
    }

    await api.put("/cart/update", {
      productId,
      size,
      color,
      quantity
    });

    await fetchCart();
  };

  // ------------------
  // Clear Cart
  // ------------------

  const clearCart = async () => {

    if (!auth) {
      localStorage.removeItem("guest_cart");
      setItems([]);
      return;
    }

    await api.delete("/cart/clear");
    setItems([]);
  };

  // ------------------
  // UI Controls
  // ------------------

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen(p => !p);

  // ------------------
  // Derived Values
  // ------------------

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const total = items.reduce(
    (s, i) => s + (i.price || 0) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        itemCount,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ------------------
// Hook
// ------------------

export const useCart = () => {

  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return ctx;
};
