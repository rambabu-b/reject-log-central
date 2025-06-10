import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    batchNo: '',
    lineNo: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('products');
    if (stored) {
      setProducts(JSON.parse(stored));
    } else {
      // Add initial sample products based on the pharmaceutical process flow
      const sampleProducts: Product[] = [
        {
          id: '1',
          name: 'Paracetamol Tablets 500mg',
          batchNo: 'PCT001',
          lineNo: 'Line-A1',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Amoxicillin Capsules 250mg',
          batchNo: 'AMX002',
          lineNo: 'Line-B2',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Ibuprofen Tablets 400mg',
          batchNo: 'IBU003',
          lineNo: 'Line-A1',
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Metformin Tablets 850mg',
          batchNo: 'MET004',
          lineNo: 'Line-C3',
          createdAt: new Date().toISOString(),
        },
        {
          id: '5',
          name: 'Omeprazole Capsules 20mg',
          batchNo: 'OME005',
          lineNo: 'Line-B2',
          createdAt: new Date().toISOString(),
        },
        {
          id: '6',
          name: 'Aspirin Tablets 75mg',
          batchNo: 'ASP006',
          lineNo: 'Line-A1',
          createdAt: new Date().toISOString(),
        }
      ];
      setProducts(sampleProducts);
      localStorage.setItem('products', JSON.stringify(sampleProducts));
    }
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('products', JSON.stringify(newProducts));
  };

  const handleAdd = () => {
    if (!formData.name || !formData.batchNo || !formData.lineNo) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      batchNo: formData.batchNo,
      lineNo: formData.lineNo,
      createdAt: new Date().toISOString(),
    };

    saveProducts([...products, newProduct]);
    setFormData({ name: '', batchNo: '', lineNo: '' });
    setShowAddForm(false);
    toast({
      title: "Success",
      description: "Product added successfully",
    });
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      batchNo: product.batchNo,
      lineNo: product.lineNo,
    });
  };

  const handleUpdate = () => {
    const updatedProducts = products.map(p =>
      p.id === editingId
        ? { ...p, ...formData }
        : p
    );
    saveProducts(updatedProducts);
    setEditingId(null);
    setFormData({ name: '', batchNo: '', lineNo: '' });
    toast({
      title: "Success",
      description: "Product updated successfully",
    });
  };

  const handleDelete = (id: string) => {
    const updatedProducts = products.filter(p => p.id !== id);
    saveProducts(updatedProducts);
    toast({
      title: "Success",
      description: "Product deleted successfully",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({ name: '', batchNo: '', lineNo: '' });
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle className="text-lg sm:text-xl">Product Management</CardTitle>
          <Button onClick={() => setShowAddForm(true)} disabled={showAddForm} size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {showAddForm && (
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
              <h3 className="text-lg font-medium">Add New Product</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Paracetamol Tablets 500mg"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batchNo">Batch No</Label>
                  <Input
                    id="batchNo"
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    placeholder="e.g., PCT001"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lineNo">Line No</Label>
                  <Input
                    id="lineNo"
                    value={formData.lineNo}
                    onChange={(e) => setFormData({ ...formData, lineNo: e.target.value })}
                    placeholder="e.g., Line-A1"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Button onClick={handleAdd} size="sm" className="w-full sm:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={cancelEdit} size="sm" className="w-full sm:w-auto">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 space-y-3">
                {editingId === product.id ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Product Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Batch No</Label>
                      <Input
                        value={formData.batchNo}
                        onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Line No</Label>
                      <Input
                        value={formData.lineNo}
                        onChange={(e) => setFormData({ ...formData, lineNo: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleUpdate} className="flex-1">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit} className="flex-1">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">Batch: {product.batchNo}</div>
                      <div className="text-sm text-gray-600">Line: {product.lineNo}</div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(product)} className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)} className="flex-1">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Product Name</TableHead>
                  <TableHead className="min-w-[120px]">Batch No</TableHead>
                  <TableHead className="min-w-[100px]">Line No</TableHead>
                  <TableHead className="min-w-[120px]">Created At</TableHead>
                  <TableHead className="min-w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {editingId === product.id ? (
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        <div className="font-medium">{product.name}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === product.id ? (
                        <Input
                          value={formData.batchNo}
                          onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        product.batchNo
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === product.id ? (
                        <Input
                          value={formData.lineNo}
                          onChange={(e) => setFormData({ ...formData, lineNo: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        product.lineNo
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {editingId === product.id ? (
                          <>
                            <Button size="sm\" onClick={handleUpdate}>
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManagement;