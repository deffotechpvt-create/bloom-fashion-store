// components/admin/AdminTabs.tsx
interface AdminTabsProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const AdminTabs = ({ activeTab, setActiveTab }: AdminTabsProps) => {
    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'products', label: 'Products' },
        { id: 'orders', label: 'Orders' },
        { id: 'users', label: 'Users' },
    ];

    return (
        <div className="flex gap-2 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-accent'
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default AdminTabs;
