import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, LogOut, Package, Heart, Settings, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { products } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';

const Profile = () => {
  const { user, logout, updateProfile, orders } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-2xl font-semibold mb-4">Please sign in</h1>
            <p className="text-muted-foreground mb-6">You need to be logged in to view your profile.</p>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/');
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name });
    toast({
      title: 'Profile updated',
      description: 'Your profile has been successfully updated.',
    });
  };

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

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
              {user.isAdmin && (
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
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                      >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
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
                  {activeTab === 'profile' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                      <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="pl-10"
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
                              className="pl-10 bg-secondary"
                            />
                          </div>
                        </div>
                        <Button type="submit">Save Changes</Button>
                      </form>
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6">Order History</h2>
                      {orders.length === 0 ? (
                        <div className="text-center py-12">
                          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No orders yet</p>
                          <Link to="/products" className="mt-4 inline-block">
                            <Button variant="outline">Start Shopping</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.map((order) => (
                            <div key={order.id} className="p-4 bg-secondary rounded-xl">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-medium">Order #{order.id.slice(-8)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                                  order.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' :
                                  order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-500' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {order.items.length} item(s) · ${order.total.toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'wishlist' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6">My Wishlist</h2>
                      {wishlistProducts.length === 0 ? (
                        <div className="text-center py-12">
                          <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Your wishlist is empty</p>
                          <Link to="/products" className="mt-4 inline-block">
                            <Button variant="outline">Browse Products</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {wishlistProducts.map((product) => (
                            <Link key={product.id} to={`/product/${product.id}`}>
                              <div className="flex gap-4 p-4 bg-secondary rounded-xl hover:bg-accent transition-colors">
                                <div className="w-16 h-20 bg-muted rounded-lg" />
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  <p className="text-sm text-muted-foreground">{product.category}</p>
                                  <p className="font-semibold mt-1">${product.price}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

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
