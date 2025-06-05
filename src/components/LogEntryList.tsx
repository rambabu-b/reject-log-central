
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { LogEntry } from '@/types';

interface LogEntryListProps {
  entries: LogEntry[];
  onSelectEntry: (entry: LogEntry) => void;
}

const LogEntryList = ({ entries, onSelectEntry }: LogEntryListProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      production_pending: { variant: 'destructive' as const, label: 'Production Pending' },
      stores_pending: { variant: 'destructive' as const, label: 'Stores Pending' },
      qa_pending: { variant: 'destructive' as const, label: 'QA Pending' },
      completed: { variant: 'default' as const, label: 'Completed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No log entries found.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Batch No</TableHead>
          <TableHead>Line No</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
            <TableCell>{entry.productName}</TableCell>
            <TableCell>{entry.batchNo}</TableCell>
            <TableCell>{entry.lineNo}</TableCell>
            <TableCell>{getStatusBadge(entry.status)}</TableCell>
            <TableCell>{entry.createdByRole}</TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectEntry(entry)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default LogEntryList;
