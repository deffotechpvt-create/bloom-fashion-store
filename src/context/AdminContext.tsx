import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { useApi, getBaseURL } from '../lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// ----------------------
// Types
// ----------------------

export interface DashboardStats {
    overview: {
        totalRevenue: number;
        totalOrders: number;
        totalUsers: number;
        totalProducts: number;
        newUsersThisMonth: number;
    };
    recentOrders: any[];
    topProducts: any[];
    ordersByStatus: any[];
    lowStockProducts: any[];
    monthlyRevenue: any[];
    revenueGrowth?: number;
    ordersGrowth?: number;
    usersGrowth?: number;
}

export interface SalesAnalytics {
    dailySales: any[];
    monthlySales: any[];
    categorySales: any[];
    totalRevenue: number;
}

export interface AdminOrder {
    _id: string;
    id?: string;
    user: any;
    products: any[];
    totalAmount: number;
    shippingAddress: any;
    orderStatus: string;
    paymentStatus: string;
    paymentMethod: string;
    createdAt: string;
}

export interface AdminUser {
    _id: string;
    id?: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    totalOrders?: number;
    totalSpent?: number;
}

interface AdminContextType {
    // Dashboard
    dashboardStats: DashboardStats | null;
    salesAnalytics: SalesAnalytics | null;
    getDashboardStats: () => Promise<void>;
    getSalesAnalytics: (startDate?: string, endDate?: string) => Promise<void>;

    // Orders
    orders: AdminOrder[];
    currentOrder: AdminOrder | null;
    ordersLoading: boolean;
    ordersAppending: boolean;
    ordersPagination: {
        currentPage: number;
        totalPages: number;
        totalOrders: number;
        hasMore: boolean;
    };
    getAllOrders: (page?: number, limit?: number, filters?: any, append?: boolean) => Promise<void>;
    getOrderById: (orderId: string) => Promise<void>;
    updateOrderStatus: (orderId: string, status: string) => Promise<void>;
    updatePaymentStatus: (orderId: string, status: string) => Promise<void>;
    deleteOrder: (orderId: string) => Promise<void>;

    // Users
    users: AdminUser[];
    currentUser: AdminUser | null;
    usersLoading: boolean;
    usersAppending: boolean;
    usersPagination: {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        hasMore: boolean;
    };
    getAllUsers: (page?: number, limit?: number, filters?: any, append?: boolean) => Promise<void>;
    getUserById: (userId: string) => Promise<void>;
    requestPromotion: () => Promise<void>;
    verifyPromotion: (targetUserId: string, otp: string) => Promise<void>;
    toggleUserActive: (userId: string) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;

    // Global
    isLoading: boolean;
    statsLoading: boolean;
    error: string | null;
}

// ----------------------
// Context
// ----------------------

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// ----------------------
// Provider
// ----------------------

export const AdminProvider = ({ children }: { children: ReactNode }) => {
    const { get, post, put, del: apiDelete } = useApi();
    const { isAdmin } = useAuth();

    // Dashboard State
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);

    // Orders State
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [currentOrder, setCurrentOrder] = useState<AdminOrder | null>(null);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersAppending, setOrdersAppending] = useState(false);
    const [ordersPagination, setOrdersPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        hasMore: true,
    });

    // Users State
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersAppending, setUsersAppending] = useState(false);
    const [usersPagination, setUsersPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        hasMore: true,
    });

    // Refs for loading guards (to avoid function instability)
    const statsLoadingRef = useRef(false);
    const ordersLoadingRef = useRef(false);
    const usersLoadingRef = useRef(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ==================== DASHBOARD ====================

    const getDashboardStats = useCallback(async () => {
        if (!isAdmin || statsLoadingRef.current) return;

        try {
            statsLoadingRef.current = true;
            setStatsLoading(true);
            setError(null);
            const res = await get('/admin/stats');
            setDashboardStats(res.data.data);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Failed to fetch dashboard stats';
            setError(errorMsg);
            console.error('Dashboard stats error:', err);
        } finally {
            setStatsLoading(false);
            statsLoadingRef.current = false;
        }
    }, [get, isAdmin]);

    const getSalesAnalytics = useCallback(
        async (startDate?: string, endDate?: string) => {
            if (!isAdmin) return;

            try {
                setIsLoading(true);
                setError(null);

                const params = new URLSearchParams();
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);

                const res = await get(`/admin/analytics/sales?${params.toString()}`);
                setSalesAnalytics(res.data.data);
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to fetch sales analytics';
                setError(errorMsg);
                console.error('Sales analytics error:', err);
            } finally {
                setIsLoading(false);
            }
        },
        [get, isAdmin]
    );

    // ==================== ORDERS ====================

    const getAllOrders = useCallback(
        async (page = 1, limit = 10, filters?: any, append = false) => {
            if (!isAdmin || ordersLoadingRef.current) return;

            try {
                ordersLoadingRef.current = true;
                if (append) setOrdersAppending(true);
                else setOrdersLoading(true);
                setError(null);

                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                });

                if (filters?.status) params.append('status', filters.status);
                if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
                if (filters?.search) params.append('search', filters.search);

                const { data } = await get(`/admin/orders?${params.toString()}`);
                const normalizedOrders = (data.data || []).map((order: any) => ({
                    ...order,
                    products: order.products.map((item: any) => ({
                        ...item,
                        product: {
                            ...item.product,
                            image: item.product?.image
                                ? `${getBaseURL().replace(/\/api$/, '')}${item.product.image}`
                                : null

                        }
                    }))
                })); ``

                if (append) {
                    setOrders(prev => [...prev, ...normalizedOrders]);
                } else {
                    setOrders(normalizedOrders);
                }


                setOrdersPagination({
                    currentPage: data.pagination?.page || 1,
                    totalPages: data.pagination?.pages || 1,
                    totalOrders: data.pagination?.total || 0,
                    hasMore: (data.pagination?.page || 1) < (data.pagination?.pages || 1)
                });
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to fetch orders';
                setError(errorMsg);
                console.error('Get orders error:', err);
                if (!append) setOrders([]);
            } finally {
                setOrdersLoading(false);
                setOrdersAppending(false);
                ordersLoadingRef.current = false;
            }
        },
        [get, isAdmin]
    );

    const getOrderById = useCallback(
        async (orderId: string) => {
            if (!isAdmin) return;

            try {
                setIsLoading(true);
                setError(null);
                const res = await get(`/admin/orders/${orderId}`);
                setCurrentOrder(res.data.data);
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to fetch order';
                setError(errorMsg);
                console.error('Get order error:', err);
            } finally {
                setIsLoading(false);
            }
        },
        [get, isAdmin]
    );

    const updateOrderStatus = useCallback(
        async (orderId: string, status: string) => {
            if (!isAdmin) return;

            try {
                setIsLoading(true);
                setError(null);

                const res = await put(`/admin/orders/${orderId}/status`, {
                    orderStatus: status,
                });

                // Optimistic update
                setOrders((prev) =>
                    prev.map((order) =>
                        order._id === orderId || order.id === orderId
                            ? { ...order, orderStatus: status }
                            : order
                    )
                );

                if (currentOrder && (currentOrder._id === orderId || currentOrder.id === orderId)) {
                    setCurrentOrder(res.data.data);
                }
                toast.success(res.data.message);
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to update order status';
                setError(errorMsg);
                console.error('Update order status error:', err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [put, isAdmin, currentOrder]
    );

    const updatePaymentStatus = useCallback(
        async (orderId: string, status: string) => {
            if (!isAdmin) return;

            try {
                setIsLoading(true);
                setError(null);

                const res = await put(`/admin/orders/${orderId}/payment-status`, {
                    paymentStatus: status,
                });

                // Optimistic update
                setOrders((prev) =>
                    prev.map((order) =>
                        order._id === orderId || order.id === orderId
                            ? { ...order, paymentStatus: status }
                            : order
                    )
                );

                if (currentOrder && (currentOrder._id === orderId || currentOrder.id === orderId)) {
                    setCurrentOrder(res.data.data);
                }
                toast.success(res.data.message);
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to update payment status';
                setError(errorMsg);
                console.error('Update payment status error:', err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [put, isAdmin, currentOrder]
    );

    const deleteOrder = useCallback(
        async (orderId: string) => {
            if (!isAdmin) return;

            try {
                setIsLoading(true);
                setError(null);

                const res = await apiDelete(`/admin/orders/${orderId}`);

                // Remove from local state
                setOrders((prev) => prev.filter((order) => order._id !== orderId && order.id !== orderId));

                if (currentOrder && (currentOrder._id === orderId || currentOrder.id === orderId)) {
                    setCurrentOrder(null);
                }
                toast.success(res.data.message);
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to delete order';
                setError(errorMsg);
                console.error('Delete order error:', err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [apiDelete, isAdmin, currentOrder]
    );

    // ==================== USERS ====================

    const getAllUsers = useCallback(
        async (page = 1, limit = 10, filters?: any, append = false) => {
            if (!isAdmin || usersLoadingRef.current) return;

            try {
                usersLoadingRef.current = true;
                if (append) setUsersAppending(true);
                else setUsersLoading(true);
                setError(null);

                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: limit.toString(),
                });

                if (filters?.role) params.append('role', filters.role);
                if (filters?.search) params.append('search', filters.search);

                const res = await get(`/admin/users?${params.toString()}`);
                const data = res.data;

                if (append) {
                    setUsers(prev => [...prev, ...(data.data || [])]);
                } else {
                    setUsers(data.data || []);
                }

                setUsersPagination({
                    currentPage: data.pagination?.page || 1,
                    totalPages: data.pagination?.pages || 1,
                    totalUsers: data.pagination?.total || 0,
                    hasMore: (data.pagination?.page || 1) < (data.pagination?.pages || 1)
                });
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to fetch users';
                setError(errorMsg);
                console.error('Get users error:', err);
                if (!append) setUsers([]);
            } finally {
                setUsersLoading(false);
                setUsersAppending(false);
                usersLoadingRef.current = false;
            }
        },
        [get, isAdmin]
    );

    const getUserById = useCallback(
        async (userId: string) => {
            if (!isAdmin) return;

            try {
                setIsLoading(true);
                setError(null);
                const res = await get(`/admin/users/${userId}`);
                setCurrentUser(res.data.data);
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to fetch user';
                setError(errorMsg);
                console.error('Get user error:', err);
            } finally {
                setIsLoading(false);
            }
        },
        [get, isAdmin]
    );

    const requestPromotion = useCallback(
        async () => {
            if (!isAdmin) return;
            try {
                setIsLoading(true);
                setError(null);
                const res = await post('/admin/request-promotion');
                toast.success(res.data.message);
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to request promotion';
                setError(errorMsg);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [post, isAdmin]
    );

    const verifyPromotion = useCallback(
        async (targetUserId: string, otp: string) => {
            if (!isAdmin) return;
            try {
                setIsLoading(true);
                setError(null);
                const res = await post('/admin/verify-promotion', { targetUserId, otp });

                // Optimistic update
                setUsers(prev => prev.map(user =>
                    (user._id === targetUserId || user.id === targetUserId)
                        ? { ...user, role: 'admin' }
                        : user
                ));
                toast.success(res.data.message);
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to verify promotion';
                setError(errorMsg);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [post, isAdmin]
    );

    const toggleUserActive = useCallback(
        async (userId: string) => {
            if (!isAdmin) return;

            try {
                setIsLoading(true);
                setError(null);

                const res = await put(`/admin/users/${userId}/toggle-active`, {});
                // Update with server response
                const updatedUser = res.data.data;
                setUsers((prev) =>
                    prev.map((user) =>
                        user._id === userId || user.id === userId ? updatedUser : user
                    )
                );

                if (currentUser && (currentUser._id === userId || currentUser.id === userId)) {
                    setCurrentUser(updatedUser);
                }
                toast.success(res.data.message);
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to toggle user status';
                setError(errorMsg);
                console.error('Toggle user active error:', err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [put, isAdmin, currentUser]
    );

    const deleteUser = useCallback(
        async (userId: string) => {
            if (!isAdmin) return;

            try {
                setIsLoading(true);
                setError(null);

                const res = await apiDelete(`/admin/users/${userId}`);

                // Remove from local state
                setUsers((prev) => prev.filter((user) => user._id !== userId && user.id !== userId));

                if (currentUser && (currentUser._id === userId || currentUser.id === userId)) {
                    setCurrentUser(null);
                }
                toast.success(res.data.message);
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || 'Failed to delete user';
                setError(errorMsg);
                console.error('Delete user error:', err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [apiDelete, isAdmin, currentUser]
    );

    const value: AdminContextType = {
        // Dashboard
        dashboardStats,
        salesAnalytics,
        getDashboardStats,
        getSalesAnalytics,

        // Orders
        orders,
        currentOrder,
        ordersLoading,
        ordersAppending,
        ordersPagination,
        getAllOrders,
        getOrderById,
        updateOrderStatus,
        updatePaymentStatus,
        deleteOrder,

        // Users
        users,
        currentUser,
        usersLoading,
        usersAppending,
        usersPagination,
        getAllUsers,
        getUserById,
        requestPromotion,
        verifyPromotion,
        toggleUserActive,
        deleteUser,

        // Global
        isLoading,
        statsLoading,
        error,
    };

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

// ----------------------
// Hook
// ----------------------

export const useAdmin = (): AdminContextType => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used inside AdminProvider');
    }
    return context;
};
