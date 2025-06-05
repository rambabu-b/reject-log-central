
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search } from 'lucide-react';
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

    if (filters.status) {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Log Entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={filters.productName}
                onChange={(e) => setFilters({ ...filters, productName: e.target.value })}
                placeholder="Search by product name"
              />
            </div>
            <div>
              <Label htmlFor="batchNo">Batch No</Label>
              <Input
                id="batchNo"
                value={filters.batchNo}
                onChange={(e) => setFilters({ ...filters, batchNo: e.target.value })}
                placeholder="Search by batch number"
              />
            </div>
            <div>
              <Label htmlFor="lineNo">Line No</Label>
              <Input
                id="lineNo"
                value={filters.lineNo}
                onChange={(e) => setFilters({ ...filters, lineNo: e.target.value })}
                placeholder="Search by line number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="production_pending">Production Pending</SelectItem>
                  <SelectItem value="stores_pending">Stores Pending</SelectItem>
                  <SelectItem value="qa_pending">QA Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Results ({filteredEntries.length} entries)</CardTitle>
        </CardHeader>
        <CardContent>
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
