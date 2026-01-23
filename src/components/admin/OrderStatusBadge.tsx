// components/admin/OrderStatusBadge.tsx
interface OrderStatusBadgeProps {
    status: string;
    type: 'order' | 'payment';
}

const OrderStatusBadge = ({ status, type }: OrderStatusBadgeProps) => {
    const getStatusColor = () => {
        if (type === 'order') {
            switch (status) {
                case 'delivered':
                    return 'bg-green-500/20 text-green-500';
                case 'shipped':
                    return 'bg-blue-500/20 text-blue-500';
                case 'processing':
                    return 'bg-yellow-500/20 text-yellow-500';
                case 'cancelled':
                    return 'bg-red-500/20 text-red-500';
                default:
                    return 'bg-muted text-muted-foreground';
            }
        } else {
            switch (status) {
                case 'paid':
                    return 'bg-green-500/20 text-green-500';
                case 'pending':
                    return 'bg-yellow-500/20 text-yellow-500';
                case 'failed':
                    return 'bg-red-500/20 text-red-500';
                case 'refunded':
                    return 'bg-purple-500/20 text-purple-500';
                default:
                    return 'bg-muted text-muted-foreground';
            }
        }
    };

    return (
        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor()}`}>
            {status}
        </span>
    );
};

export default OrderStatusBadge;
