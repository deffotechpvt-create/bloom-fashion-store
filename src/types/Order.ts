// types/Order.ts

export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderItem {
  product: string; // Product ID
  name: string;
  quantity: number;
  price: number;
  image?: string; // ✅ Image from populated product
}

// Backend Order structure
export interface Order {
  _id: string;
  user: string;
  products: OrderItem[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  createdAt: string;
  updatedAt: string;
}

// Frontend-friendly Order
export interface FrontendOrder extends Order {
  id: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
}

export interface CheckoutPayload {
  shippingAddress: ShippingAddress;
}

// ✅ Razorpay Types
export interface PaymentOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  };
}

export interface VerifyPaymentPayload {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
