// components/admin/ProductDialog.tsx
import { useState, useEffect } from 'react';
import { useProducts } from '@/context/ProductsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/types/Product';

interface ProductDialogProps {
    open: boolean;
    onClose: () => void;
    editingProduct: Product | null;
}

const ProductDialog = ({ open, onClose, editingProduct }: ProductDialogProps) => {
    const { createProduct, updateProduct } = useProducts();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'fashion',
        description: '',
        sizes: 'XS, S, M, L, XL',
        colors: 'Black, White',
        stock: '10',
        inStock: true,
        isNew: false,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editingProduct) {
            setFormData({
                name: editingProduct.name,
                price: editingProduct.price.toString(),
                category: editingProduct.category,
                description: editingProduct.description || '',
                sizes: (editingProduct.sizes || []).join(', '),
                colors: (editingProduct.colors || []).join(', '),
                stock: (editingProduct.stock || 0).toString(),
                inStock: editingProduct.inStock || true,
                isNew: editingProduct.isNew || false,
            });
            setImagePreview(editingProduct.image || null);
        } else {
            resetForm();
        }
    }, [editingProduct, open]);

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            category: 'fashion',
            description: '',
            sizes: 'XS, S, M, L, XL',
            colors: 'Black, White',
            stock: '10',
            inStock: true,
            isNew: false,
        });
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('category', formData.category.toLowerCase());
        data.append('description', formData.description);
        data.append('stock', formData.stock);
        data.append('isActive', formData.inStock.toString());
        data.append('isNew', formData.isNew.toString());

        // Parse sizes and colors
        const sizesArr = formData.sizes.split(',').map((s) => s.trim()).filter(Boolean);
        const colorsArr = formData.colors.split(',').map((c) => c.trim()).filter(Boolean);

        sizesArr.forEach((s) => data.append('sizes[]', s));
        colorsArr.forEach((c) => data.append('colors[]', c));

        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (editingProduct) {
                const res = await updateProduct(editingProduct.id, data);
                toast({ title: res.data.message });
            } else {
                const res = await createProduct(data);
                toast({ title: res.data.message });
            }
            onClose();
            resetForm();
        } catch (err: any) {
            console.error('Submit product error:', err);
            toast({
                title: err.response?.data?.message || (editingProduct ? 'Failed to update product' : 'Failed to create product'),
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);
        setImagePreview(file ? URL.createObjectURL(file) : null);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Product Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter product name"
                            required
                        />
                    </div>

                    {/* Price and Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price (₹) *</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <select
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                                required
                            >
                                <option value="fashion">Fashion</option>
                                <option value="electronics">Electronics</option>
                                <option value="home">Home</option>
                                <option value="books">Books</option>
                                <option value="sports">Sports</option>
                                <option value="beauty">Beauty</option>
                                <option value="toys">Toys</option>
                                <option value="food">Food</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Enter product description"
                            rows={4}
                            required
                        />
                    </div>

                    {/* Sizes, Colors, Stock */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="sizes">Sizes</Label>
                            <Input
                                id="sizes"
                                value={formData.sizes}
                                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                                placeholder="XS, S, M, L"
                            />
                            <p className="text-xs text-muted-foreground">Comma separated</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="colors">Colors</Label>
                            <Input
                                id="colors"
                                value={formData.colors}
                                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                                placeholder="Black, White"
                            />
                            <p className="text-xs text-muted-foreground">Comma separated</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock *</Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                placeholder="10"
                                required
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="image">Product Image</Label>
                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        {imagePreview && (
                            <div className="mt-2">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg border border-border"
                                />
                            </div>
                        )}
                    </div>

                    {/* Checkboxes */}
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.inStock}
                                onChange={(e) =>
                                    setFormData({ ...formData, inStock: e.target.checked })
                                }
                                className="rounded border-input"
                            />
                            <span className="text-sm">In Stock</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isNew}
                                onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                                className="rounded border-input"
                            />
                            <span className="text-sm">Mark as New</span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting
                                ? 'Saving...'
                                : editingProduct
                                    ? 'Update Product'
                                    : 'Create Product'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProductDialog;
