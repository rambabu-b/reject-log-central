import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, User, FileText, CheckCircle, XCircle, RotateCcw, Edit } from 'lucide-react';
import { AuditLog } from '@/types';

interface AuditTrailProps {
  logEntryId?: string;
}

const AuditTrail = ({ logEntryId }: AuditTrailProps) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('auditLogs');
    if (stored) {
      const logs = JSON.parse(stored);
      setAuditLogs(logs);
      
      // Filter by logEntryId if provided
      const filtered = logEntryId 
        ? logs.filter((log: AuditLog) => log.logEntryId === logEntryId)
        : logs;
      setFilteredLogs(filtered);
    }
  }, [logEntryId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = auditLogs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLogs(logEntryId 
        ? filtered.filter(log => log.logEntryId === logEntryId)
        : filtered
      );
    } else {
      setFilteredLogs(logEntryId 
        ? auditLogs.filter(log => log.logEntryId === logEntryId)
        : auditLogs
      );
    }
  }, [searchTerm, auditLogs, logEntryId]);

  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'UPDATE':
        return <Edit className="w-4 h-4 text-orange-500" />;
      case 'APPROVE':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECT':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'REOPEN':
        return <RotateCcw className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    const actionConfig = {
      CREATE: { variant: 'default' as const, label: 'Created' },
      UPDATE: { variant: 'secondary' as const, label: 'Updated' },
      APPROVE: { variant: 'default' as const, label: 'Approved' },
      REJECT: { variant: 'destructive' as const, label: 'Rejected' },
      REOPEN: { variant: 'outline' as const, label: 'Reopened' },
    };

    const config = actionConfig[action.toUpperCase() as keyof typeof actionConfig] || actionConfig.UPDATE;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {getActionIcon(action)}
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      production_pending: { variant: 'destructive' as const, label: 'Production Pending' },
      stores_pending: { variant: 'destructive' as const, label: 'Stores Pending' },
      qa_pending: { variant: 'destructive' as const, label: 'QA Pending' },
      approved: { variant: 'default' as const, label: 'Approved' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
      reopened: { variant: 'outline' as const, label: 'Reopened' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Audit Trail {logEntryId && '- Entry Specific'}
        </CardTitle>
        {!logEntryId && (
          <div className="w-full max-w-sm">
            <Label htmlFor="search">Search Audit Logs</Label>
            <Input
              id="search"
              placeholder="Search by action, user, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No audit logs found</h3>
            <p>No audit trail entries match your criteria.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs
                .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
                .map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {new Date(log.performedAt).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500">
                        {new Date(log.performedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getActionBadge(log.action)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{log.performedBy}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-md">
                      {log.details}
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.previousStatus && log.newStatus && (
                      <div className="flex items-center gap-2">
                        {getStatusBadge(log.previousStatus)}
                        <span className="text-gray-400">→</span>
                        {getStatusBadge(log.newStatus)}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditTrail;