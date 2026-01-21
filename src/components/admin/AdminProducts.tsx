import { useState, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import { useProducts } from '@/context/ProductsContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ProductDialog from './ProductDialog';
import type { Product } from '@/types/Product';
import { formatCurrency } from '@/lib/utils';

const AdminProducts = () => {
    const { products, pagination, loadProducts, isLoading, isAppending, updateProduct, deleteProduct } = useProducts();
    const { toast } = useToast();
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const observer = useRef<IntersectionObserver>();

    const handleLoadMore = useCallback(() => {
        if (pagination.hasMore && !isLoading && !isAppending) {
            loadProducts({ page: pagination.currentPage + 1, limit: 10 }, true);
        }
    }, [pagination.hasMore, pagination.currentPage, isLoading, isAppending, loadProducts]);

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

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsProductDialogOpen(true);
    };

    const handleDeleteProduct = async (productId: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const res = await deleteProduct(productId);
                toast({ title: res.data.message });
            } catch (error: any) {
                toast({ title: error.response?.data?.message || 'Failed to delete product', variant: 'destructive' });
            }
        }
    };

    const toggleProductStock = async (product: Product) => {
        try {
            const data = new FormData();
            data.append('stock', product.inStock ? '0' : '10');
            const res = await updateProduct(product.id, data);
            toast({ title: res.data.message });
        } catch (error: any) {
            toast({ title: error.response?.data?.message || 'Failed to update product', variant: 'destructive' });
        }
    };

    const handleDialogClose = () => {
        setIsProductDialogOpen(false);
        setEditingProduct(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Inventory Management ({pagination.total})</h2>
                <Button
                    onClick={() => {
                        setEditingProduct(null);
                        setIsProductDialogOpen(true);
                    }}
                    className="gap-2 rounded-xl"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </Button>
            </div>

            {/* Product Dialog */}
            <ProductDialog
                open={isProductDialogOpen}
                onClose={handleDialogClose}
                editingProduct={editingProduct}
            />

            {/* Products Listing - Unified for smooth infinite scroll */}
            <div className="space-y-4 pb-10">
                {products.length === 0 && !isLoading ? (
                    <div className="bg-secondary/30 rounded-2xl p-12 text-center border-2 border-dashed border-border">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">Your inventory is empty.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="p-4 bg-card rounded-2xl border border-border hover:shadow-md transition-all group"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-border bg-secondary">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.category}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-primary">{formatCurrency(product.price)}</p>
                                                    <p className="text-[10px] text-muted-foreground">Qty: {product.stock || 0}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => toggleProductStock(product)}
                                                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                                                        title={product.inStock ? 'Mark Out of Stock' : 'Mark In Stock'}
                                                    >
                                                        {product.inStock ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditProduct(product)}
                                                        className="p-1.5 rounded-lg hover:bg-secondary text-blue-500 transition-colors"
                                                        title="Edit Product"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="p-1.5 rounded-lg hover:bg-secondary text-destructive transition-colors"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Infinite Scroll Trigger */}
                        <div ref={lastElementRef} className="h-32 flex flex-col items-center justify-center gap-4">
                            {isAppending && (
                                <>
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Fetching inventory...</span>
                                </>
                            )}
                            {!pagination.hasMore && products.length > 0 && (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-px w-20 bg-border"></div>
                                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">End of Stock</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminProducts;
