import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, Package, FileText, Search, Users, Clock, Menu, X } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getAvailableTabs = () => {
    const baseTabs = [
      { id: 'logs', label: 'Log Entries', icon: FileText },
      { id: 'search', label: 'Search Logs', icon: Search },
    ];

    if (user?.role === 'admin' || user?.role === 'hod') {
      baseTabs.unshift({ id: 'products', label: 'Products', icon: Package });
      baseTabs.push({ id: 'audit', label: 'Audit Trail', icon: Clock });
    }

    if (user?.role === 'admin') {
      baseTabs.push({ id: 'users', label: 'Users', icon: Users });
    }

    return baseTabs;
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const tabs = getAvailableTabs();

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              🏭 <span className="hidden sm:inline">Rejection Log Central</span>
              <span className="sm:hidden">RLC</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* User Info - Hidden on mobile */}
            <div className="hidden sm:block text-sm text-gray-600">
              <div className="font-medium truncate max-w-32 lg:max-w-none">{user?.name}</div>
              <div className="text-xs text-gray-500 capitalize truncate">
                {user?.role} • {user?.department}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  {/* Mobile User Info */}
                  <div className="border-b pb-4 mb-4">
                    <div className="font-medium text-lg">{user?.name}</div>
                    <div className="text-sm text-gray-500 capitalize">
                      {user?.role} • {user?.department}
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex-1 space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabClick(tab.id)}
                          className={`w-full flex items-center px-4 py-3 text-left rounded-md transition-colors ${
                            activeTab === tab.id
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Mobile Logout */}
                  <div className="border-t pt-4">
                    <Button
                      variant="outline"
                      onClick={logout}
                      className="w-full flex items-center justify-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop Logout */}
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="hidden md:flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;