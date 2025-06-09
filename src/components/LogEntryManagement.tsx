import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, CheckCircle, XCircle, AlertTriangle, TrendingUp, Users, FileText } from 'lucide-react';
import { LogEntry } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import CreateLogEntry from './CreateLogEntry';
import LogEntryList from './LogEntryList';
import LogEntryDetails from './LogEntryDetails';

const LogEntryManagement = () => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem('logEntries');
    if (stored) {
      setLogEntries(JSON.parse(stored));
    }
  }, []);

  const saveLogEntries = (newLogEntries: LogEntry[]) => {
    setLogEntries(newLogEntries);
    localStorage.setItem('logEntries', JSON.stringify(newLogEntries));
  };

  const handleCreateEntry = (entry: LogEntry) => {
    const newEntry = {
      ...entry,
      createdAt: new Date().toISOString(),
    };
    saveLogEntries([...logEntries, newEntry]);
    setShowCreateForm(false);
  };

  const handleUpdateEntry = (updatedEntry: LogEntry) => {
    const updatedEntries = logEntries.map(entry =>
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    saveLogEntries(updatedEntries);
    setSelectedEntry(updatedEntry);
  };

  const canCreateNewEntry = () => {
    return user?.role === 'production' || user?.role === 'hod' || user?.role === 'admin';
  };

  const getFilteredEntries = (filter: string) => {
    let filtered = logEntries;

    // Role-based filtering
    if (user?.role === 'production') {
      filtered = filtered.filter(entry => 
        entry.createdBy === user.id || entry.assignedProductionUser === user.id
      );
    } else if (user?.role === 'stores') {
      filtered = filtered.filter(entry => 
        entry.assignedStoresUser === user.id || entry.status === 'stores_pending'
      );
    } else if (user?.role === 'qa') {
      filtered = filtered.filter(entry => 
        entry.status === 'qa_pending' || entry.status === 'approved' || entry.status === 'rejected'
      );
    }

    // Status-based filtering
    switch (filter) {
      case 'pending':
        return filtered.filter(entry => 
          entry.status === 'production_pending' || 
          entry.status === 'stores_pending' || 
          entry.status === 'qa_pending'
        );
      case 'approved':
        return filtered.filter(entry => entry.status === 'approved');
      case 'rejected':
        return filtered.filter(entry => entry.status === 'rejected');
      case 'variations':
        return filtered.filter(entry => entry.hasVariations);
      case 'my-tasks':
        if (user?.role === 'production') {
          return filtered.filter(entry => 
            entry.assignedProductionUser === user.id && entry.status === 'production_pending'
          );
        } else if (user?.role === 'stores') {
          return filtered.filter(entry => 
            entry.assignedStoresUser === user.id && entry.status === 'stores_pending'
          );
        } else if (user?.role === 'qa') {
          return filtered.filter(entry => entry.status === 'qa_pending');
        }
        return filtered;
      default:
        return filtered;
    }
  };

  const getStatusCounts = () => {
    const filtered = getFilteredEntries('all');
    return {
      total: filtered.length,
      pending: filtered.filter(e => 
        e.status === 'production_pending' || 
        e.status === 'stores_pending' || 
        e.status === 'qa_pending'
      ).length,
      approved: filtered.filter(e => e.status === 'approved').length,
      rejected: filtered.filter(e => e.status === 'rejected').length,
      variations: filtered.filter(e => e.hasVariations).length,
      myTasks: (() => {
        if (user?.role === 'production') {
          return filtered.filter(e => 
            e.assignedProductionUser === user.id && e.status === 'production_pending'
          ).length;
        } else if (user?.role === 'stores') {
          return filtered.filter(e => 
            e.assignedStoresUser === user.id && e.status === 'stores_pending'
          ).length;
        } else if (user?.role === 'qa') {
          return filtered.filter(e => e.status === 'qa_pending').length;
        }
        return 0;
      })(),
    };
  };

  const counts = getStatusCounts();

  // Get role-specific insights
  const getRoleInsights = () => {
    const filtered = getFilteredEntries('all');
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = filtered.filter(e => e.date === today);
    
    return {
      todayEntries: todayEntries.length,
      urgentTasks: filtered.filter(e => {
        const daysSinceCreation = Math.floor((new Date().getTime() - new Date(e.createdAt || e.date).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceCreation > 3 && (e.status === 'production_pending' || e.status === 'stores_pending' || e.status === 'qa_pending');
      }).length,
      completionRate: filtered.length > 0 ? Math.round((filtered.filter(e => e.status === 'approved').length / filtered.length) * 100) : 0,
    };
  };

  const insights = getRoleInsights();

  if (selectedEntry) {
    return (
      <LogEntryDetails
        entry={selectedEntry}
        onBack={() => setSelectedEntry(null)}
        onUpdate={handleUpdateEntry}
      />
    );
  }

  if (showCreateForm) {
    return (
      <CreateLogEntry
        onCancel={() => setShowCreateForm(false)}
        onCreate={handleCreateEntry}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold">{counts.total}</p>
                <p className="text-xs text-gray-500">Today: {insights.todayEntries}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">{counts.pending}</p>
                <p className="text-xs text-red-500">Urgent: {insights.urgentTasks}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{counts.approved}</p>
                <p className="text-xs text-green-600">{insights.completionRate}% rate</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Tasks</p>
                <p className="text-2xl font-bold text-purple-600">{counts.myTasks}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role} queue</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Variations</p>
                <p className="text-2xl font-bold text-yellow-600">{counts.variations}</p>
                <p className="text-xs text-yellow-600">Need QA review</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            📋 Rejection Log Entries
            <Badge variant="outline" className="ml-2">
              {user?.role?.toUpperCase()} View
            </Badge>
          </CardTitle>
          {canCreateNewEntry() && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Entry
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All
                <Badge variant="secondary">{counts.total}</Badge>
              </TabsTrigger>
              <TabsTrigger value="my-tasks" className="flex items-center gap-2">
                My Tasks
                <Badge variant="destructive">{counts.myTasks}</Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                Pending
                <Badge variant="destructive">{counts.pending}</Badge>
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center gap-2">
                Approved
                <Badge variant="default">{counts.approved}</Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center gap-2">
                Rejected
                <Badge variant="destructive">{counts.rejected}</Badge>
              </TabsTrigger>
              <TabsTrigger value="variations" className="flex items-center gap-2">
                Variations
                <Badge variant="outline">{counts.variations}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <LogEntryList
                entries={getFilteredEntries('all')}
                onSelectEntry={setSelectedEntry}
              />
            </TabsContent>

            <TabsContent value="my-tasks" className="mt-6">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">
                  📋 Your {user?.role?.toUpperCase()} Tasks
                </h4>
                <p className="text-sm text-blue-700">
                  {user?.role === 'production' && 'Complete production data entry for assigned rejection logs.'}
                  {user?.role === 'stores' && 'Record destruction details and identify any variations.'}
                  {user?.role === 'qa' && 'Review and provide final sign-off for completed rejection logs.'}
                  {(user?.role === 'hod' || user?.role === 'admin') && 'Oversee all rejection log activities and reopen entries as needed.'}
                </p>
              </div>
              <LogEntryList
                entries={getFilteredEntries('my-tasks')}
                onSelectEntry={setSelectedEntry}
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <LogEntryList
                entries={getFilteredEntries('pending')}
                onSelectEntry={setSelectedEntry}
              />
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              <LogEntryList
                entries={getFilteredEntries('approved')}
                onSelectEntry={setSelectedEntry}
              />
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              <LogEntryList
                entries={getFilteredEntries('rejected')}
                onSelectEntry={setSelectedEntry}
              />
            </TabsContent>

            <TabsContent value="variations" className="mt-6">
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">
                  ⚠️ Entries with Variations
                </h4>
                <p className="text-sm text-yellow-700">
                  These entries have variations identified by the stores team that require QA approval and sign-off.
                </p>
              </div>
              <LogEntryList
                entries={getFilteredEntries('variations')}
                onSelectEntry={setSelectedEntry}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogEntryManagement;