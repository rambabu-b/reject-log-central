import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface BasicFieldsSectionProps {
  date: string;
  productId: string;
  batchNo: string;
  lineNo: string;
  products: Product[];
  batchOptions: string[];
  lineOptions: string[];
  onDateChange: (date: string) => void;
  onProductChange: (productId: string) => void;
  onBatchNoChange: (batchNo: string) => void;
  onLineNoChange: (lineNo: string) => void;
}

const BasicFieldsSection = ({
  date,
  productId,
  batchNo,
  lineNo,
  products,
  batchOptions,
  lineOptions,
  onDateChange,
  onProductChange,
  onBatchNoChange,
  onLineNoChange,
}: BasicFieldsSectionProps) => {
  const { user } = useAuth();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="date">Log Entry Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          disabled={user?.role === 'production'}
        />
      </div>
      <div>
        <Label htmlFor="product">Product Name</Label>
        <Select value={productId} onValueChange={onProductChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="batchNo">Batch No.</Label>
        <Select value={batchNo} onValueChange={onBatchNoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select batch no." />
          </SelectTrigger>
          <SelectContent>
            {batchOptions.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="lineNo">Line No.</Label>
        <Select value={lineNo} onValueChange={onLineNoChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select line no." />
          </SelectTrigger>
          <SelectContent>
            {lineOptions.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BasicFieldsSection;