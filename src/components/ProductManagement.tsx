
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
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Product Management</CardTitle>
          <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-medium mb-4">Add New Product</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="batchNo">Batch No</Label>
                  <Input
                    id="batchNo"
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="lineNo">Line No</Label>
                  <Input
                    id="lineNo"
                    value={formData.lineNo}
                    onChange={(e) => setFormData({ ...formData, lineNo: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-4">
                <Button onClick={handleAdd}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={cancelEdit}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Batch No</TableHead>
                <TableHead>Line No</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
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
                      />
                    ) : (
                      product.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === product.id ? (
                      <Input
                        value={formData.batchNo}
                        onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
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
                      />
                    ) : (
                      product.lineNo
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {editingId === product.id ? (
                        <>
                          <Button size="sm" onClick={handleUpdate}>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManagement;
