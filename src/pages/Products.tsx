import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useProducts } from '@/context/ProductsContext';
import type { Product } from '@/types/Product';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  const { products, pagination, loadProducts, isLoading, isAppending } = useProducts();
  const observer = useRef<IntersectionObserver>();

  const fetchFilteredProducts = useCallback((page = 1, append = false, category = selectedCategory, range = priceRange, colors = selectedColors, sizes = selectedSizes) => {
    loadProducts({
      category: category === 'All' ? undefined : category.toLowerCase(),
      minPrice: range[0],
      maxPrice: range[1],
      colors: colors.length > 0 ? colors.join(',') : undefined,
      sizes: sizes.length > 0 ? sizes.join(',') : undefined,
      page,
      limit: 10
    }, append);
  }, [selectedCategory, priceRange, selectedColors, selectedSizes, loadProducts]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasMore && !isLoading && !isAppending) {
      const nextPage = pagination.currentPage + 1;
      fetchFilteredProducts(nextPage, true);
    }
  }, [pagination.hasMore, pagination.currentPage, isLoading, isAppending, fetchFilteredProducts]);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.hasMore) {
        handleLoadMore();
      }
    }, { threshold: 1.0 });
    if (node) observer.current.observe(node);
  }, [isLoading, pagination.hasMore, handleLoadMore]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchFilteredProducts(1, false, category);
  };

  const handlePriceChange = (range: number[]) => {
    setPriceRange(range);
    fetchFilteredProducts(1, false, selectedCategory, range);
  };

  const toggleColor = (color: string) => {
    const updated = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    setSelectedColors(updated);
    fetchFilteredProducts(1, false, selectedCategory, priceRange, updated);
  };

  const toggleSize = (size: string) => {
    const updated = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(updated);
    fetchFilteredProducts(1, false, selectedCategory, priceRange, selectedColors, updated);
  };

  const allColors = useMemo(() =>
    [...new Set(products.flatMap((p: Product) => p.colors || []))],
    [products]
  );

  const allSizes = useMemo(() =>
    [...new Set(products.flatMap((p: Product) => p.sizes || []))],
    [products]
  );

  const categories = useMemo(() => ['All', 'Fashion', 'Electronics', 'Home', 'Books', 'Sports', 'Beauty', 'Toys', 'Food', 'Other'], []);

  const filteredProducts = useMemo(() => {
    let result = products;
    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result = [...result].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }
    return result;
  }, [products, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setPriceRange([0, 50000]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSortBy('featured');
    loadProducts({ limit: 10, page: 1 }, false);
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 50000 ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-foreground">All Products</h1>
                <p className="text-muted-foreground mt-1">
                  {isLoading && products.length === 0 ? 'Loading...' : `${pagination.total} products total`}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </Button>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-secondary px-4 py-2 pr-10 rounded-xl text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-card rounded-2xl p-6 border border-border sticky top-24">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold">Filters</h2>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3">Category</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryChange(category)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${selectedCategory === category
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-accent'
                            }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3">Price Range</h3>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      onValueCommit={handlePriceChange}
                      min={0}
                      max={50000}
                      step={100}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>₹{priceRange[0]}</span>
                      <span>₹{priceRange[1]}</span>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-3">Colors</h3>
                    <div className="flex flex-wrap gap-2">
                      {allColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => toggleColor(color)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${selectedColors.includes(color)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-accent'
                            }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Sizes</h3>
                    <div className="flex flex-wrap gap-2">
                      {allSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${selectedSizes.includes(size)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-accent'
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="lg:col-span-3">
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="aspect-[3/4] bg-secondary animate-pulse rounded-2xl" />
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground mb-4">No products found matching your filters.</p>
                    <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                      ))}
                    </div>

                    {/* Infinite Scroll Trigger */}
                    <div ref={lastElementRef} className="h-20 flex items-center justify-center mt-8">
                      {isAppending && (
                        <div className="flex gap-2 items-center text-muted-foreground">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <span>Loading more...</span>
                        </div>
                      )}
                      {!pagination.hasMore && products.length > 0 && (
                        <p className="text-muted-foreground text-sm">You've reached the end.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
