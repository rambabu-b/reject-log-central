import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface ProductionFieldsSectionProps {
  polyBagNo: string;
  grossWeight: string;
  productionRemarks: string;
  productionConfirmed: boolean;
  onPolyBagNoChange: (value: string) => void;
  onGrossWeightChange: (value: string) => void;
  onProductionRemarksChange: (value: string) => void;
  onProductionConfirmedChange: (checked: boolean) => void;
}

const ProductionFieldsSection = ({
  polyBagNo,
  grossWeight,
  productionRemarks,
  productionConfirmed,
  onPolyBagNoChange,
  onGrossWeightChange,
  onProductionRemarksChange,
  onProductionConfirmedChange,
}: ProductionFieldsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">🏭 Production Details</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="polyBagNo">Poly Bag No *</Label>
          <Input
            id="polyBagNo"
            value={polyBagNo}
            onChange={(e) => onPolyBagNoChange(e.target.value)}
            required
            className="w-full"
            placeholder="Enter poly bag number"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="grossWeight">Gross Weight (kg) *</Label>
          <Input
            id="grossWeight"
            type="number"
            step="0.01"
            value={grossWeight}
            onChange={(e) => onGrossWeightChange(e.target.value)}
            required
            className="w-full"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="productionRemarks">Remarks (if any)</Label>
        <Textarea
          id="productionRemarks"
          value={productionRemarks}
          onChange={(e) => onProductionRemarksChange(e.target.value)}
          className="w-full min-h-[80px]"
          placeholder="Enter any production-related remarks..."
        />
      </div>

      <div className="flex items-start space-x-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Checkbox
          id="confirm"
          checked={productionConfirmed}
          onCheckedChange={(checked) => onProductionConfirmedChange(checked as boolean)}
          className="mt-1"
        />
        <div className="space-y-1">
          <Label htmlFor="confirm" className="text-sm font-medium cursor-pointer">
            ✅ Confirm production entry
          </Label>
          <p className="text-xs text-gray-600">
            Date and time will be recorded when you confirm this entry
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductionFieldsSection;