import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import SecureImage from '@/components/SecureImage';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

const Orders = () => {
  const { user } = useAuth();
  const { orders, isLoading } = useOrders();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-2xl font-semibold mb-4">Please sign in</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to view your orders.
            </p>
            <Link to="/login">
              <Button>Sign In</Button>
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
      <CartDrawer />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Link>

            <h1 className="text-3xl font-semibold text-foreground mb-8">My Orders</h1>

            {isLoading ? (
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-card rounded-2xl p-12 border border-border text-center">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                <p className="text-muted-foreground mb-6">
                  Start shopping to see your orders here.
                </p>
                <Link to="/products">
                  <Button>Browse Products</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      <span className={`self-start px-4 py-2 text-sm font-medium rounded-full ${
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                        order.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' :
                        order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-500' :
                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    <div className="mb-4 p-4 bg-secondary/50 rounded-xl">
                      <p className="text-sm font-medium mb-1">Shipping Address:</p>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingAddress.street}, {order.shippingAddress.city}<br />
                        {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
                        {order.shippingAddress.country}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
                        >
                          {/* ✅ Secure Image Component */}
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-20 rounded-lg object-cover"
                          />

                          <div className="flex-1 min-w-0">
                            <Link 
                              to={`/product/${item.product}`}
                              className="font-medium truncate hover:underline block"
                            >
                              {item.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {item.quantity}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ₹{item.price.toLocaleString('en-IN')} each
                            </p>
                          </div>

                          <p className="font-semibold whitespace-nowrap">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-border">
                      <div className="text-left">
                        <p className="text-sm text-muted-foreground">Payment Status</p>
                        <p className={`text-sm font-medium ${
                          order.paymentStatus === 'paid' ? 'text-green-500' :
                          order.paymentStatus === 'failed' ? 'text-red-500' :
                          'text-yellow-500'
                        }`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm text-muted-foreground block mb-1">Order Total</span>
                        <span className="text-2xl font-bold">
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="outline" className="w-full">
                          View Order Details
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
