import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, MapPin, ShoppingBag, CreditCard } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { ShippingAddress } from '@/types/Order';

const Checkout = () => {
  const { user } = useAuth();
  const { processCheckout, isCheckingOut } = useOrders(); // ✅ Use global function
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  useEffect(() => {
    if (user?.address && useProfileAddress) {
      setShippingAddress({
        street: user.address.street || '',
        city: user.address.city || '',
        state: user.address.state || '',
        pincode: user.address.pincode || '',
        country: user.address.country || 'India'
      });
    }
  }, [user, useProfileAddress]);

  const handleUseProfileAddress = (checked: boolean) => {
    setUseProfileAddress(checked);

    if (checked && user?.address) {
      setShippingAddress({
        street: user.address.street || '',
        city: user.address.city || '',
        state: user.address.state || '',
        pincode: user.address.pincode || '',
        country: user.address.country || 'India'
      });
    }
  };

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));

    if (useProfileAddress) {
      setUseProfileAddress(false);
    }
  };

  // ✅ SIMPLE CHECKOUT HANDLER
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!shippingAddress.street || !shippingAddress.city ||
        !shippingAddress.state || !shippingAddress.pincode) {
      toast({
        title: 'Incomplete address',
        description: 'Please fill all address fields to continue.',
        variant: 'destructive',
      });
      return;
    }

    if (shippingAddress.pincode.length !== 6) {
      toast({
        title: 'Invalid pincode',
        description: 'Pincode must be 6 digits.',
        variant: 'destructive',
      });
      return;
    }

    // ✅ Call global checkout function
    await processCheckout(
      shippingAddress,
      // On Success
      async () => {
        toast({
          title: 'Order placed successfully!',
          description: 'Your payment has been confirmed.',
        });
        await clearCart();
        navigate('/profile'); // Or navigate to order details
      },
      // On Error
      (error) => {
        toast({
          title: 'Checkout failed',
          description: error,
          variant: 'destructive',
        });
      }
    );
  };

  // Early returns...
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-2xl font-semibold mb-4">Please sign in</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to checkout.
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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Add some items to your cart before checking out.
            </p>
            <Link to="/products">
              <Button>Browse Products</Button>
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
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Cart
            </Link>

            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Shipping Address</h2>
                  </div>

                  {user.address && (user.address.street || user.address.city) && (
                    <div className="mb-6 p-4 bg-secondary/50 rounded-xl">
                      <div className="flex items-center space-x-2 mb-3">
                        <Checkbox
                          id="useProfileAddress"
                          checked={useProfileAddress}
                          onCheckedChange={handleUseProfileAddress}
                        />
                        <Label
                          htmlFor="useProfileAddress"
                          className="text-sm font-medium cursor-pointer"
                        >
                          Use my saved address
                        </Label>
                      </div>

                      {useProfileAddress && (
                        <div className="text-sm text-muted-foreground pl-6">
                          <p>{user.address.street}</p>
                          <p>{user.address.city}, {user.address.state}</p>
                          <p>{user.address.pincode}, {user.address.country || 'India'}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div>
                      <Label htmlFor="street">Street Address *</Label>
                      <Input
                        id="street"
                        placeholder="123 Main Street, Apt 4B"
                        value={shippingAddress.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="Mumbai"
                          value={shippingAddress.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          placeholder="Maharashtra"
                          value={shippingAddress.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          placeholder="400001"
                          value={shippingAddress.pincode}
                          onChange={(e) => handleInputChange('pincode', e.target.value)}
                          required
                          maxLength={6}
                        />
                      </div>

                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={shippingAddress.country}
                          disabled
                          className="bg-muted cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground italic mt-2">
                      * Changes made here are for this order only and will not update your profile settings.
                    </p>

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg mt-6"
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Proceed to Payment
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Order Summary - Same as before */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl p-6 border border-border sticky top-24">
                  <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={`${item.productId}-${item.size}-${item.color}`}
                        className="flex gap-3"
                      >
                        <div className="w-16 h-20 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name || ''}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold mt-1">
                            ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-6 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Subtotal ({items.length} items)
                      </span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-green-500 font-medium">FREE</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (GST 18%)</span>
                      <span>₹{(total * 0.18).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center text-lg font-bold pt-3 border-t">
                      <span>Total</span>
                      <span>₹{(total * 1.18).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-500/10 rounded-lg">
                    <p className="text-xs text-muted-foreground text-center">
                      🔒 Secure payment powered by Razorpay
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
