import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
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

const CartDrawer = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, itemCount } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-foreground" />
                <h2 className="text-lg font-semibold text-foreground">
                  Your Bag ({itemCount})
                </h2>
              </div>
              <motion.button
                onClick={closeCart}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-foreground" />
              </motion.button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground mb-2">Your bag is empty</p>
                  <motion.button
                    onClick={closeCart}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Continue Shopping
                  </motion.button>
                </div>
              ) : (
                <ul className="space-y-6">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <motion.li
                        key={`${item.product.id}-${item.size}-${item.color}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4"
                      >
                        {/* Product Image */}
                        <div className="w-24 h-32 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                          <img
                            src={imageMap[item.product.image] || item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium text-foreground">
                                {item.product.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.size} · {item.color}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.product.id, item.size, item.color)}
                              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Remove item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-auto">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.size,
                                    item.color,
                                    item.quantity - 1
                                  )
                                }
                                className="p-1.5 rounded-lg bg-secondary hover:bg-accent transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.size,
                                    item.color,
                                    item.quantity + 1
                                  )
                                }
                                className="p-1.5 rounded-lg bg-secondary hover:bg-accent transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <span className="font-semibold text-foreground">
                              ${item.product.price * item.quantity}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-xl font-semibold text-foreground">${total}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Checkout
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
