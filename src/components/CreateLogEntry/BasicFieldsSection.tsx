
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface BasicFieldsSectionProps {
  date: string;
  productId: string;
  products: Product[];
  onDateChange: (date: string) => void;
  onProductChange: (productId: string) => void;
}

const BasicFieldsSection = ({
  date,
  productId,
  products,
  onDateChange,
  onProductChange,
}: BasicFieldsSectionProps) => {
  const { user } = useAuth();

  const handleProductChange = (value: string) => {
    console.log('Product selected:', value);
    onProductChange(value);
  };

  console.log('Rendering BasicFieldsSection, products count:', products.length);

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
        <Label htmlFor="product">Product ({products.length} available)</Label>
        <Select value={productId} onValueChange={handleProductChange}>
          <SelectTrigger>
            <SelectValue placeholder={products.length > 0 ? "Select product" : "No products available"} />
          </SelectTrigger>
          <SelectContent>
            {products.length > 0 ? (
              products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} - {product.batchNo} - {product.lineNo}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-products" disabled>
                No products available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BasicFieldsSection;
