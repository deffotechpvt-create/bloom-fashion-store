import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="about" className="border-t border-border bg-card">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-1">
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xl font-semibold tracking-tight text-foreground">
              ATELIER
            </motion.span>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">Timeless essentials crafted with intention for the modern wardrobe.</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link to="/products?category=Essentials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Essentials</Link></li>
              <li><Link to="/products?category=Outerwear" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Outerwear</Link></li>
              <li><Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Help</h4>
            <ul className="space-y-3">
              <li><Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shipping</Link></li>
              <li><Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Returns</Link></li>
              <li><Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Size Guide</Link></li>
              <li><Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-4">Subscribe for exclusive drops and early access.</p>
            <form className="flex gap-2">
              <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-2.5 text-sm bg-secondary rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground" />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors">
                Join
              </motion.button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© {currentYear} Atelier. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/profile" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/profile" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
