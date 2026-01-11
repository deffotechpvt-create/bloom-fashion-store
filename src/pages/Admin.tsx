import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Package, Users, ShoppingCart, DollarSign, 
  Plus, Edit, Trash2, ArrowLeft, Eye, EyeOff,
  TrendingUp, AlertCircle
} from 'lucide-react';
import { useAuth, Order } from '@/context/AuthContext';
import { products as initialProducts, Product } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ADMIN_PRODUCTS_KEY = 'atelier_admin_products';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Essentials',
    description: '',
    sizes: 'XS, S, M, L, XL',
    colors: '',
    inStock: true,
    isNew: false,
  });

  useEffect(() => {
    // Load products from localStorage or use initial
    const stored = localStorage.getItem(ADMIN_PRODUCTS_KEY);
    if (stored) {
      setProductsList(JSON.parse(stored));
    } else {
      setProductsList(initialProducts);
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(initialProducts));
    }

    // Load all orders
    const ordersStored = localStorage.getItem('atelier_orders');
    if (ordersStored) {
      setAllOrders(JSON.parse(ordersStored));
    }
  }, []);

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
            <Link to="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const saveProducts = (updated: Product[]) => {
    setProductsList(updated);
    localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(updated));
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: Product = {
      id: editingProduct?.id || `prod_${Date.now()}`,
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      image: editingProduct?.image || '/products/tshirt-1.jpg',
      description: formData.description,
      sizes: formData.sizes.split(',').map((s) => s.trim()),
      colors: formData.colors.split(',').map((c) => c.trim()),
      inStock: formData.inStock,
      isNew: formData.isNew,
    };

    if (editingProduct) {
      const updated = productsList.map((p) => (p.id === editingProduct.id ? productData : p));
      saveProducts(updated);
      toast({ title: 'Product updated successfully' });
    } else {
      saveProducts([...productsList, productData]);
      toast({ title: 'Product created successfully' });
    }

    resetForm();
    setIsProductDialogOpen(false);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      inStock: product.inStock,
      isNew: product.isNew || false,
    });
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updated = productsList.filter((p) => p.id !== productId);
      saveProducts(updated);
      toast({ title: 'Product deleted' });
    }
  };

  const toggleProductStock = (productId: string) => {
    const updated = productsList.map((p) =>
      p.id === productId ? { ...p, inStock: !p.inStock } : p
    );
    saveProducts(updated);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      category: 'Essentials',
      description: '',
      sizes: 'XS, S, M, L, XL',
      colors: '',
      inStock: true,
      isNew: false,
    });
  };

  // Stats
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = allOrders.length;
  const totalProducts = productsList.length;
  const inStockProducts = productsList.filter((p) => p.inStock).length;

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-500' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingCart, color: 'text-blue-500' },
    { label: 'Products', value: totalProducts, icon: Package, color: 'text-purple-500' },
    { label: 'In Stock', value: inStockProducts, icon: TrendingUp, color: 'text-orange-500' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to="/profile" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Link>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Manage your store</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
                  {allOrders.length === 0 ? (
                    <p className="text-muted-foreground">No orders yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {allOrders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                          <div>
                            <p className="font-medium">Order #{order.id.slice(-8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.length} item(s)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${order.total.toFixed(2)}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                              order.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' :
                              'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'products' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Products ({productsList.length})</h2>
                    <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
                      setIsProductDialogOpen(open);
                      if (!open) resetForm();
                    }}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="w-4 h-4" />
                          Add Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmitProduct} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="price">Price ($)</Label>
                              <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="category">Category</Label>
                              <select
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                              >
                                <option value="Essentials">Essentials</option>
                                <option value="Outerwear">Outerwear</option>
                                <option value="Knitwear">Knitwear</option>
                                <option value="Tailoring">Tailoring</option>
                                <option value="Shirts">Shirts</option>
                                <option value="Seasonal">Seasonal</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                              <Input
                                id="sizes"
                                value={formData.sizes}
                                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="colors">Colors (comma-separated)</Label>
                              <Input
                                id="colors"
                                value={formData.colors}
                                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="flex gap-6">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.inStock}
                                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-sm">In Stock</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.isNew}
                                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-sm">Mark as New</span>
                            </label>
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">
                              {editingProduct ? 'Update Product' : 'Create Product'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                          <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productsList.map((product) => (
                          <tr key={product.id} className="border-b border-border last:border-0">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-12 bg-secondary rounded-lg flex-shrink-0" />
                                <div>
                                  <p className="font-medium">{product.name}</p>
                                  {product.isNew && (
                                    <span className="text-xs text-primary">New</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-muted-foreground">{product.category}</td>
                            <td className="py-4 px-4">${product.price}</td>
                            <td className="py-4 px-4">
                              <button
                                onClick={() => toggleProductStock(product.id)}
                                className={`flex items-center gap-1 text-sm ${
                                  product.inStock ? 'text-green-500' : 'text-red-500'
                                }`}
                              >
                                {product.inStock ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">All Orders ({allOrders.length})</h2>
                  {allOrders.length === 0 ? (
                    <p className="text-muted-foreground">No orders yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {allOrders.map((order) => (
                        <div key={order.id} className="p-4 bg-secondary rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium">Order #{order.id.slice(-8)}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${order.total.toFixed(2)}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                                order.status === 'shipped' ? 'bg-blue-500/20 text-blue-500' :
                                order.status === 'processing' ? 'bg-yellow-500/20 text-yellow-500' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.map((item) => item.productName).join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
