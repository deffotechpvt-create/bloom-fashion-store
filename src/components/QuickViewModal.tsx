import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Ruler } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import SizeGuideModal from './SizeGuideModal';

// Product images mapping
import coat1 from '@/assets/products/coat-1.jpg';
import sweater1 from '@/assets/products/sweater-1.jpg';
import pants1 from '@/assets/products/pants-1.jpg';
import tshirt1 from '@/assets/products/tshirt-1.jpg';
import blazer1 from '@/assets/products/blazer-1.jpg';
import shirt1 from '@/assets/products/shirt-1.jpg';

const imageMap: Record<string, string> = {
  '/products/coat-1.jpg': coat1,
  '/products/sweater-1.jpg': sweater1,
  '/products/pants-1.jpg': pants1,
  '/products/tshirt-1.jpg': tshirt1,
  '/products/blazer-1.jpg': blazer1,
  '/products/shirt-1.jpg': shirt1,
};

// Color-based image overlay/tint mapping
const colorOverlayMap: Record<string, string> = {
  'Beige': 'sepia(30%) saturate(70%)',
  'Charcoal': 'saturate(20%) brightness(70%)',
  'Ivory': 'sepia(10%) brightness(105%)',
  'Cream': 'sepia(20%) brightness(102%)',
  'Navy': 'hue-rotate(200deg) saturate(150%) brightness(60%)',
  'Black': 'saturate(0%) brightness(40%)',
  'Sand': 'sepia(40%) saturate(60%) brightness(95%)',
  'Olive': 'hue-rotate(60deg) saturate(80%) brightness(80%)',
  'White': 'brightness(110%) saturate(50%)',
  'Stone': 'sepia(20%) saturate(40%) brightness(85%)',
};

const colorSwatchMap: Record<string, string> = {
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

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Reset selections when product changes
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || '');
      setSelectedSize('');
    }
  }, [product]);

  if (!product) return null;

  const productImage = imageMap[product.image] || product.image;
  const isWishlisted = isInWishlist(product.id);
  const imageFilter = selectedColor ? colorOverlayMap[selectedColor] : '';

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: 'Please select a size',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedColor) {
      toast({
        title: 'Please select a color',
        variant: 'destructive',
      });
      return;
    }

    addItem(product, selectedSize, selectedColor);
    toast({
      title: 'Added to bag',
      description: `${product.name} has been added to your bag.`,
    });
    onClose();
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
    toast({
      title: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
    });
  };

  const handleImageClick = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
            >
              <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0 max-h-[85vh] overflow-y-auto">
                  {/* Image - Clickable to navigate to product details */}
                  <div 
                    className="relative aspect-[3/4] md:aspect-auto cursor-pointer group overflow-hidden"
                    onClick={handleImageClick}
                  >
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none transition-all duration-300 group-hover:scale-105"
                      style={{ filter: imageFilter }}
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none" />
                    {product.isNew && (
                      <span className="absolute top-4 left-4 px-3 py-1 text-xs font-medium tracking-wider uppercase bg-primary text-primary-foreground rounded-full">
                        New
                      </span>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
                        <span className="text-sm font-medium text-muted-foreground">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 relative">
                    <button
                      onClick={onClose}
                      className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="space-y-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
                        <h2 className="text-2xl font-semibold text-foreground">{product.name}</h2>
                        <p className="text-2xl font-semibold mt-2">${product.price}</p>
                      </div>

                      <p className="text-muted-foreground text-sm">{product.description}</p>

                      {/* Color Selection */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">Color</span>
                          {selectedColor && <span className="text-sm text-muted-foreground">{selectedColor}</span>}
                        </div>
                        <div className="flex gap-3">
                          {product.colors.map((color) => (
                            <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                colorSwatchMap[color] || 'bg-secondary'
                              } ${
                                selectedColor === color 
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
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium">Size</span>
                          <button 
                            onClick={() => setShowSizeGuide(true)}
                            className="flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            <Ruler className="w-4 h-4" />
                            Size Guide
                          </button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {product.sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                                selectedSize === size
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button
                          onClick={handleAddToCart}
                          disabled={!product.inStock}
                          className="flex-1 gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          {product.inStock ? 'Add to Bag' : 'Out of Stock'}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleWishlist}
                        >
                          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-primary text-primary' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SizeGuideModal 
        isOpen={showSizeGuide} 
        onClose={() => setShowSizeGuide(false)} 
        category={product.category} 
      />
    </>
  );
};

export default QuickViewModal;