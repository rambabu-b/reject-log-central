import React, { useEffect ,useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from './Navigation';
import ProductManagement from './ProductManagement';
import LogEntryManagement from './LogEntryManagement';
import SearchLogs from './SearchLogs';
import UserManagement from './UserManagement';
import AuditTrail from './AuditTrail';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>(null); // Start as null

  // Set initial active tab based on user role
  useEffect(() => {
    if (user) {
      setActiveTab(user.role === 'admin' ? 'products' : 'logs');
    }
  }, [user]);

  const renderContent = () => {
    if (user?.role === 'admin') {
      // Admin can only access Products and Users
      switch (activeTab) {
        case 'products':
          return <ProductManagement />;
        case 'users':
          return <UserManagement />;
        default:
          return <ProductManagement />;
      }
    }
    // Other roles: show all tabs
    switch (activeTab) {
      case 'logs':
        return <LogEntryManagement />;
      case 'search':
        return <SearchLogs />;
      case 'users':
        return <UserManagement />;
      case 'audit':
        return <AuditTrail />;
      default:
        return <LogEntryManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-0 sm:px-4 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;