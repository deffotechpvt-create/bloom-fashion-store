import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react";
import { useApi, getBaseURL } from "../lib/api";
import { useAuth } from "./AuthContext";
import type { 
  Order, 
  FrontendOrder, 
  ShippingAddress 
} from "@/types/Order";

// ------------------
// Types
// ------------------

interface OrderContextType {
  orders: FrontendOrder[];
  isLoading: boolean;
  isCheckingOut: boolean;
  fetchOrders: () => Promise<void>;
  // ✅ SINGLE GLOBAL CHECKOUT FUNCTION
  processCheckout: (shippingAddress: ShippingAddress, onSuccess?: () => void, onError?: (error: string) => void) => Promise<void>;
  // ✅ SINGLE GLOBAL PAY NOW FUNCTION (for existing orders)
  processPayment: (orderId: string, onSuccess?: () => void, onError?: (error: string) => void) => Promise<void>;
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
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    if (url.startsWith('/')) {
      return `${origin}${url}`;
    }
    
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
  return {
    ...order,
    id: order._id,
    status: order.orderStatus,
    total: order.totalAmount,
    items: order.products.map(item => {
      const isPopulated = typeof item.product === 'object' && item.product !== null;
      
      const productId = isPopulated
        ? (item.product as any)._id || (item.product as any).id
        : item.product;
      
      const productName = isPopulated
        ? (item.product as any).name
        : item.name;
      
      let productImage: string | null = null;
      if (isPopulated) {
        const prod = item.product as any;
        productImage = normalizeImageUrl(prod.image || prod.images?.[0]);
      }
      
      return {
        product: productId,
        name: productName || item.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
        image: productImage || undefined
      };
    })
  };
};

// ------------------
// Helper: Load Razorpay SDK
// ------------------

const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// ------------------
// Provider
// ------------------

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const api = useApi();
  const { auth, user, isLoading: authLoading } = useAuth();

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

  // ------------------
  // Fetch Orders
  // ------------------

  const fetchOrders = async () => {
    if (!auth) {
      setOrders([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.get("/orders/my-orders");
      
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

  // ------------------
  // ✅ GLOBAL CHECKOUT FUNCTION
  // ------------------

  const processCheckout = async (
    shippingAddress: ShippingAddress,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ): Promise<void> => {
    if (!auth) {
      const errorMsg = "Please login to checkout";
      onError?.(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      setIsCheckingOut(true);

      // Load Razorpay SDK
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        const errorMsg = "Razorpay SDK failed to load. Please check your internet connection.";
        onError?.(errorMsg);
        throw new Error(errorMsg);
      }

      // Step 1: Create Order
      const orderRes = await api.post("/orders/checkout", { shippingAddress });
      
      if (!orderRes.data.success || !orderRes.data.data) {
        const errorMsg = "Failed to create order";
        onError?.(errorMsg);
        throw new Error(errorMsg);
      }

      const backendOrder: Order = orderRes.data.data;
      const newOrder = transformOrder(backendOrder);
      
      // Add to orders list
      setOrders(prev => [newOrder, ...prev]);

      // Step 2: Create Razorpay Payment Order
      const paymentRes = await api.post('/payment/create-order', { 
        orderId: newOrder.id 
      });

      if (!paymentRes.data.success || !paymentRes.data.data) {
        const errorMsg = "Failed to create payment order";
        onError?.(errorMsg);
        throw new Error(errorMsg);
      }

      const paymentData = paymentRes.data.data;

      // Step 3: Open Razorpay Checkout
      const options = {
        key: paymentData.keyId || paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        name: 'Your Store Name',
        description: 'Order Payment',
        order_id: paymentData.razorpayOrderId || paymentData.orderId,
        handler: async function (response: any) {
          try {
            // Step 4: Verify Payment
            const verifyRes = await api.post("/payment/verify-payment", {
              orderId: newOrder.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              // Refresh orders
              await fetchOrders();
              onSuccess?.();
            } else {
              const errorMsg = "Payment verification failed. Please contact support if amount was deducted.";
              onError?.(errorMsg);
            }
          } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Payment verification failed";
            onError?.(errorMsg);
          }
        },
        modal: {
          ondismiss: function() {
            onError?.("Payment cancelled. You can complete payment later from your orders.");
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#000000',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error("Checkout error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Checkout failed";
      onError?.(errorMsg);
      throw error;
    } finally {
      setIsCheckingOut(false);
    }
  };

  // ------------------
  // ✅ GLOBAL PAY NOW FUNCTION (for existing orders)
  // ------------------

  const processPayment = async (
    orderId: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ): Promise<void> => {
    if (!auth) {
      const errorMsg = "Please login to make payment";
      onError?.(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      // Load Razorpay SDK
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        const errorMsg = "Razorpay SDK failed to load. Please check your internet connection.";
        onError?.(errorMsg);
        throw new Error(errorMsg);
      }

      // Step 1: Create Razorpay Payment Order
      const paymentRes = await api.post('/payment/create-order', { orderId });

      if (!paymentRes.data.success || !paymentRes.data.data) {
        const errorMsg = "Failed to create payment order";
        onError?.(errorMsg);
        throw new Error(errorMsg);
      }

      const paymentData = paymentRes.data.data;

      // Step 2: Open Razorpay Checkout
      const options = {
        key: paymentData.keyId || paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        name: 'Your Store Name',
        description: 'Order Payment',
        order_id: paymentData.razorpayOrderId || paymentData.orderId,
        handler: async function (response: any) {
          try {
            // Step 3: Verify Payment
            const verifyRes = await api.post("/payment/verify-payment", {
              orderId: orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              // Refresh orders
              await fetchOrders();
              onSuccess?.();
            } else {
              const errorMsg = "Payment verification failed. Please contact support if amount was deducted.";
              onError?.(errorMsg);
            }
          } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Payment verification failed";
            onError?.(errorMsg);
          }
        },
        modal: {
          ondismiss: function() {
            onError?.("Payment cancelled. You can try again anytime.");
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#000000',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error("Payment error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Payment failed";
      onError?.(errorMsg);
      throw error;
    }
  };

  // ------------------
  // Get Order by ID
  // ------------------

  const getOrderById = (orderId: string): FrontendOrder | undefined => {
    return orders.find(order => order.id === orderId || order._id === orderId);
  };

  // ------------------
  // Refresh Orders
  // ------------------

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
        processCheckout,
        processPayment,
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
