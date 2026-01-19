import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Minus, Plus, Heart, Share2, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { Product } from '@/types/Product';
import { useProducts } from '@/context/ProductsContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import MobileBottomBar from '@/components/MobileBottomBar';
import ProductImageGallery from '@/components/ProductImageGallery';
import SizeGuideModal from '@/components/SizeGuideModal';
import ShopTheLook from '@/components/ShopTheLook';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const { getProductById } = useProducts();
  const [productState, setProductState] = useState<Product | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const p = await getProductById(id);
      setProductState(p);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const product = productState;

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(product?.colors?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Product Not Found</h1>
          <Link to="/" className="text-primary hover:underline">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    addItem(product, selectedSize, selectedColor, quantity);
  };

  const canAddToCart = product.inStock && selectedSize && selectedColor;

  const colorMap: Record<string, string> = {
    'Beige': 'bg-[#C4B7A6]',
    'Charcoal': 'bg-[#36454F]',
    'Ivory': 'bg-[#FFFFF0]',
    'Cream': 'bg-[#FFFDD0]',
    'Navy': 'bg-[#1B2838]',
    'Black': 'bg-[#1A1A1A]',
    'Sand': 'bg-[#C2B280]',
    'Olive': 'bg-[#556B2F]',
    'White': 'bg-white',
    'Stone': 'bg-[#928E85]',
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Image Gallery */}
            <ProductImageGallery product={product} selectedColor={selectedColor} />

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:py-8 space-y-8"
            >
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    {product.isNew && (
                      <span className="inline-block px-3 py-1 text-xs font-medium tracking-wider uppercase bg-primary text-primary-foreground rounded-full">
                        New Arrival
                      </span>
                    )}
                    <h1 className="text-3xl lg:text-4xl font-semibold text-foreground">
                      {product.name}
                    </h1>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">
                      {product.category}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className="p-3 rounded-full bg-secondary hover:bg-accent transition-colors"
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${isWishlisted ? 'fill-primary text-primary' : 'text-foreground'}`}
                      />
                    </button>
                    <button
                      className="p-3 rounded-full bg-secondary hover:bg-accent transition-colors"
                      aria-label="Share"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  ${product.price}
                </p>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              {/* Color Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Color: <span className="text-muted-foreground">{selectedColor || 'Select a color'}</span>
                  </span>
                </div>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${colorMap[color] || 'bg-secondary'
                        } ${selectedColor === color
                          ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'border-border hover:border-muted-foreground'
                        }`}
                      aria-label={color}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Size: <span className="text-muted-foreground">{selectedSize || 'Select a size'}</span>
                  </span>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-3 text-sm font-medium rounded-xl border transition-all ${selectedSize === size
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-secondary text-foreground border-border hover:border-muted-foreground'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-4">
                <span className="text-sm font-medium text-foreground">Quantity</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-secondary transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-secondary transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="space-y-4 pt-4">
                {product.inStock ? (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleAddToCart}
                    disabled={!canAddToCart}
                    className={`w-full py-4 px-8 text-lg font-semibold rounded-2xl transition-all ${canAddToCart
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-secondary text-muted-foreground cursor-not-allowed'
                      }`}
                  >
                    {canAddToCart ? 'Add to Bag' : 'Select Size & Color'}
                  </motion.button>
                ) : (
                  <button className="w-full py-4 px-8 text-lg font-semibold rounded-2xl bg-secondary text-muted-foreground">
                    Out of Stock - Notify Me
                  </button>
                )}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Truck className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <RotateCcw className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">30-Day Returns</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">2-Year Warranty</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Shop the Look */}
          <ShopTheLook currentProduct={product} />
        </div>
      </main>

      <Footer />
      <MobileBottomBar />

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        category={product.category}
      />
    </div>
  );
};

export default ProductDetail;
