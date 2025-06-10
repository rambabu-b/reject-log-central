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
import * as XLSX from 'xlsx';

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
      setFilteredEntries(logs); // Show all logs by default
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

    setFilteredEntries(filtered); // Show filtered results

    // Show search results message
    toast({
      title: "Search Complete",
      description: `Found ${filtered.length} matching entries`,
    });
  };

  const isFilterActive = () => {
    return (
      filters.productName.trim() ||
      filters.batchNo.trim() ||
      filters.lineNo.trim() ||
      filters.dateFrom ||
      filters.dateTo ||
      (filters.status && filters.status !== 'all')
    );
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    // Use all logs if no filter is active, otherwise use filtered entries
    const exportEntries = isFilterActive() ? filteredEntries : logEntries;

    if (exportEntries.length === 0) {
      toast({
        title: "No Data to Export",
        description: "No search results found. Please adjust your search criteria.",
        variant: "destructive",
      });
      return;
    }
  
    if (format === 'xlsx') {
      // Prepare data rows
      const data = exportEntries.map(entry => [
        entry.date,
        entry.productName,
        entry.batchNo,
        entry.lineNo,
        entry.polyBagNo || '',
        entry.grossWeight ?? '',
        entry.productionUser
          ? `${entry.productionUser} (${entry.productionTimestamp ? new Date(entry.productionTimestamp).toLocaleDateString() : ''})`
          : '',
        entry.grossWeightObserved ?? '',
        entry.recordedBy
          ? `${entry.recordedBy} (${entry.recordedTimestamp ? new Date(entry.recordedTimestamp).toLocaleDateString() : ''})`
          : '',
        entry.destructionDoneBy || '',
        entry.destructionVerifiedBy || '',
        entry.qaRemarks || ''
      ]);
  
      // Multi-row header
      const header1 = [
        "Date",
        "Product Name",
        "Batch No.",
        "Line No.",
        "PRODUCTION", "", "",
        "STORES", "", "",
        "Remarks (If any)"
      ];
      const header2 = [
        "", "", "", "",
        "Poly bag No.",
        "Gross wt. (kg)",
        "Activity done By (Sign/Date)",
        "Gross wt. observed (kg)",
        "Recorded by (Sign/Date)",
        "Destruction done by (Name)",
        "Destruction verified by (Sign/Date)",
        ""
      ];
  
      // Combine headers and data
      const wsData = [header1, header2, ...data];
  
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);
  
      // Merge cells for "PRODUCTION", "STORES", "Date", "Product Name", "Batch No.", "Line No.", and "Remarks"
      ws['!merges'] = [
        { s: { r: 0, c: 4 }, e: { r: 0, c: 6 } }, // PRODUCTION
        { s: { r: 0, c: 7 }, e: { r: 0, c: 10 } }, // STORES
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // Date
        { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // Product Name
        { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // Batch No.
        { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // Line No.
        { s: { r: 0, c: 11 }, e: { r: 1, c: 11 } } // Remarks
      ];
  
      // Set column widths for better appearance
      ws['!cols'] = [
        { wch: 12 }, // Date
        { wch: 25 }, // Product Name
        { wch: 12 }, // Batch No.
        { wch: 10 }, // Line No.
        { wch: 14 }, // Poly bag No.
        { wch: 14 }, // Gross wt.
        { wch: 24 }, // Activity done By
        { wch: 18 }, // Gross wt. observed
        { wch: 24 }, // Recorded by
        { wch: 22 }, // Destruction done by
        { wch: 28 }, // Destruction verified by
        { wch: 30 }  // Remarks
      ];
  
      // Apply styles: bold and center-align headers using a more explicit approach
      const headerStyle = {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center", wrapText: true }
      };
  
      // Apply styles to first header row (row 0)
      header1.forEach((_, col) => {
        const cell = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cell]) ws[cell] = { t: 's', v: header1[col] || '' };
        ws[cell].s = headerStyle;
      });
  
      // Apply styles to second header row (row 1)
      header2.forEach((_, col) => {
        const cell = XLSX.utils.encode_cell({ r: 1, c: col });
        if (!ws[cell]) ws[cell] = { t: 's', v: header2[col] || '' };
        ws[cell].s = headerStyle;
      });
  
      // Explicitly ensure "Remarks (If any)" cell content and style
      const remarksCell = XLSX.utils.encode_cell({ r: 0, c: 11 });
      ws[remarksCell] = {
        t: 's',
        v: "Remarks (If any)",
        s: headerStyle
      };
  
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Rejection Logs");
  
      XLSX.writeFile(wb, `rejection_logs_${new Date().toISOString().split('T')[0]}_${exportEntries.length}_entries.xlsx`);
  
      toast({
        title: "Export Successful",
        description: `Exported ${exportEntries.length} entries to Excel file`,
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span>Search Results ({filteredEntries.length} entries)</span>
            <Button
              variant="outline"
              onClick={() => handleExport('xlsx')}
              className="w-full sm:w-auto"
              disabled={filteredEntries.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel ({filteredEntries.length})
            </Button>
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
