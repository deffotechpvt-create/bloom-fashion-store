import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";
import { useApi } from "../lib/api";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

// ------------------
// Types
// ------------------

interface WishlistContextType {
  wishlist: string[]; // Array of product IDs only
  count: number;
  isLoading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  fetchWishlist: () => Promise<void>;
  clearWishlist: () => Promise<void>;
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
  const { auth, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ------------------
  // Load wishlist on auth change
  // ------------------

  useEffect(() => {
    if (authLoading || isAdmin) {
      if (isAdmin) {
        setWishlist([]);
        setCount(0);
      }
      return;
    }

    if (auth) {
      fetchWishlist();
    } else {
      loadGuestWishlist();
    }
  }, [auth, authLoading, isAdmin]);

  // ------------------
  // Guest Helpers
  // ------------------

  const loadGuestWishlist = () => {
    const local = localStorage.getItem(WISHLIST_KEY);
    const parsed = local ? JSON.parse(local) : [];
    setWishlist(parsed);
    setCount(parsed.length);
  };

  const saveGuestWishlist = (items: string[]) => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  };

  // ------------------
  // Backend Fetch (IDs only)
  // ------------------

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/wishlist");
      // ✅ Get product IDs from response
      const productIds = res.data.productIds || res.data.data || [];

      setWishlist(productIds);
      setCount(productIds.length);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      setWishlist([]);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------
  // Add Wishlist
  // ------------------

  const addToWishlist = async (productId: string) => {
    if (isAdmin) {
      toast({
        title: "Admin restriction",
        description: "Admins cannot shop. Redirecting to dashboard...",
        variant: "destructive",
      });
      navigate("/admin");
      return;
    }
    // Guest user
    if (!auth) {
      setWishlist(prev => {
        if (prev.includes(productId)) return prev;

        const updated = [...prev, productId];
        saveGuestWishlist(updated);
        setCount(updated.length);
        return updated;
      });

      return;
    }

    // Authenticated user - Optimistic update
    try {
      // ✅ Update UI immediately
      setWishlist(prev => {
        if (prev.includes(productId)) return prev;
        const updated = [...prev, productId];
        setCount(updated.length);
        return updated;
      });

      // Then sync with backend
      await api.post("/wishlist/add", { productId });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      // ✅ Revert on error
      await fetchWishlist();
      throw error;
    }
  };

  // ------------------
  // Remove Wishlist
  // ------------------

  const removeFromWishlist = async (productId: string) => {
    // Guest user
    if (!auth) {
      setWishlist(prev => {
        const updated = prev.filter(id => id !== productId);
        saveGuestWishlist(updated);
        setCount(updated.length);
        return updated;
      });

      return;
    }

    // Authenticated user - Optimistic update
    try {
      // ✅ Update UI immediately
      setWishlist(prev => {
        const updated = prev.filter(id => id !== productId);
        setCount(updated.length);
        return updated;
      });

      // Then sync with backend
      await api.del(`/wishlist/remove/${productId}`);
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      // ✅ Revert on error
      await fetchWishlist();
      throw error;
    }
  };

  const clearWishlist = async () => {
    // Guest user
    if (!auth) {
      localStorage.removeItem(WISHLIST_KEY);
      setWishlist([]);
      setCount(0);
      return;
    }

    // Authenticated user
    try {
      setIsLoading(true);
      await api.del("/wishlist/clear");
      setWishlist([]);
      setCount(0);
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
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
        count,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        toggleWishlist,
        isInWishlist,
        fetchWishlist
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
