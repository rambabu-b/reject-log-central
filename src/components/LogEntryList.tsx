import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CheckCircle, XCircle, RotateCcw, AlertTriangle, Clock } from 'lucide-react';
import { LogEntry } from '@/types';
import { useAuth, getStaticUsers } from '@/contexts/AuthContext';

interface LogEntryListProps {
  entries: LogEntry[];
  onSelectEntry: (entry: LogEntry) => void;
}

const LogEntryList = ({ entries, onSelectEntry }: LogEntryListProps) => {
  const { user } = useAuth();
  const staticUsers = getStaticUsers();

  const getStatusBadge = (status: string, hasVariations?: boolean) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: null },
      production_pending: { variant: 'destructive' as const, label: 'Production Pending', icon: Clock },
      stores_pending: { variant: 'destructive' as const, label: 'Stores Pending', icon: Clock },
      qa_pending: { variant: 'destructive' as const, label: 'QA Review Pending', icon: Clock },
      approved: { variant: 'default' as const, label: 'Approved', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, label: 'Rejected', icon: XCircle },
      reopened: { variant: 'secondary' as const, label: 'Reopened', icon: RotateCcw },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
        <Badge variant={config.variant} className="flex items-center gap-1 text-xs">
          {Icon && <Icon className="w-3 h-3" />}
          <span className="hidden sm:inline">{config.label}</span>
          <span className="sm:hidden">
            {status === 'production_pending' && 'Prod'}
            {status === 'stores_pending' && 'Store'}
            {status === 'qa_pending' && 'QA'}
            {status === 'approved' && '✓'}
            {status === 'rejected' && '✗'}
            {status === 'reopened' && '↻'}
            {status === 'draft' && 'Draft'}
          </span>
        </Badge>
        {hasVariations && (
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <AlertTriangle className="w-3 h-3" />
            <span className="hidden sm:inline">Variations</span>
            <span className="sm:hidden">⚠️</span>
          </Badge>
        )}
      </div>
    );
  };

  const getPriorityLevel = (entry: LogEntry) => {
    const daysSinceCreation = Math.floor((new Date().getTime() - new Date(entry.createdAt || entry.date).getTime()) / (1000 * 60 * 60 * 24));
    
    if (entry.hasVariations) return 'high';
    if (daysSinceCreation > 3) return 'medium';
    return 'normal';
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { variant: 'destructive' as const, label: 'High Priority' },
      medium: { variant: 'secondary' as const, label: 'Medium Priority' },
      normal: { variant: 'outline' as const, label: 'Normal' },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    
    if (priority === 'normal') return null;
    
    return (
      <Badge variant={config.variant} className="text-xs">
        <span className="hidden sm:inline">{config.label}</span>
        <span className="sm:hidden">
          {priority === 'high' && '🔴'}
          {priority === 'medium' && '🟡'}
        </span>
      </Badge>
    );
  };

  const getAssignedUser = (entry: LogEntry) => {
    if (entry.status === 'production_pending' && entry.assignedProductionUser) {
      const assignedUser = staticUsers.find(u => u.id === entry.assignedProductionUser);
      return assignedUser?.name || 'Unknown';
    }
    if (entry.status === 'stores_pending' && entry.assignedStoresUser) {
      const assignedUser = staticUsers.find(u => u.id === entry.assignedStoresUser);
      return assignedUser?.name || 'Unknown';
    }
    if (entry.status === 'qa_pending') {
      return 'QA Team';
    }
    return '-';
  };

  const canViewEntry = (entry: LogEntry) => {
    if (user?.role === 'admin' || user?.role === 'hod') return true;
    
    // Production users can see entries assigned to them or created by them
    if (user?.role === 'production') {
      return entry.createdBy === user.id || entry.assignedProductionUser === user.id;
    }
    
    // Stores users can see entries assigned to them
    if (user?.role === 'stores') {
      return entry.assignedStoresUser === user.id || entry.status === 'stores_pending';
    }
    
    // QA users can see entries in QA review or completed
    if (user?.role === 'qa') {
      return entry.status === 'qa_pending' || entry.status === 'approved' || entry.status === 'rejected';
    }
    
    return true;
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 mx-4 sm:mx-0">
        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No rejection log entries found</h3>
        <p className="text-sm sm:text-base">Create a new entry to get started with the rejection log system.</p>
      </div>
    );
  }

  const filteredEntries = entries.filter(canViewEntry);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 px-4 sm:px-0">
        Showing {filteredEntries.length} of {entries.length} entries
      </div>
      
      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3 px-4">
        {filteredEntries.map((entry) => {
          const priority = getPriorityLevel(entry);
          const createdByUser = staticUsers.find(u => u.id === entry.createdBy);
          
          return (
            <div 
              key={entry.id} 
              className={`border rounded-lg p-4 space-y-3 ${priority === 'high' ? 'bg-red-50 border-red-200' : 'bg-white'}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="font-medium text-sm">{entry.productName}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(entry.date).toLocaleDateString()} • {entry.batchNo} • {entry.lineNo}
                  </div>
                </div>
                {getPriorityBadge(priority)}
              </div>
              
              <div className="space-y-2">
                {getStatusBadge(entry.status, entry.hasVariations)}
                
                <div className="text-xs text-gray-600">
                  <div>Assigned: {getAssignedUser(entry)}</div>
                  <div>Created by: {createdByUser?.name || 'Unknown'} ({entry.createdByRole})</div>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectEntry(entry)}
                className="w-full flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Details
              </Button>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[100px]">Date</TableHead>
              <TableHead className="min-w-[200px]">Product</TableHead>
              <TableHead className="min-w-[120px]">Batch No</TableHead>
              <TableHead className="min-w-[100px]">Line No</TableHead>
              <TableHead className="min-w-[150px]">Status</TableHead>
              <TableHead className="min-w-[150px]">Assigned To</TableHead>
              <TableHead className="min-w-[100px]">Priority</TableHead>
              <TableHead className="min-w-[150px]">Created By</TableHead>
              <TableHead className="min-w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => {
              const priority = getPriorityLevel(entry);
              const createdByUser = staticUsers.find(u => u.id === entry.createdBy);
              
              return (
                <TableRow key={entry.id} className={priority === 'high' ? 'bg-red-50' : ''}>
                  <TableCell className="text-sm">{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium text-sm">{entry.productName}</TableCell>
                  <TableCell className="text-sm">{entry.batchNo}</TableCell>
                  <TableCell className="text-sm">{entry.lineNo}</TableCell>
                  <TableCell>{getStatusBadge(entry.status, entry.hasVariations)}</TableCell>
                  <TableCell className="text-sm">{getAssignedUser(entry)}</TableCell>
                  <TableCell>{getPriorityBadge(priority)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{createdByUser?.name || 'Unknown'}</div>
                      <div className="text-gray-500 capitalize text-xs">{entry.createdByRole}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelectEntry(entry)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden lg:inline">View Details</span>
                      <span className="lg:hidden">View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default LogEntryList;