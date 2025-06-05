
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { LogEntry } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import CreateLogEntry from './CreateLogEntry';
import LogEntryList from './LogEntryList';
import LogEntryDetails from './LogEntryDetails';

const LogEntryManagement = () => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);
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
    saveLogEntries([...logEntries, entry]);
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

  const getFilteredEntries = () => {
    if (user?.role === 'admin' || user?.role === 'hod') {
      return logEntries;
    }
    
    if (user?.role === 'qa') {
      return logEntries.filter(entry => 
        entry.status === 'qa_pending' || entry.status === 'completed'
      );
    }
    
    if (user?.role === 'production') {
      return logEntries.filter(entry => 
        entry.createdBy === user.id || entry.assignedProductionUser === user.id
      );
    }
    
    if (user?.role === 'stores') {
      return logEntries.filter(entry => 
        entry.assignedStoresUser === user.id
      );
    }
    
    return logEntries;
  };

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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Log Entries</CardTitle>
          {canCreateNewEntry() && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Log Entry
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <LogEntryList
            entries={getFilteredEntries()}
            onSelectEntry={setSelectedEntry}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default LogEntryManagement;
