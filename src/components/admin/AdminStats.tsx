import { Package, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import { useProducts } from '@/context/ProductsContext';

const AdminStats = () => {
    const { dashboardStats, statsLoading: isLoading } = useAdmin();
    const { products } = useProducts();

    const stats = [
        {
            label: 'Total Revenue',
            value: `₹${dashboardStats?.overview?.totalRevenue?.toLocaleString('en-IN') || '0.00'}`,
            icon: DollarSign,
            color: 'text-green-500',
            change: dashboardStats?.revenueGrowth
        },
        {
            label: 'Total Orders',
            value: dashboardStats?.overview?.totalOrders || 0,
            icon: ShoppingCart,
            color: 'text-blue-500',
            change: dashboardStats?.ordersGrowth
        },
        {
            label: 'Total Products',
            value: dashboardStats?.overview?.totalProducts || products.length,
            icon: Package,
            color: 'text-purple-500',
        },
        {
            label: 'Total Users',
            value: dashboardStats?.overview?.totalUsers || 0,
            icon: Users,
            color: 'text-orange-500',
            change: dashboardStats?.usersGrowth
        },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-card rounded-2xl p-6 border border-border animate-pulse">
                        <div className="h-20 bg-secondary rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-card rounded-2xl p-6 border border-border">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-secondary ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-2xl font-semibold">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            {stat.change !== undefined && (
                                <p className={`text-xs mt-1 ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {stat.change >= 0 ? '+' : ''}{stat.change}% from last month
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminStats;
