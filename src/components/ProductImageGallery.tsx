import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, RotateCcw } from 'lucide-react';
import { Product } from '@/data/products';

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

interface ProductImageGalleryProps {
  product: Product;
  selectedColor?: string | null;
}

const ProductImageGallery = ({ product, selectedColor }: ProductImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [show360View, setShow360View] = useState(false);

  // Reset selected index when color changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [selectedColor]);

  // Generate gallery images (using main image 3 times to simulate multiple angles)
  const mainImage = imageMap[product.image] || product.image;
  const galleryImages = [mainImage, mainImage, mainImage, mainImage];
  const imageFilter = selectedColor ? colorOverlayMap[selectedColor] : '';

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Main Image */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-secondary group">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={galleryImages[selectedIndex]}
              alt={`${product.name} - View ${selectedIndex + 1}`}
              className={`w-full h-full object-cover transition-all duration-300 ${
                isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
              }`}
              style={{
                filter: imageFilter,
                ...(isZoomed ? { transformOrigin: `${mousePosition.x}% ${mousePosition.y}%` } : {}),
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
          aria-label="Next image"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* 360 View Button */}
        <button
          onClick={() => setShow360View(true)}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm font-medium">360° View</span>
        </button>

        {/* Zoom Indicator */}
        <div className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4" />
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-sm font-medium">
          {selectedIndex + 1} / {galleryImages.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {galleryImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden transition-all ${
              selectedIndex === index
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                : 'opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={image}
              alt={`${product.name} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              style={{ filter: imageFilter }}
            />
          </button>
        ))}
      </div>

      {/* 360 View Modal */}
      <AnimatePresence>
        {show360View && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
            onClick={() => setShow360View(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-2xl w-full mx-4 p-8 rounded-3xl bg-secondary text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShow360View(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-accent transition-colors"
              >
                ✕
              </button>
              <RotateCcw className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">360° View Coming Soon</h3>
              <p className="text-muted-foreground">
                We're working on adding immersive 360-degree product views. Check back soon!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductImageGallery;
