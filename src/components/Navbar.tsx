import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Sun, Moon, Menu, X, Search, Heart, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { Link } from 'react-router-dom';
import SearchOverlay from './SearchOverlay';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, toggleCart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { wishlist } = useWishlist();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Shop', href: '/products' },
    { name: 'About', href: '#about' },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass py-3' : 'bg-transparent py-5'
        }`}
      >
        <nav className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="relative z-10">
            <motion.span className="text-xl font-semibold tracking-tight text-foreground" whileHover={{ opacity: 0.7 }}>
              ATELIER
            </motion.span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <motion.button onClick={() => setSearchOpen(true)} className="p-2 rounded-full hover:bg-secondary transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Search className="w-5 h-5 text-foreground" />
            </motion.button>

            <Link to={user ? '/profile' : '/login'}>
              <motion.div className="relative p-2 rounded-full hover:bg-secondary transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <User className="w-5 h-5 text-foreground" />
              </motion.div>
            </Link>

            <Link to="/profile?tab=wishlist">
              <motion.div className="relative p-2 rounded-full hover:bg-secondary transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Heart className="w-5 h-5 text-foreground" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </motion.div>
            </Link>

            <motion.button onClick={toggleTheme} className="p-2 rounded-full hover:bg-secondary transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {theme === 'dark' ? <Sun className="w-5 h-5 text-foreground" /> : <Moon className="w-5 h-5 text-foreground" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            <motion.button onClick={toggleCart} className="relative p-2 rounded-full hover:bg-secondary transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <ShoppingBag className="w-5 h-5 text-foreground" />
              {itemCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                  {itemCount}
                </motion.span>
              )}
            </motion.button>

            <motion.button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              {mobileMenuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
            </motion.button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-x-0 top-16 z-40 md:hidden">
            <div className="glass mx-4 rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link key={link.name} to={link.href} onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                ))}
                <Link to={user ? '/profile' : '/login'} onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                  {user ? 'My Account' : 'Sign In'}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
