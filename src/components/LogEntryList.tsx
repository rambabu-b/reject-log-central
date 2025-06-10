import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertTriangle, FileText, User } from 'lucide-react';
import { LogEntry } from '@/types';
import { getStaticUsers } from '@/contexts/AuthContext';

interface LogEntryListProps {
  entries: LogEntry[];
  onSelectEntry: (entry: LogEntry) => void;
}

const LogEntryList = ({ entries, onSelectEntry }: LogEntryListProps) => {
  const staticUsers = getStaticUsers();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: FileText, className: '' },
      production_pending: { variant: 'destructive' as const, label: 'Production Pending', icon: Clock, className: '' },
      stores_pending: { variant: 'destructive' as const, label: 'Stores Pending', icon: Clock, className: '' },
      qa_pending: { variant: 'destructive' as const, label: 'QA Review Pending', icon: Clock, className: '' },
      approved: { variant: 'default' as const, label: 'Approved', icon: CheckCircle, className: 'bg-green-600 hover:bg-green-700 text-white' },
      rejected: { variant: 'destructive' as const, label: 'Rejected', icon: XCircle, className: '' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    // Handle special styling for approved status
    const badgeClassName = status === 'approved' 
      ? 'flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white border-green-600'
      : 'flex items-center gap-1 text-xs';
    
    return (
      <Badge variant={config.variant} className={badgeClassName}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getAssignedUserName = (userId: string | undefined, teamType: string) => {
    if (!userId) return `${teamType.charAt(0).toUpperCase() + teamType.slice(1)} Team`;
    const assignedUser = staticUsers.find(u => u.id === userId);
    return assignedUser ? assignedUser.name : `${teamType.charAt(0).toUpperCase() + teamType.slice(1)} Team`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">No entries found</p>
        <p className="text-sm">No rejection log entries match your current criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Card 
          key={entry.id} 
          className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
          onClick={() => onSelectEntry(entry)}
        >
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-sm sm:text-base truncate">
                    {entry.productName}
                  </h3>
                  {getStatusBadge(entry.status)}
                  {entry.hasVariations && (
                    <Badge variant="outline" className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                      <AlertTriangle className="w-3 h-3" />
                      Variations
                    </Badge>
                  )}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Date:</span> {formatDate(entry.date)}
                  </div>
                  <div>
                    <span className="font-medium">Batch:</span> {entry.batchNo}
                  </div>
                  <div>
                    <span className="font-medium">Line:</span> {entry.lineNo}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {formatDate(entry.createdAt || entry.date)}
                  </div>
                </div>
                
                {/* Assignment Info */}
                <div className="mt-2 flex flex-col sm:flex-row gap-2 text-xs">
                  {(entry.assignedProductionUser || entry.status !== 'draft') && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <User className="w-3 h-3" />
                      <span className="font-medium">Production:</span> {getAssignedUserName(entry.assignedProductionUser, 'production')}
                    </div>
                  )}
                  {(entry.assignedStoresUser || entry.status === 'stores_pending' || entry.status === 'qa_pending' || entry.status === 'approved' || entry.status === 'rejected') && (
                    <div className="flex items-center gap-1 text-purple-600">
                      <User className="w-3 h-3" />
                      <span className="font-medium">Stores:</span> {getAssignedUserName(entry.assignedStoresUser, 'stores')}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Progress Indicators */}
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${entry.productionConfirmed ? 'bg-green-500' : 'bg-gray-300'}`} title="Production" />
                <div className={`w-2 h-2 rounded-full ${entry.storesConfirmed ? 'bg-green-500' : 'bg-gray-300'}`} title="Stores" />
                <div className={`w-2 h-2 rounded-full ${entry.qaSignedOff ? 'bg-green-500' : 'bg-gray-300'}`} title="QA" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LogEntryList;
