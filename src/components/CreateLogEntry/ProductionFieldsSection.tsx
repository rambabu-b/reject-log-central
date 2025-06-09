
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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="polyBagNo">Poly Bag No</Label>
          <Input
            id="polyBagNo"
            value={polyBagNo}
            onChange={(e) => onPolyBagNoChange(e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="grossWeight">Gross Weight (kg)</Label>
          <Input
            id="grossWeight"
            type="number"
            step="0.01"
            value={grossWeight}
            onChange={(e) => onGrossWeightChange(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="productionRemarks">Remarks (if any)</Label>
        <Textarea
          id="productionRemarks"
          value={productionRemarks}
          onChange={(e) => onProductionRemarksChange(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="confirm"
          checked={productionConfirmed}
          onCheckedChange={(checked) => onProductionConfirmedChange(checked as boolean)}
        />
        <Label htmlFor="confirm">
          Confirm entry (Date and time will be recorded)
        </Label>
      </div>
    </>
  );
};

export default ProductionFieldsSection;
