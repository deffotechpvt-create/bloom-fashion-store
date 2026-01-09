import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Bell, Eye } from 'lucide-react';
import { Product } from '@/data/products';
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

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes[2]);
  const [showQuickView, setShowQuickView] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (product.inStock) {
      addItem(product, selectedSize, product.colors[0]);
    }
  };

  const productImage = imageMap[product.image] || product.image;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary mb-4">
        <motion.img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
        />

        {/* New Badge */}
        {product.isNew && (
          <span className="absolute top-4 left-4 px-3 py-1 text-xs font-medium tracking-wider uppercase bg-primary text-primary-foreground rounded-full">
            New
          </span>
        )}

        {/* Out of Stock Badge */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground">Out of Stock</span>
          </div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-4 inset-x-4 flex gap-2"
        >
          {product.inStock ? (
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Bag
            </button>
          ) : (
            <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 glass rounded-xl hover:bg-secondary transition-colors">
              <Bell className="w-4 h-4" />
              Notify Me
            </button>
          )}
          <button
            onClick={() => setShowQuickView(true)}
            className="p-3 glass rounded-xl hover:bg-secondary transition-colors"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <Link to={`/product/${product.id}`}>
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors hover:underline">
              {product.name}
            </h3>
          </Link>
          <span className="font-semibold text-foreground">
            ${product.price}
          </span>
        </div>

        <p className="text-sm text-muted-foreground">{product.category}</p>

        {/* Size Selector on Hover */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isHovered ? 1 : 0, 
            height: isHovered ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="flex gap-1 pt-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedSize === size
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.article>
  );
};

export default ProductCard;
