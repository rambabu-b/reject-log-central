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

    if (filters.productName) {
      filtered = filtered.filter(entry =>
        entry.productName.toLowerCase().includes(filters.productName.toLowerCase())
      );
    }

    if (filters.batchNo) {
      filtered = filtered.filter(entry =>
        entry.batchNo.toLowerCase().includes(filters.batchNo.toLowerCase())
      );
    }

    if (filters.lineNo) {
      filtered = filtered.filter(entry =>
        entry.lineNo.toLowerCase().includes(filters.lineNo.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(entry =>
        new Date(entry.date) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(entry =>
        new Date(entry.date) <= new Date(filters.dateTo)
      );
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(entry => entry.status === filters.status);
    }

    setFilteredEntries(filtered);
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      const csvContent = [
        ['Date', 'Product Name', 'Batch No', 'Line No', 'Status', 'Poly Bag No', 'Gross Weight', 'Gross Weight Observed', 'Production Remarks', 'Stores Remarks', 'QA Remarks'].join(','),
        ...filteredEntries.map(entry => [
          entry.date,
          entry.productName,
          entry.batchNo,
          entry.lineNo,
          entry.status,
          entry.polyBagNo || '',
          entry.grossWeight || '',
          entry.grossWeightObserved || '',
          entry.productionRemarks || '',
          entry.storesRemarks || '',
          entry.qaRemarks || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rejection_logs_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
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
            <Button variant="outline" onClick={() => handleExport('csv')} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
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
          <LogEntryList
            entries={filteredEntries}
            onSelectEntry={setSelectedEntry}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchLogs;