import { useEffect, useState, useCallback, useRef } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, UserCheck, UserX, ShieldCheck, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

const AdminUsers = () => {
    const {
        users,
        getAllUsers,
        requestPromotion,
        verifyPromotion,
        toggleUserActive,
        deleteUser,
        usersLoading,
        usersAppending,
        usersPagination,
    } = useAdmin();
    const { toast } = useToast();

    const [filters, setFilters] = useState({
        role: '',
        search: '',
    });

    const [isOtpOpen, setIsOtpOpen] = useState(false);
    const [otp, setOtp] = useState('');
    const [targetUserId, setTargetUserId] = useState<string | null>(null);
    const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);

    const observer = useRef<IntersectionObserver>();

    const handleLoadMore = useCallback(() => {
        if (usersPagination.hasMore && !usersLoading && !usersAppending) {
            getAllUsers(usersPagination.currentPage + 1, 10, filters, true);
        }
    }, [usersPagination.hasMore, usersPagination.currentPage, usersLoading, usersAppending, filters, getAllUsers]);

    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (usersLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && usersPagination.hasMore) {
                handleLoadMore();
            }
        }, { threshold: 1.0 });
        if (node) observer.current.observe(node);
    }, [usersLoading, usersPagination.hasMore, handleLoadMore]);

    useEffect(() => {
        if (users.length === 0) {
            getAllUsers(1, 10, filters);
        }
    }, [getAllUsers, users.length, filters]);

    const handleSearch = (search: string) => {
        const newFilters = { ...filters, search };
        setFilters(newFilters);
        getAllUsers(1, 10, newFilters);
    };

    const handleRoleFilter = (role: string) => {
        const newFilters = { ...filters, role };
        setFilters(newFilters);
        getAllUsers(1, 10, newFilters);
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (newRole === 'admin') {
            try {
                setTargetUserId(userId);
                await requestPromotion();
                setIsOtpOpen(true);
            } catch (error: any) {
                toast({ title: error.response?.data?.message || 'Failed to send promotion OTP', variant: 'destructive' });
            }
        } else {
            toast({ title: 'Standard role changes are disabled. Use 2FA system for Admin promotion.', variant: 'default' });
        }
    };

    const handleVerifyPromotion = async () => {
        if (!targetUserId || !otp) return;

        try {
            setIsSubmittingOtp(true);
            await verifyPromotion(targetUserId, otp);
            setIsOtpOpen(false);
            setOtp('');
            setTargetUserId(null);
        } catch (error: any) {
            toast({ title: error.response?.data?.message || 'Promotion failed', variant: 'destructive' });
        } finally {
            setIsSubmittingOtp(false);
        }
    };

    const handleToggleActive = async (userId: string) => {
        try {
            await toggleUserActive(userId);
        } catch (error: any) {
            toast({ title: error.response?.data?.message || 'Failed to update user status', variant: 'destructive' });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteUser(userId);
        } catch (error: any) {
            toast({ title: error.response?.data?.message || 'Failed to delete user', variant: 'destructive' });
        }
    };

    if (usersLoading && users.length === 0) {
        return <div className="text-center py-8 text-muted-foreground animate-pulse">Loading users...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                    User Management ({usersPagination.totalUsers})
                </h2>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            value={filters.search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 rounded-xl"
                        />
                    </div>
                    <select
                        className="bg-secondary px-4 py-2 rounded-xl text-sm border-none focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer min-w-[150px]"
                        value={filters.role}
                        onChange={(e) => handleRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>

            {/* Content Listing - Card-based for better mobile responsiveness and infinite scroll */}
            <div className="space-y-4 pb-10">
                {users.length === 0 && !usersLoading ? (
                    <div className="text-center py-20 bg-secondary/30 rounded-2xl border-2 border-dashed border-border">
                        <p className="text-muted-foreground">No users found.</p>
                    </div>
                ) : (
                    <>
                        {users.map((user) => (
                            <div key={user._id} className="bg-card rounded-2xl p-5 border border-border hover:shadow-md transition-all group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                            {user.role === 'admin' ? <ShieldCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{user.name}</h3>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleActive(user._id)}
                                            className={`p-2 rounded-xl transition-all ${user.isActive
                                                ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                                            title={user.isActive ? "Deactivate User" : "Activate User"}
                                        >
                                            {user.isActive ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="p-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
                                    <div className="text-xs text-muted-foreground">
                                        Joined: <span className="text-foreground font-medium">{formatDate(user.createdAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                                            {user.role}
                                        </span>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            className="text-xs bg-secondary/80 border-none rounded-lg px-2 py-1 focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                                        >
                                            <option value="user">Set User</option>
                                            <option value="admin">Set Admin</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Infinite Scroll Trigger */}
                        <div ref={lastElementRef} className="h-32 flex flex-col items-center justify-center gap-4">
                            {usersAppending && (
                                <>
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest animate-pulse">Scanning database...</span>
                                </>
                            )}
                            {!usersPagination.hasMore && users.length > 0 && (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="h-px w-16 bg-border"></div>
                                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">End of Archive</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
                {/* OTP Verification Dialog */}
                <Dialog open={isOtpOpen} onOpenChange={setIsOtpOpen}>
                    <DialogContent className="sm:max-w-md bg-card border-border">
                        <DialogHeader>
                            <DialogTitle>Verify Promotion</DialogTitle>
                            <DialogDescription>
                                Enter the 6-digit OTP sent to your admin email to promote this user.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Input
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                className="text-center text-2xl tracking-[0.5em] font-mono"
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsOtpOpen(false)}
                                disabled={isSubmittingOtp}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleVerifyPromotion}
                                disabled={isSubmittingOtp || otp.length < 4}
                            >
                                {isSubmittingOtp ? 'Verifying...' : 'Verify & Promote'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default AdminUsers;
