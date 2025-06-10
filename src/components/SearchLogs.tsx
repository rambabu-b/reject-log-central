
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, X } from 'lucide-react';
import { LogEntry, Product } from '@/types';
import LogEntryList from './LogEntryList';
import LogEntryDetails from './LogEntryDetails';
import { useToast } from '@/hooks/use-toast';

const SearchLogs = () => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LogEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | null>(null);
  const [filters, setFilters] = useState({
    productName: '',
    batchNo: '',
    lineNo: '',
    dateFrom: '',
    dateTo: '',
    status: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    const storedLogs = localStorage.getItem('logEntries');
    const storedProducts = localStorage.getItem('products');
    
    if (storedLogs) {
      const logs = JSON.parse(storedLogs);
      setLogEntries(logs);
      setFilteredEntries(logs);
    }
    
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  }, []);

  const handleSearch = () => {
    let filtered = [...logEntries];

    // Improved search with better matching
    if (filters.productName.trim()) {
      const searchTerm = filters.productName.toLowerCase().trim();
      filtered = filtered.filter(entry =>
        entry.productName.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.batchNo.trim()) {
      const searchTerm = filters.batchNo.toLowerCase().trim();
      filtered = filtered.filter(entry =>
        entry.batchNo.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.lineNo.trim()) {
      const searchTerm = filters.lineNo.toLowerCase().trim();
      filtered = filtered.filter(entry =>
        entry.lineNo.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate <= toDate;
      });
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(entry => entry.status === filters.status);
    }

    setFilteredEntries(filtered);

    // Show search results message
    toast({
      title: "Search Complete",
      description: `Found ${filtered.length} matching entries`,
    });
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    // Check if there are results to export
    if (filteredEntries.length === 0) {
      toast({
        title: "No Data to Export",
        description: "No search results found. Please adjust your search criteria.",
        variant: "destructive",
      });
      return;
    }

    if (format === 'csv') {
      const csvHeaders = [
        'Date', 'Product Name', 'Batch No', 'Line No', 'Status', 
        'Poly Bag No', 'Gross Weight', 'Gross Weight Observed', 
        'Production Remarks', 'Stores Remarks', 'QA Remarks',
        'Created By', 'Production User', 'Destruction Done By', 'Destruction Verified By'
      ];
      
      const csvContent = [
        csvHeaders.join(','),
        ...filteredEntries.map(entry => [
          entry.date,
          `"${entry.productName}"`,
          entry.batchNo,
          entry.lineNo,
          entry.status,
          entry.polyBagNo || '',
          entry.grossWeight || '',
          entry.grossWeightObserved || '',
          `"${entry.productionRemarks || ''}"`,
          `"${entry.storesRemarks || ''}"`,
          `"${entry.qaRemarks || ''}"`,
          entry.createdByRole || '',
          entry.productionUser || '',
          entry.destructionDoneBy || '',
          entry.destructionVerifiedBy || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rejection_logs_${new Date().toISOString().split('T')[0]}_${filteredEntries.length}_entries.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${filteredEntries.length} entries to CSV file`,
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      productName: '',
      batchNo: '',
      lineNo: '',
      dateFrom: '',
      dateTo: '',
      status: '',
    });
    setFilteredEntries(logEntries);
    
    toast({
      title: "Filters Cleared",
      description: `Showing all ${logEntries.length} entries`,
    });
  };

  const handleUpdateEntry = (updatedEntry: LogEntry) => {
    const updatedEntries = logEntries.map(entry =>
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    setLogEntries(updatedEntries);
    localStorage.setItem('logEntries', JSON.stringify(updatedEntries));
    
    // Update filtered entries as well
    const updatedFiltered = filteredEntries.map(entry =>
      entry.id === updatedEntry.id ? updatedEntry : entry
    );
    setFilteredEntries(updatedFiltered);
    setSelectedEntry(updatedEntry);
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

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Search Log Entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={filters.productName}
                onChange={(e) => setFilters({ ...filters, productName: e.target.value })}
                placeholder="Search by product name"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="batchNo">Batch No</Label>
              <Input
                id="batchNo"
                value={filters.batchNo}
                onChange={(e) => setFilters({ ...filters, batchNo: e.target.value })}
                placeholder="Search by batch number"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lineNo">Line No</Label>
              <Input
                id="lineNo"
                value={filters.lineNo}
                onChange={(e) => setFilters({ ...filters, lineNo: e.target.value })}
                placeholder="Search by line number"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="production_pending">Production Pending</SelectItem>
                  <SelectItem value="stores_pending">Stores Pending</SelectItem>
                  <SelectItem value="qa_pending">QA Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="reopened">Reopened</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Button onClick={handleSearch} className="w-full sm:w-auto">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('csv')} 
              className="w-full sm:w-auto"
              disabled={filteredEntries.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV ({filteredEntries.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Search Results ({filteredEntries.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No entries found matching your search criteria.</p>
              <p className="text-sm mt-2">Try adjusting your filters or clearing them to see all entries.</p>
            </div>
          ) : (
            <LogEntryList
              entries={filteredEntries}
              onSelectEntry={setSelectedEntry}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchLogs;
