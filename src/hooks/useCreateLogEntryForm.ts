import { useState, useEffect } from 'react';
import { Product, LogEntry } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  date: string;
  productId: string;
  assignedProductionUser: string;
  assignedStoresUser: string;
  polyBagNo: string;
  grossWeight: string;
  productionConfirmed: boolean;
  productionRemarks: string;
}

// Enhanced sample products for pharmaceutical rejection log system
const getSampleProducts = (): Product[] => [
  {
    id: '1',
    name: 'Paracetamol Tablets 500mg',
    batchNo: 'PCT001-2024',
    lineNo: 'Line-A1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Amoxicillin Capsules 250mg',
    batchNo: 'AMX002-2024',
    lineNo: 'Line-B2',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Ibuprofen Tablets 400mg',
    batchNo: 'IBU003-2024',
    lineNo: 'Line-A1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Metformin Tablets 850mg',
    batchNo: 'MET004-2024',
    lineNo: 'Line-C3',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Omeprazole Capsules 20mg',
    batchNo: 'OME005-2024',
    lineNo: 'Line-B2',
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Aspirin Tablets 75mg',
    batchNo: 'ASP006-2024',
    lineNo: 'Line-A1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Ciprofloxacin Tablets 500mg',
    batchNo: 'CIP007-2024',
    lineNo: 'Line-C3',
    createdAt: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'Losartan Tablets 50mg',
    batchNo: 'LOS008-2024',
    lineNo: 'Line-B2',
    createdAt: new Date().toISOString(),
  }
];

export const useCreateLogEntryForm = (onCreate: (entry: LogEntry) => void) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<FormData>({
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
    console.log('Loading products for user:', user?.role, user?.name);
    const stored = localStorage.getItem('products');
    if (stored) {
      const loadedProducts = JSON.parse(stored);
      console.log('Products loaded from localStorage:', loadedProducts);
      setProducts(loadedProducts);
    } else {
      console.log('No products found in localStorage, initializing sample products');
      const sampleProducts = getSampleProducts();
      setProducts(sampleProducts);
      localStorage.setItem('products', JSON.stringify(sampleProducts));
      console.log('Sample products initialized:', sampleProducts);
    }

    // Auto-assign current user if they are production role
    if (user?.role === 'production') {
      setFormData(prev => ({
        ...prev,
        assignedProductionUser: user.id
      }));
    }
  }, [user]);

  const selectedProduct = products.find(p => p.id === formData.productId);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateForm = (): boolean => {
    if (!formData.productId) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      });
      return false;
    }

    // For production users creating entries
    if (user?.role === 'production') {
      if (!formData.assignedStoresUser) {
        toast({
          title: "Error",
          description: "Please assign a stores team member",
          variant: "destructive",
        });
        return false;
      }

      if (!formData.polyBagNo || !formData.grossWeight) {
        toast({
          title: "Error",
          description: "Poly Bag No and Gross Weight are required for production entries",
          variant: "destructive",
        });
        return false;
      }
      
      if (!formData.productionConfirmed) {
        toast({
          title: "Error",
          description: "Please confirm the production entry",
          variant: "destructive",
        });
        return false;
      }
    }

    // For HOD creating entries
    if (user?.role === 'hod') {
      if (!formData.assignedProductionUser || !formData.assignedStoresUser) {
        toast({
          title: "Error",
          description: "Please assign both production and stores team members",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Determine initial status based on user role and completion
    let initialStatus: LogEntry['status'] = 'production_pending';
    
    if (user?.role === 'production' && formData.productionConfirmed) {
      initialStatus = 'stores_pending';
    } else if (user?.role === 'hod') {
      initialStatus = 'production_pending';
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
      createdAt: new Date().toISOString(),
      assignedProductionUser: formData.assignedProductionUser || (user?.role === 'production' ? user.id : ''),
      assignedStoresUser: formData.assignedStoresUser,
      status: initialStatus,
      
      // Production fields (if filled by production user)
      polyBagNo: formData.polyBagNo || undefined,
      grossWeight: formData.grossWeight ? parseFloat(formData.grossWeight) : undefined,
      productionConfirmed: formData.productionConfirmed,
      productionTimestamp: formData.productionConfirmed ? new Date().toISOString() : undefined,
      productionRemarks: formData.productionRemarks || undefined,
      productionUser: user?.role === 'production' ? user.name : undefined,
      
      // Audit fields
      lastModifiedBy: user?.name,
      lastModifiedAt: new Date().toISOString(),
    };

    onCreate(newEntry);
    
    toast({
      title: "Success",
      description: `Rejection log entry created successfully and assigned to ${initialStatus === 'stores_pending' ? 'stores team' : 'production team'}`,
    });
  };

  return {
    products,
    formData,
    updateFormData,
    handleSubmit,
    selectedProduct,
  };
};