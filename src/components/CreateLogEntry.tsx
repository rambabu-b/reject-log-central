
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { LogEntry, Product } from '@/types';
import { useAuth, getStaticUsers } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CreateLogEntryProps {
  onCancel: () => void;
  onCreate: (entry: LogEntry) => void;
}

const CreateLogEntry = ({ onCancel, onCreate }: CreateLogEntryProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    productId: '',
    assignedProductionUser: '',
    assignedStoresUser: '',
    polyBagNo: '',
    grossWeight: '',
    productionConfirmed: false,
    productionRemarks: '',
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('products');
    if (stored) {
      setProducts(JSON.parse(stored));
    }
  }, []);

  const staticUsers = getStaticUsers();
  const productionUsers = staticUsers.filter(u => u.role === 'production');
  const storesUsers = staticUsers.filter(u => u.role === 'stores');

  const selectedProduct = products.find(p => p.id === formData.productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      });
      return;
    }

    if (user?.role === 'production') {
      if (!formData.assignedStoresUser || !formData.polyBagNo || !formData.grossWeight) {
        toast({
          title: "Error",
          description: "All production fields are required",
          variant: "destructive",
        });
        return;
      }
      
      if (!formData.productionConfirmed) {
        toast({
          title: "Error",
          description: "Please confirm the entry",
          variant: "destructive",
        });
        return;
      }
    }

    if (user?.role === 'hod' && (!formData.assignedProductionUser || !formData.assignedStoresUser)) {
      toast({
        title: "Error",
        description: "Please assign both production and stores users",
        variant: "destructive",
      });
      return;
    }

    const newEntry: LogEntry = {
      id: Date.now().toString(),
      date: formData.date,
      productId: formData.productId,
      productName: selectedProduct?.name || '',
      batchNo: selectedProduct?.batchNo || '',
      lineNo: selectedProduct?.lineNo || '',
      createdBy: user?.id || '',
      createdByRole: user?.role || '',
      assignedProductionUser: formData.assignedProductionUser || (user?.role === 'production' ? user.id : ''),
      assignedStoresUser: formData.assignedStoresUser,
      status: user?.role === 'production' && formData.productionConfirmed ? 'stores_pending' : 'production_pending',
      polyBagNo: formData.polyBagNo,
      grossWeight: formData.grossWeight ? parseFloat(formData.grossWeight) : undefined,
      productionConfirmed: formData.productionConfirmed,
      productionTimestamp: formData.productionConfirmed ? new Date().toISOString() : undefined,
      productionRemarks: formData.productionRemarks,
    };

    onCreate(newEntry);
    toast({
      title: "Success",
      description: "Log entry created successfully",
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <Button variant="ghost" onClick={onCancel} className="mr-4">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <CardTitle>Create New Log Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Log Entry Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={user?.role === 'production'}
              />
            </div>
            
            <div>
              <Label htmlFor="product">Product</Label>
              <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {product.batchNo} - {product.lineNo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {user?.role === 'hod' && (
              <>
                <div>
                  <Label htmlFor="productionUser">Production Team User</Label>
                  <Select value={formData.assignedProductionUser} onValueChange={(value) => setFormData({ ...formData, assignedProductionUser: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select production user" />
                    </SelectTrigger>
                    <SelectContent>
                      {productionUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="storesUser">Stores Team User</Label>
              <Select value={formData.assignedStoresUser} onValueChange={(value) => setFormData({ ...formData, assignedStoresUser: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stores user" />
                </SelectTrigger>
                <SelectContent>
                  {storesUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {user?.role === 'production' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="polyBagNo">Poly Bag No</Label>
                  <Input
                    id="polyBagNo"
                    value={formData.polyBagNo}
                    onChange={(e) => setFormData({ ...formData, polyBagNo: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="grossWeight">Gross Weight (kg)</Label>
                  <Input
                    id="grossWeight"
                    type="number"
                    step="0.01"
                    value={formData.grossWeight}
                    onChange={(e) => setFormData({ ...formData, grossWeight: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="productionRemarks">Remarks (if any)</Label>
                <Textarea
                  id="productionRemarks"
                  value={formData.productionRemarks}
                  onChange={(e) => setFormData({ ...formData, productionRemarks: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirm"
                  checked={formData.productionConfirmed}
                  onCheckedChange={(checked) => setFormData({ ...formData, productionConfirmed: checked as boolean })}
                />
                <Label htmlFor="confirm">
                  Confirm entry (Date and time will be recorded)
                </Label>
              </div>
            </>
          )}

          <div className="flex space-x-4">
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Create Entry
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateLogEntry;
