import { useEffect, useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useProducts } from '@/context/ProductsContext';
import { useApi } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { getBaseURL } from '@/lib/api';

const AdminOverview = () => {
    const { dashboardStats, statsLoading } = useAdmin();
    const { products } = useProducts();
    const { get } = useApi();

    const [enrichedOrders, setEnrichedOrders] = useState<any[]>([]);
    const [enrichedProducts, setEnrichedProducts] = useState<any[]>([]);
    const [isEnriching, setIsEnriching] = useState(false);

    // Enrich data when dashboardStats changes
    useEffect(() => {
        if (dashboardStats && !isEnriching) {
            enrichDashboardData();
        }
    }, [dashboardStats]);

    const enrichDashboardData = async () => {
        setIsEnriching(true);

        try {
            // 1. Enrich Top Products
            const enrichedProds = await enrichTopProducts(
                dashboardStats.topProducts || []
            );
            setEnrichedProducts(enrichedProds);

            // 2. Enrich Recent Orders
            const enrichedOrds = await enrichRecentOrders(
                dashboardStats.recentOrders || []
            );
            setEnrichedOrders(enrichedOrds);

        } catch (error) {
            console.error('Enrichment error:', error);
        } finally {
            setIsEnriching(false);
        }
    };

    // Enrich products: Try context first, then fetch
    const enrichTopProducts = async (topProducts: any[]) => {
        return Promise.all(
            topProducts.map(async (topProd) => {
                // 1. Try to find in ProductsContext
                let product = products.find(
                    (p: any) => (p.id === topProd._id || p._id === topProd._id)
                );

                // 2. If not found, fetch from API
                if (!product) {
                    try {
                        const res = await get(`/products/${topProd._id}`);
                        product = res.data;
                    } catch (error) {
                        console.error(`Failed to fetch product ${topProd._id}:`, error);
                        product = null;
                    }
                }

                // 3. Return enriched data
                return {
                    _id: topProd._id,
                    totalQuantity: topProd.totalQuantity,
                    totalRevenue: topProd.totalRevenue,
                    name: product?.name || 'Unknown Product',
                    image: product?.image || null,
                    price: product?.price || 0
                };
            })
        );
    };

    // Enrich orders: Fetch full order details
    const enrichRecentOrders = async (recentOrders: any[]) => {
        return Promise.all(
            recentOrders.map(async (order) => {
                try {
                    // Fetch full order details (includes user)
                    const res = await get(`/admin/orders/${order._id}`);
                    const fullOrder = res.data.data;

                    return {
                        _id: order._id,
                        totalAmount: order.totalAmount,
                        orderStatus: order.orderStatus,
                        paymentStatus: order.paymentStatus,
                        createdAt: order.createdAt,
                        user: fullOrder.user || null
                    };
                } catch (error) {
                    console.error(`Failed to fetch order ${order._id}:`, error);
                    // Return original if fetch fails
                    return {
                        ...order,
                        user: null
                    };
                }
            })
        );
    };

    if (statsLoading || isEnriching) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Recent Orders */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                {enrichedOrders.length === 0 ? (
                    <p className="text-muted-foreground">No recent orders.</p>
                ) : (
                    <div className="space-y-3">
                        {enrichedOrders.map((order: any) => (
                            <div
                                key={order._id}
                                className="flex items-center justify-between p-4 bg-secondary rounded-xl hover:bg-accent transition-colors"
                            >
                                <div>
                                    <p className="font-medium">Order #{order._id.slice(-8)}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {order.user?.name || order.user?.email || 'Guest'} • {formatDate(order.createdAt)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{formatCurrency(order.totalAmount)}</p>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${order.orderStatus === 'delivered'
                                            ? 'bg-green-500/20 text-green-500'
                                            : order.orderStatus === 'shipped'
                                                ? 'bg-blue-500/20 text-blue-500'
                                                : order.orderStatus === 'processing'
                                                    ? 'bg-yellow-500/20 text-yellow-500'
                                                    : order.orderStatus === 'cancelled'
                                                        ? 'bg-red-500/20 text-red-500'
                                                        : 'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        {order.orderStatus}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Top Products */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Top Selling Products</h2>
                {enrichedProducts.length === 0 ? (
                    <p className="text-muted-foreground">No sales data yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {enrichedProducts.map((product: any) => (
                            <div
                                key={product._id}
                                className="flex items-center gap-4 p-4 bg-secondary rounded-xl"
                            >
                                {product.image ? (
                                    <img
                                        src={
                                            product.image.startsWith('http')
                                                ? product.image
                                                : `${getBaseURL().replace('/api', '')}${product.image}`
                                        }
                                        alt={product.name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src =
                                                'https://placehold.co/100x100?text=Product';
                                        }}
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                        <span className="text-xs text-muted-foreground">No Image</span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {product.totalQuantity || 0} sold
                                    </p>
                                </div>
                                <p className="font-semibold">
                                    {formatCurrency(product.totalRevenue || (product.price * product.totalQuantity))}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOverview;
