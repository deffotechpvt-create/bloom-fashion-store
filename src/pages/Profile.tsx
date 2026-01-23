import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, LogOut, Package, Heart, Settings, Shield, X,
  ShoppingCart, Trash2, MapPin, Phone, Save
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useProducts } from '@/context/ProductsContext';
import { useUser } from '@/context/UserContext';
import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

const Profile = () => {
  // ✅ ALL HOOKS AT TOP - NO CONDITIONS BEFORE HOOKS
  const { user, logout, isAdmin } = useAuth();
  const { wishlist, count, isLoading: wishlistLoading, removeFromWishlist, clearWishlist } = useWishlist();
  const { products } = useProducts();
  const { updateProfile, isUpdating } = useUser();
  const { addItem } = useCart();
  const { orders, isLoading: ordersLoading } = useOrders();
  const navigate = useNavigate();

  // ✅ Get tab from URL query parameter
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    }
  });

  // ✅ Update active tab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('profile');
    }
  }, [searchParams]);

  // ✅ Pre-fill form when user data loads
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          pincode: user.address?.pincode || '',
          country: user.address?.country || 'India'
        }
      });
    }
  }, [user]);

  // ✅ Filter wishlist products
  const wishlistProducts = products.filter((p) =>
    wishlist.includes(p.id) || wishlist.includes(p._id)
  );

  // ✅ Handle tab change and update URL
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // ✅ Handlers
  const handleMoveToCart = async (productId: string) => {
    try {
      const product = wishlistProducts.find(p => p.id === productId || p._id === productId);
      if (!product) return;

      await addItem(productId);
      await removeFromWishlist(productId);

      toast({
        title: 'Moved to Cart',
        description: `${product.name} has been moved to your cart.`,
      });
    } catch (error) {
      console.error('Error moving to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to move item to cart',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await updateProfile(profileData);
      toast({
        title: res.data.message || 'Profile updated successfully',
      });
    } catch (error: any) {
      toast({
        title: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // ✅ NOW SAFE TO HAVE EARLY RETURNS
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-2xl font-semibold mb-4">Please sign in</h1>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to view your profile.
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-foreground">My Account</h1>
                <p className="text-muted-foreground mt-1">Manage your profile and orders</p>
              </div>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" className="gap-2">
                    <Shield className="w-4 h-4" />
                    Admin Dashboard
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <nav className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === tab.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                      >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                        {/* ✅ Show count badges */}
                        {tab.id === 'wishlist' && count > 0 && (
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id
                              ? 'bg-primary-foreground/20 text-primary-foreground'
                              : 'bg-primary/20 text-primary'
                            }`}>
                            {count}
                          </span>
                        )}
                        {tab.id === 'orders' && orders.length > 0 && (
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id
                              ? 'bg-primary-foreground/20 text-primary-foreground'
                              : 'bg-primary/20 text-primary'
                            }`}>
                            {orders.length}
                          </span>
                        )}
                      </button>
                    ))}
                  </nav>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="lg:col-span-3">
                <div className="bg-card rounded-2xl p-8 border border-border">

                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

                      <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                        {/* Personal Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                id="name"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                id="email"
                                value={user.email}
                                disabled
                                className="pl-10 bg-muted cursor-not-allowed"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              id="phone"
                              type="tel"
                              value={profileData.phone}
                              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                              className="pl-10"
                              placeholder="+91 9876543210"
                            />
                          </div>
                        </div>

                        {/* Address Section */}
                        <div className="pt-6 border-t">
                          <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold">Shipping Address</h3>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="street">Street Address</Label>
                              <Input
                                id="street"
                                value={profileData.address.street}
                                onChange={(e) => setProfileData({
                                  ...profileData,
                                  address: { ...profileData.address, street: e.target.value }
                                })}
                                placeholder="123 Main Street, Apt 4B"
                              />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                  id="city"
                                  value={profileData.address.city}
                                  onChange={(e) => setProfileData({
                                    ...profileData,
                                    address: { ...profileData.address, city: e.target.value }
                                  })}
                                  placeholder="Mumbai"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input
                                  id="state"
                                  value={profileData.address.state}
                                  onChange={(e) => setProfileData({
                                    ...profileData,
                                    address: { ...profileData.address, state: e.target.value }
                                  })}
                                  placeholder="Maharashtra"
                                />
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="pincode">Pincode</Label>
                                <Input
                                  id="pincode"
                                  value={profileData.address.pincode}
                                  onChange={(e) => setProfileData({
                                    ...profileData,
                                    address: { ...profileData.address, pincode: e.target.value }
                                  })}
                                  placeholder="400001"
                                  maxLength={6}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                  id="country"
                                  value={profileData.address.country}
                                  disabled
                                  className="bg-muted cursor-not-allowed"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button type="submit" disabled={isUpdating} className="gap-2">
                          <Save className="w-4 h-4" />
                          {isUpdating ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Orders Tab */}
                  {activeTab === 'orders' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6">Order History</h2>

                      {ordersLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-muted-foreground mt-4">Loading orders...</p>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground mb-4">No orders yet</p>
                          <Link to="/products">
                            <Button variant="outline">Start Shopping</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.map((order) => (
                            <div key={order.id} className="p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-medium">Order #{order.id.slice(-8)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>

                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                                    order.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' :
                                      order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-500' :
                                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                                          'bg-muted text-muted-foreground'
                                  }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">
                                  {order.items.length} item(s)
                                </div>

                                <div className="flex justify-between items-center">
                                  <span className="font-semibold">
                                    ₹{order.total.toLocaleString('en-IN')}
                                  </span>

                                  <Link to={`/orders/${order.id}`}>
                                    <Button variant="outline" size="sm">
                                      View Details
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Wishlist Tab */}
                  {activeTab === 'wishlist' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">
                          My Wishlist
                          {count > 0 && (
                            <span className="ml-2 text-sm font-normal text-muted-foreground">
                              ({count} {count === 1 ? 'item' : 'items'})
                            </span>
                          )}
                        </h2>

                        {count > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearWishlist}
                            disabled={wishlistLoading}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear All
                          </Button>
                        )}
                      </div>

                      {wishlistLoading && (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-muted-foreground mt-4">Loading wishlist...</p>
                        </div>
                      )}

                      {!wishlistLoading && count === 0 && (
                        <div className="text-center py-12">
                          <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground mb-2">Your wishlist is empty</p>
                          <p className="text-sm text-muted-foreground mb-6">
                            Save items you love for later!
                          </p>
                          <Link to="/products">
                            <Button variant="outline">Browse Products</Button>
                          </Link>
                        </div>
                      )}

                      {!wishlistLoading && count > 0 && (
                        <div className="space-y-4">
                          {wishlistProducts.map((product) => (
                            <div
                              key={product.id || product._id}
                              className="group relative flex gap-4 p-4 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
                            >
                              <button
                                onClick={() => removeFromWishlist(product.id || product._id)}
                                disabled={wishlistLoading}
                                className="absolute top-2 right-2 p-1.5 bg-background rounded-full shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-all opacity-0 group-hover:opacity-100 z-10"
                                aria-label="Remove from wishlist"
                              >
                                <X className="w-4 h-4" />
                              </button>

                              <Link
                                to={`/product/${product.id || product._id}`}
                                className="flex-shrink-0"
                              >
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-20 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                />
                              </Link>

                              <div className="flex-1 flex flex-col min-w-0">
                                <Link to={`/product/${product.id || product._id}`}>
                                  <p className="font-medium hover:underline line-clamp-2">
                                    {product.name}
                                  </p>
                                </Link>

                                <p className="text-sm text-muted-foreground mt-1">
                                  {product.category}
                                </p>

                                <p className="font-semibold mt-2">
                                  ₹{product.price.toLocaleString('en-IN')}
                                </p>

                                {product.stock !== undefined && (
                                  <p className={`text-xs mt-1 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                  </p>
                                )}

                                <Button
                                  size="sm"
                                  variant="default"
                                  className="mt-auto w-fit"
                                  onClick={() => handleMoveToCart(product.id || product._id)}
                                  disabled={wishlistLoading || (product.stock !== undefined && product.stock === 0)}
                                >
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Move to Cart
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Settings Tab */}
                  {activeTab === 'settings' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                      <p className="text-muted-foreground">Additional settings coming soon.</p>
                    </div>
                  )}
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

export default Profile;
