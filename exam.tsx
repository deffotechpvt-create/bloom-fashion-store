import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";
import { useApi, getBaseURL } from "../lib/api";
import { useAuth } from "./AuthContext";
import type { Order, FrontendOrder, ShippingAddress } from "@/types/Order";

// ------------------
// Types
// ------------------

interface OrderContextType {
  orders: FrontendOrder[];
  isLoading: boolean;
  isCheckingOut: boolean;
  fetchOrders: () => Promise<void>;
  checkout: (shippingAddress: ShippingAddress) => Promise<FrontendOrder | null>;
  getOrderById: (orderId: string) => FrontendOrder | undefined;
  refreshOrders: () => Promise<void>;
}

// ------------------
// Context
// ------------------

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// ------------------
// Helper: Normalize Image URL
// ------------------

const normalizeImageUrl = (url: string | undefined | null): string | null => {
  if (!url) return null;
  
  try {
    const apiBase = getBaseURL();
    const origin = apiBase.replace(/\/api\/?$/, '');
    
    // Already a full URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Relative URL - make it absolute
    if (url.startsWith('/')) {
      return `${origin}${url}`;
    }
    
    // No protocol, add origin
    return `${origin}/${url}`;
  } catch (error) {
    console.error('Error normalizing image URL:', error);
    return null;
  }
};

// ------------------
// Helper: Transform backend Order to FrontendOrder
// ------------------

const transformOrder = (order: Order): FrontendOrder => {
  console.log('Transforming order:', order);
  console.log('Order products:', order.products);
  
  return {
    ...order,
    id: order._id,
    status: order.orderStatus,
    total: order.totalAmount,
    // ✅ Extract product data from populated product object
    items: order.products.map(item => {
      // Check if product is populated (object) or just an ID (string)
      const isPopulated = typeof item.product === 'object' && item.product !== null;
      
      const productId = isPopulated
        ? (item.product as any)._id || (item.product as any).id
        : item.product;
      
      const productName = isPopulated
        ? (item.product as any).name
        : item.name;
      
      // ✅ Get image with fallback chain
      let productImage: string | null = null;
      if (isPopulated) {
        const prod = item.product as any;
        productImage = normalizeImageUrl(prod.image || prod.images?.[0]);
      }
      
      console.log('Transformed item:', {
        originalProduct: item.product,
        extractedId: productId,
        name: productName,
        image: productImage
      });
      
      return {
        product: productId,
        name: productName || item.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
        image: productImage || undefined // ✅ Undefined if no image (not empty string)
      };
    })
  };
};

// ------------------
// Provider
// ------------------

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const api = useApi();
  const { auth, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<FrontendOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (auth) {
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [auth, authLoading]);

  const fetchOrders = async () => {
    if (!auth) {
      setOrders([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.get("/orders/my-orders");
      
      console.log("Fetched orders:", res.data);

      const ordersList: Order[] = res.data.data || [];
      const mappedOrders = ordersList.map(transformOrder);

      setOrders(mappedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkout = async (shippingAddress: ShippingAddress): Promise<FrontendOrder | null> => {
    if (!auth) {
      throw new Error("Please login to checkout");
    }

    try {
      setIsCheckingOut(true);
      
      const res = await api.post("/orders/checkout", {
        shippingAddress
      });

      console.log("Checkout response:", res.data);

      if (res.data.success && res.data.data) {
        const backendOrder: Order = res.data.data;
        const newOrder = transformOrder(backendOrder);

        setOrders(prev => [newOrder, ...prev]);

        return newOrder;
      }

      return null;
    } catch (error: any) {
      console.error("Checkout error:", error);
      throw error;
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getOrderById = (orderId: string): FrontendOrder | undefined => {
    return orders.find(order => order.id === orderId || order._id === orderId);
  };

  const refreshOrders = async () => {
    await fetchOrders();
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        isCheckingOut,
        fetchOrders,
        checkout,
        getOrderById,
        refreshOrders
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

// ------------------
// Hook
// ------------------

export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrders must be used inside OrderProvider");
  }

  return context;
};
