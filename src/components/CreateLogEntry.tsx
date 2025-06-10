
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { LogEntry } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateLogEntryForm } from '@/hooks/useCreateLogEntryForm';
import BasicFieldsSection from './CreateLogEntry/BasicFieldsSection';
import UserAssignmentSection from './CreateLogEntry/UserAssignmentSection';
import ProductionFieldsSection from './CreateLogEntry/ProductionFieldsSection';

interface CreateLogEntryProps {
  onCancel: () => void;
  onCreate: (entry: LogEntry) => void;
}

const CreateLogEntry = ({ onCancel, onCreate }: CreateLogEntryProps) => {
  const { user } = useAuth();
  const {
    products,
    formData,
    updateFormData,
    handleSubmit,
    selectedProduct,
  } = useCreateLogEntryForm(onCreate);

  // Get unique batch and line options from all products
  const batchOptions = Array.from(new Set(products.map(p => p.batchNo)));
  const lineOptions = Array.from(new Set(products.map(p => p.lineNo)));

  // Handle product selection and auto-fill batch/line from selected product
  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateFormData({ 
        productId,
        batchNo: product.batchNo,
        lineNo: product.lineNo
      });
    } else {
      updateFormData({ 
        productId,
        batchNo: '',
        lineNo: ''
      });
    }
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
          <BasicFieldsSection
            date={formData.date}
            productId={formData.productId}
            batchNo={formData.batchNo}
            lineNo={formData.lineNo}
            products={products}
            batchOptions={batchOptions}
            lineOptions={lineOptions}
            onDateChange={(date) => updateFormData({ date })}
            onProductChange={handleProductChange}
            onBatchNoChange={(batchNo) => updateFormData({ batchNo })}
            onLineNoChange={(lineNo) => updateFormData({ lineNo })}
          />

          <UserAssignmentSection
            assignedProductionUser={formData.assignedProductionUser}
            assignedStoresUser={formData.assignedStoresUser}
            onProductionUserChange={(assignedProductionUser) => updateFormData({ assignedProductionUser })}
            onStoresUserChange={(assignedStoresUser) => updateFormData({ assignedStoresUser })}
          />

          {user?.role === 'production' && (
            <ProductionFieldsSection
              polyBagNo={formData.polyBagNo}
              grossWeight={formData.grossWeight}
              productionRemarks={formData.productionRemarks}
              productionConfirmed={formData.productionConfirmed}
              onPolyBagNoChange={(polyBagNo) => updateFormData({ polyBagNo })}
              onGrossWeightChange={(grossWeight) => updateFormData({ grossWeight })}
              onProductionRemarksChange={(productionRemarks) => updateFormData({ productionRemarks })}
              onProductionConfirmedChange={(productionConfirmed) => updateFormData({ productionConfirmed })}
            />
          )}

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t">
            <Button type="submit" className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Create Entry
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateLogEntry;
