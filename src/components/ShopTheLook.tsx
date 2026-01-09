import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ShoppingBag } from 'lucide-react';
import { Product, products } from '@/data/products';
import { useCart } from '@/context/CartContext';

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

interface ShopTheLookProps {
  currentProduct: Product;
}

const ShopTheLook = ({ currentProduct }: ShopTheLookProps) => {
  const { addItem } = useCart();

  // Get complementary products (different categories, excluding current product)
  const getComplementaryProducts = (): Product[] => {
    const complementaryCategories: Record<string, string[]> = {
      'Outerwear': ['Knitwear', 'Essentials', 'Tailoring'],
      'Knitwear': ['Tailoring', 'Outerwear', 'Shirts'],
      'Tailoring': ['Knitwear', 'Shirts', 'Essentials'],
      'Essentials': ['Tailoring', 'Outerwear', 'Knitwear'],
      'Shirts': ['Tailoring', 'Knitwear', 'Outerwear'],
      'Seasonal': ['Essentials', 'Tailoring', 'Outerwear'],
    };

    const targetCategories = complementaryCategories[currentProduct.category] || [];
    
    return products
      .filter((p) => p.id !== currentProduct.id && targetCategories.includes(p.category))
      .slice(0, 3);
  };

  const suggestedProducts = getComplementaryProducts();

  if (suggestedProducts.length === 0) return null;

  const totalLookPrice = suggestedProducts.reduce((sum, p) => sum + p.price, 0) + currentProduct.price;

  const handleQuickAdd = (product: Product) => {
    if (product.inStock) {
      addItem(product, product.sizes[2], product.colors[0]);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-20 pt-12 border-t border-border"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-xl bg-primary/10">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Shop the Look</h2>
          <p className="text-sm text-muted-foreground">AI-curated pieces that complement your selection</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Current Product Card */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary ring-2 ring-primary ring-offset-2 ring-offset-background">
          <img
            src={imageMap[currentProduct.image] || currentProduct.image}
            alt={currentProduct.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-4">
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full mb-2">
              Selected
            </span>
            <h3 className="font-medium text-foreground text-sm truncate">{currentProduct.name}</h3>
            <p className="text-sm font-semibold text-foreground">${currentProduct.price}</p>
          </div>
        </div>

        {/* Suggested Products */}
        {suggestedProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary"
          >
            <Link to={`/product/${product.id}`}>
              <img
                src={imageMap[product.image] || product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            </Link>
            
            <div className="absolute bottom-0 inset-x-0 p-4">
              <Link to={`/product/${product.id}`}>
                <h3 className="font-medium text-foreground text-sm truncate hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm font-semibold text-foreground">${product.price}</p>
                {product.inStock && (
                  <button
                    onClick={() => handleQuickAdd(product)}
                    className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    aria-label={`Quick add ${product.name}`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total Look Price */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-8 p-6 bg-secondary rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <p className="text-sm text-muted-foreground">Complete the look</p>
          <p className="text-2xl font-bold text-foreground">${totalLookPrice}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Save 10% when you buy the complete look
          </p>
        </div>
        <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
          Add All to Bag
        </button>
      </motion.div>
    </motion.section>
  );
};

export default ShopTheLook;
