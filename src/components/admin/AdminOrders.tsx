import { useEffect, useState, useCallback, useRef } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { formatDate, formatCurrency } from '@/lib/utils';
import OrderStatusBadge from './OrderStatusBadge';
import OrderFilters from './OrderFilters';

const AdminOrders = () => {
    const {
        orders,
        getAllOrders,
        updateOrderStatus,
        updatePaymentStatus,
        ordersLoading,
        ordersAppending,
        ordersPagination,
    } = useAdmin();

    const [filters, setFilters] = useState({
        status: '',
        paymentStatus: '',
        search: '',
    });

    const observer = useRef<IntersectionObserver>();

    const handleLoadMore = useCallback(() => {
        if (ordersPagination.hasMore && !ordersLoading && !ordersAppending) {
            getAllOrders(ordersPagination.currentPage + 1, 10, filters, true);
        }
    }, [ordersPagination.hasMore, ordersPagination.currentPage, ordersLoading, ordersAppending, filters, getAllOrders]);

    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (ordersLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && ordersPagination.hasMore) {
                handleLoadMore();
            }
        }, { threshold: 1.0 });
        if (node) observer.current.observe(node);
    }, [ordersLoading, ordersPagination.hasMore, handleLoadMore]);

    useEffect(() => {
        if (orders.length === 0) {
            getAllOrders(1, 10, filters);
        }
        console.log('Filters changed:', orders);
    }, [getAllOrders, orders.length, filters]);

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
        getAllOrders(1, 10, newFilters);
    };

    if (ordersLoading && orders.length === 0) {
        return <div className="text-center py-8 text-muted-foreground animate-pulse">Loading orders...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                    All Orders ({ordersPagination.totalOrders})
                </h2>
            </div>

            {/* Filters */}
            <OrderFilters filters={filters} onChange={handleFilterChange} />

            {/* Orders List */}
            {orders.length === 0 && !ordersLoading ? (
                <div className="bg-secondary/30 rounded-2xl p-12 text-center border-2 border-dashed border-border">
                    <p className="text-muted-foreground">No orders found matching your criteria.</p>
                </div>
            ) : (
                <div className="space-y-4 pb-10">
                    {orders.map((order) => (
                        <div
                            key={order._id}
                            className="p-6 bg-card rounded-2xl border border-border hover:shadow-lg transition-all"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                                <div className="space-y-1">
                                    <p className="font-semibold text-lg">Order #{order._id.slice(-8)}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(order.createdAt)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                            {(order.user?.name || 'G')[0].toUpperCase()}
                                        </div>
                                        <p className="text-sm font-medium">
                                            {order.user?.name || order.user?.email || 'Guest User'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end gap-2">
                                    <p className="font-bold text-xl text-primary">
                                        {formatCurrency(order.totalAmount)}
                                    </p>
                                    <div className="flex gap-2">
                                        <OrderStatusBadge status={order.orderStatus} type="order" />
                                        <OrderStatusBadge status={order.paymentStatus} type="payment" />
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="mb-6 bg-secondary/40 rounded-2xl p-5 border border-border/40">
                                <p className="text-xs font-bold mb-4 uppercase tracking-widest text-muted-foreground">
                                    Order Items
                                </p>

                                <div className="space-y-3">
                                    {order.products.map((item: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between gap-4 p-3 bg-background/40 rounded-xl border border-border/30 hover:bg-background/60 transition"
                                        >

                                            {/* LEFT: IMAGE + DETAILS */}
                                            <div className="flex items-center gap-4 flex-1 min-w-0">

                                                <img
                                                    src={item.product?.image || "/placeholder.png"}
                                                    alt={item.product?.name || item.name || "Product"}
                                                    className="w-14 h-14 object-cover rounded-xl border border-border/40"
                                                />

                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {item.product?.name || item.name}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        ₹{item.price} each
                                                    </p>
                                                </div>

                                            </div>

                                            {/* RIGHT: QUANTITY BADGE */}
                                            <div className="flex items-center justify-center min-w-[42px] h-[32px] rounded-lg bg-primary/10 text-primary text-sm font-semibold">
                                                ×{item.quantity}
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </div>


                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border">
                                <div className="w-full sm:flex-1">
                                    <p className="text-[10px] font-bold mb-1.5 uppercase text-muted-foreground ml-1">Order Status</p>
                                    <select
                                        className="w-full bg-secondary/80 px-4 py-2.5 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
                                        value={order.orderStatus}
                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="w-full sm:flex-1">
                                    <p className="text-[10px] font-bold mb-1.5 uppercase text-muted-foreground ml-1">Payment Status</p>
                                    <select
                                        className="w-full bg-secondary/80 px-4 py-2.5 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
                                        value={order.paymentStatus}
                                        onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                                    >
                                        <option value="pending">Payment Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Infinite Scroll Trigger */}
                    <div ref={lastElementRef} className="h-32 flex flex-col items-center justify-center gap-4 py-8">
                        {ordersAppending && (
                            <>
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest animate-pulse">Loading more orders...</span>
                            </>
                        )}
                        {!ordersPagination.hasMore && orders.length > 0 && (
                            <div className="flex flex-col items-center gap-2">
                                <div className="h-px w-24 bg-border"></div>
                                <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">End of results</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
