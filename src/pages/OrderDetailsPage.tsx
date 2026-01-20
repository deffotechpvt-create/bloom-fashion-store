import { useParams, Link } from "react-router-dom";
import { useOrders } from "@/context/OrderContext";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const { getOrderById, isLoading, processPayment } = useOrders(); // ✅ Use global function
  const { user } = useAuth();
  const { clearCart } = useCart();
  const { toast } = useToast();

  const order = orderId ? getOrderById(orderId) : undefined;

  // ✅ SIMPLE PAY NOW HANDLER
  const handlePayNow = async () => {
    if (!order) return;

    await processPayment(
      order.id,
      // On Success
      async () => {
        toast({
          title: 'Payment successful!',
          description: 'Your order has been confirmed.',
        });
        await clearCart();
      },
      // On Error
      (error) => {
        toast({
          title: 'Payment failed',
          description: error,
          variant: 'destructive',
        });
      }
    );
  };

  // Loading and error states...
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Order not found</h1>
            <p className="text-muted-foreground mb-6">
              This order doesn't exist or you don't have permission to view it.
            </p>
            <Link to="/profile">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/profile">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>

          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            {/* Order Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold">Order #{order.id.slice(-8)}</h1>
                <p className="text-muted-foreground">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                  order.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' :
                  order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-500' :
                  order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>

                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  order.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-500' :
                  order.paymentStatus === 'failed' ? 'bg-red-500/20 text-red-500' :
                  'bg-yellow-500/20 text-yellow-500'
                }`}>
                  Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Shipping Address */}
              <div>
                <h2 className="font-semibold mb-3">Shipping Address</h2>
                <div className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-xl">
                  <p className="font-medium text-foreground mb-1">{user?.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p>{order.shippingAddress.pincode}, {order.shippingAddress.country}</p>
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h2 className="font-semibold mb-3">Order Summary</h2>
                <div className="bg-secondary/50 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{(order.total / 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span>₹{(order.total - (order.total / 1.18)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>₹{order.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* ✅ Pay Now Button */}
                {order.paymentStatus !== 'paid' && order.status !== 'cancelled' && (
                  <Button
                    onClick={handlePayNow}
                    className="w-full mt-4"
                    size="lg"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay Now
                  </Button>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h2 className="font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-4 bg-secondary/30 border border-border rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="text-muted-foreground">📦</div>';
                              }
                            }}
                          />
                        ) : (
                          <Package className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>

                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.price.toLocaleString('en-IN')} each
                        </p>
                      </div>
                    </div>

                    <p className="font-semibold whitespace-nowrap">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderDetailsPage;
