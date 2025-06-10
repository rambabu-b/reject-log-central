import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from './Navigation';
import ProductManagement from './ProductManagement';
import LogEntryManagement from './LogEntryManagement';
import SearchLogs from './SearchLogs';
import UserManagement from './UserManagement';
import AuditTrail from './AuditTrail';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('logs');
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductManagement />;
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