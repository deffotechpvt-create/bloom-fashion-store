import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";
import { useApi } from "../lib/api";
import { useAuth } from "./AuthContext";

// ------------------
// Types
// ------------------

interface WishlistContextType {
  wishlist: string[];
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

// ------------------
// Context
// ------------------

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_KEY = "atelier_wishlist";

// ------------------
// Provider
// ------------------

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {

  const api = useApi();
  const { auth, isLoading: authLoading } = useAuth();

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ------------------
  // Load wishlist on auth change
  // ------------------

  useEffect(() => {

    if (authLoading) return;

    if (auth) {
      fetchWishlist();
    } else {
      loadGuestWishlist();
    }

  }, [auth, authLoading]);

  // ------------------
  // Guest Helpers
  // ------------------

  const loadGuestWishlist = () => {
    const local = localStorage.getItem(WISHLIST_KEY);
    setWishlist(local ? JSON.parse(local) : []);
  };

  const saveGuestWishlist = (items: string[]) => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  };

  // ------------------
  // Backend Fetch
  // ------------------

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/wishlist");
      setWishlist(res.data.items || []);
    } catch {
      setWishlist([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------
  // Add Wishlist
  // ------------------

  const addToWishlist = async (productId: string) => {

    if (!auth) {

      setWishlist(prev => {
        if (prev.includes(productId)) return prev;

        const updated = [...prev, productId];
        saveGuestWishlist(updated);
        return updated;
      });

      return;
    }

    await api.post("/wishlist/add", { productId });
    await fetchWishlist();
  };

  // ------------------
  // Remove Wishlist
  // ------------------

  const removeFromWishlist = async (productId: string) => {

    if (!auth) {

      setWishlist(prev => {
        const updated = prev.filter(id => id !== productId);
        saveGuestWishlist(updated);
        return updated;
      });

      return;
    }

    await api.delete(`/wishlist/remove/${productId}`);
    await fetchWishlist();
  };

  // ------------------
  // Toggle Wishlist
  // ------------------

  const toggleWishlist = async (productId: string) => {

    if (wishlist.includes(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  // ------------------
  // Check Exists
  // ------------------

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// ------------------
// Hook
// ------------------

export const useWishlist = () => {

  const ctx = useContext(WishlistContext);

  if (!ctx) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return ctx;
};
