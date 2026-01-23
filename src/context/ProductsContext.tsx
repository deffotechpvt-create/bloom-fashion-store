import React, { createContext, useContext, useState, useEffect } from 'react';
import { useApi, getBaseURL } from '@/lib/api';
import type { Product } from '@/types/Product';

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  isAppending: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
    hasMore: boolean;
  };
  loadProducts: (params?: Record<string, any>, append?: boolean) => Promise<void>;
  getProductById: (id: string) => Promise<Product | null>;
  createProduct: (formData: FormData) => Promise<any>;
  updateProduct: (id: string, formData: FormData) => Promise<any>;
  deleteProduct: (id: string) => Promise<any>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: React.ReactNode }) => {
  const api = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAppending, setIsAppending] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
    hasMore: true
  });

  const mapServerProduct = (p: any): Product => {
    const apiBase = getBaseURL();
    const origin = apiBase.replace(/\/api\/?$/, '');

    const normalizeUrl = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      if (url.startsWith('/products/')) return url; // Keep local assets as is
      return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return {
      id: p._id || p.id,
      _id: p._id,
      name: p.name,
      price: p.price,
      category: p.category,
      image: normalizeUrl(p.image || (p.images && p.images[0]) || ''),
      images: Array.isArray(p.images) ? p.images.map(normalizeUrl) : [],
      description: p.description || '',
      sizes: p.sizes?.length ? p.sizes : ['XS', 'S', 'M', 'L', 'XL'],
      colors: p.colors?.length ? p.colors : ['Black', 'White'],
      inStock: (typeof p.stock === 'number') ? p.stock > 0 : !!p.inStock,
      isNew: !!p.isNew,
      stock: p.stock || 0
    };
  };

  const loadProducts = async (params?: Record<string, any>, append = false) => {
    try {
      if (append) setIsAppending(true);
      else setIsLoading(true);
      const res = await api.get('/products', { params });
      const { data: fetched = [], total = 0, page = 1, pages = 1 } = res?.data || {};

      const mapped = fetched.map((p: any) => mapServerProduct(p));
      if (append) {
        setProducts(prev => [...prev, ...mapped]);
      } else {
        setProducts(mapped);
      }

      setPagination({
        currentPage: Number(page),
        totalPages: Number(pages),
        total: Number(total),
        limit: params?.limit || 10,
        hasMore: Number(page) < Number(pages)
      });
    } catch (err) {
      if (!append) setProducts([]);
    } finally {
      setIsLoading(false);
      setIsAppending(false);
    }
  };

  const createProduct = async (formData: FormData) => {
    try {
      const res = await api.post('/admin/products', formData);
      const newProd = mapServerProduct(res.data.data);
      setProducts(prev => [newProd, ...prev]);
      return res;
    } catch (err) {
      console.error('Create product error:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, formData: FormData) => {
    try {
      const res = await api.put(`/admin/products/${id}`, formData);
      const updatedProd = mapServerProduct(res.data.data);
      setProducts(prev => prev.map(p => p.id === id || p._id === id ? updatedProd : p));
      return res;
    } catch (err) {
      console.error('Update product error:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await api.del(`/admin/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id && p._id !== id));
      return res;
    } catch (err) {
      console.error('Delete product error:', err);
      throw err;
    }
  };

  const getProductById = async (id: string) => {
    // try cache first
    const cached = products.find((p) => p.id === id || p._id === id);
    if (cached) return cached;

    try {
      const res = await api.get(`/products/${id}`);
      const p = res?.data?.data;
      if (!p) return null;
      const mapped = mapServerProduct(p);
      // add to cache
      setProducts((prev) => {
        if (prev.some(x => x.id === mapped.id)) return prev;
        return [mapped, ...prev];
      });
      return mapped;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    // load initial product list (reasonable limit)
    loadProducts({ limit: 10, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProductsContext.Provider value={{
      products,
      isLoading,
      isAppending,
      pagination,
      loadProducts,
      getProductById,
      createProduct,
      updateProduct,
      deleteProduct
    }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
};
