import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import MobileBottomBar from '@/components/MobileBottomBar';

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ProductGrid />
      <Footer />
      <CartDrawer />
      <MobileBottomBar />
    </main>
  );
};

export default Index;
