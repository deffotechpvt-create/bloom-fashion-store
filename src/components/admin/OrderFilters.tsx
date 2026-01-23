// components/admin/OrderFilters.tsx
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface OrderFiltersProps {
    filters: {
        status: string;
        paymentStatus: string;
        search: string;
    };
    onChange: (filters: any) => void;
}

const OrderFilters = ({ filters, onChange }: OrderFiltersProps) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search by order ID or customer..."
                    value={filters.search}
                    onChange={(e) => onChange({ ...filters, search: e.target.value })}
                    className="pl-10"
                />
            </div>

            <select
                value={filters.status}
                onChange={(e) => onChange({ ...filters, status: e.target.value })}
                className="px-4 py-2 rounded-md border border-input bg-background"
            >
                <option value="">All Order Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
            </select>

            <select
                value={filters.paymentStatus}
                onChange={(e) => onChange({ ...filters, paymentStatus: e.target.value })}
                className="px-4 py-2 rounded-md border border-input bg-background"
            >
                <option value="">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
            </select>
        </div>
    );
};

export default OrderFilters;
