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
  } = useCreateLogEntryForm(onCreate);

  return (
    <div className="p-4 sm:p-0">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 pb-2">
          <div className="flex items-center w-full sm:w-auto">
            <Button variant="ghost" onClick={onCancel} className="mr-2 sm:mr-4 p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-lg sm:text-xl">Create New Log Entry</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <BasicFieldsSection
              date={formData.date}
              productId={formData.productId}
              products={products}
              onDateChange={(date) => updateFormData({ date })}
              onProductChange={(productId) => updateFormData({ productId })}
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
    </div>
  );
};

export default CreateLogEntry;