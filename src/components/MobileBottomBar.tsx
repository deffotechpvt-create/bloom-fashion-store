import { motion } from 'framer-motion';
import { Home, Grid3X3, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const MobileBottomBar = () => {
  const { itemCount, toggleCart } = useCart();

  const navItems = [
    { icon: Home, label: 'Home', href: '#' },
    { icon: Grid3X3, label: 'Shop', href: '#shop' },
    { icon: ShoppingBag, label: 'Bag', action: toggleCart, badge: itemCount },
    { icon: User, label: 'Account', href: '#' },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
    >
      <div className="glass border-t border-[hsl(var(--glass-border))] px-6 py-3 safe-area-pb">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <motion.button
              key={item.label}
              onClick={item.action}
              whileTap={{ scale: 0.9 }}
              className="relative flex flex-col items-center gap-1 p-2"
            >
              {item.href ? (
                <a href={item.href} className="flex flex-col items-center gap-1">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </a>
              ) : (
                <>
                  <div className="relative">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default MobileBottomBar;
