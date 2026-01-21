// pages/Admin.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdmin } from '@/context/AdminContext';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminStats from '@/components/admin/AdminStats';
import AdminTabs from '@/components/admin/AdminTabs';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminUsers from '@/components/admin/AdminUsers';

const Admin = () => {
  const { isAdmin } = useAuth();
  const { getDashboardStats, dashboardStats } = useAdmin();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (isAdmin && !dashboardStats) {
      getDashboardStats();
    }
  }, [isAdmin, getDashboardStats, dashboardStats]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access this page.
            </p>
            <Link to="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="w-full px-4 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Back Button */}
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Link>

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">Manage your store</p>
              </div>
            </div>

            {/* Stats Grid */}
            <AdminStats />

            {/* Tabs */}
            <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Tab Content */}
            <div className="bg-card rounded-2xl p-6 border border-border min-h-[400px]">
              <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
                <AdminOverview />
              </div>
              <div className={activeTab === 'products' ? 'block' : 'hidden'}>
                <AdminProducts />
              </div>
              <div className={activeTab === 'orders' ? 'block' : 'hidden'}>
                <AdminOrders />
              </div>
              <div className={activeTab === 'users' ? 'block' : 'hidden'}>
                <AdminUsers />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
