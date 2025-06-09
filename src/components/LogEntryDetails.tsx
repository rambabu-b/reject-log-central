
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save } from 'lucide-react';
import { LogEntry } from '@/types';
import { useAuth, getStaticUsers } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LogEntryDetailsProps {
  entry: LogEntry;
  onBack: () => void;
  onUpdate: (entry: LogEntry) => void;
}

const LogEntryDetails = ({ entry, onBack, onUpdate }: LogEntryDetailsProps) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    polyBagNo: entry.polyBagNo || '',
    grossWeight: entry.grossWeight?.toString() || '',
    productionConfirmed: entry.productionConfirmed || false,
    productionRemarks: entry.productionRemarks || '',
    grossWeightObserved: entry.grossWeightObserved?.toString() || '',
    destructionDoneBy: entry.destructionDoneBy || '',
    destructionVerifiedBy: entry.destructionVerifiedBy || '',
    storesRemarks: entry.storesRemarks || '',
    qaRemarks: entry.qaRemarks || '',
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const staticUsers = getStaticUsers();
  const canEdit = () => {
    if (user?.role === 'hod' || user?.role === 'admin') return true;
    
    if (user?.role === 'production' && entry.assignedProductionUser === user.id && entry.status === 'production_pending') {
      return true;
    }
    
    if (user?.role === 'stores' && entry.assignedStoresUser === user.id && entry.status === 'stores_pending') {
      return true;
    }
    
    if (user?.role === 'qa' && entry.status === 'qa_pending') {
      return true;
    }
    
    return false;
  };

  const handleSave = () => {
    let updatedEntry = { ...entry };
    let newStatus = entry.status;

    if (user?.role === 'production' || (user?.role === 'hod' && entry.status === 'production_pending')) {
      if (!formData.polyBagNo || !formData.grossWeight) {
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

      updatedEntry = {
        ...updatedEntry,
        polyBagNo: formData.polyBagNo,
        grossWeight: parseFloat(formData.grossWeight),
        productionConfirmed: formData.productionConfirmed,
        productionTimestamp: new Date().toISOString(),
        productionRemarks: formData.productionRemarks,
      };
      
      newStatus = 'stores_pending';
    }

    if (user?.role === 'stores' || (user?.role === 'hod' && entry.status === 'stores_pending')) {
      if (!formData.grossWeightObserved || !formData.destructionDoneBy || !formData.destructionVerifiedBy) {
        toast({
          title: "Error",
          description: "Gross weight observed, destruction done by, and destruction verified by are required",
          variant: "destructive",
        });
        return;
      }

      updatedEntry = {
        ...updatedEntry,
        grossWeightObserved: parseFloat(formData.grossWeightObserved),
        recordedBy: user?.name,
        recordedTimestamp: new Date().toISOString(),
        destructionDoneBy: formData.destructionDoneBy,
        destructionVerifiedBy: formData.destructionVerifiedBy,
        storesRemarks: formData.storesRemarks,
      };
      
      newStatus = 'qa_pending';
    }

    if (user?.role === 'qa' || (user?.role === 'hod' && entry.status === 'qa_pending')) {
      updatedEntry = {
        ...updatedEntry,
        qaSignedOff: true,
        qaTimestamp: new Date().toISOString(),
        qaRemarks: formData.qaRemarks,
      };
      
      newStatus = 'completed';
    }

    updatedEntry.status = newStatus;
    onUpdate(updatedEntry);
    setEditMode(false);
    
    toast({
      title: "Success",
      description: "Entry updated successfully",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      production_pending: { variant: 'destructive' as const, label: 'Production Pending' },
      stores_pending: { variant: 'destructive' as const, label: 'Stores Pending' },
      qa_pending: { variant: 'destructive' as const, label: 'QA Pending' },
      completed: { variant: 'default' as const, label: 'Completed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle>Log Entry Details</CardTitle>
          {getStatusBadge(entry.status)}
        </div>
        {canEdit() && !editMode && (
          <Button onClick={() => setEditMode(true)}>
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Date</Label>
            <div className="text-sm font-medium">{new Date(entry.date).toLocaleDateString()}</div>
          </div>
          <div>
            <Label>Product</Label>
            <div className="text-sm font-medium">{entry.productName}</div>
          </div>
          <div>
            <Label>Batch No</Label>
            <div className="text-sm font-medium">{entry.batchNo}</div>
          </div>
          <div>
            <Label>Line No</Label>
            <div className="text-sm font-medium">{entry.lineNo}</div>
          </div>
        </div>

        {/* Production Section */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-4">Production Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="polyBagNo">Poly Bag No</Label>
              {editMode && (user?.role === 'production' || user?.role === 'hod') ? (
                <Input
                  id="polyBagNo"
                  value={formData.polyBagNo}
                  onChange={(e) => setFormData({ ...formData, polyBagNo: e.target.value })}
                />
              ) : (
                <div className="text-sm font-medium">{entry.polyBagNo || 'Not entered'}</div>
              )}
            </div>
            <div>
              <Label htmlFor="grossWeight">Gross Weight (kg)</Label>
              {editMode && (user?.role === 'production' || user?.role === 'hod') ? (
                <Input
                  id="grossWeight"
                  type="number"
                  step="0.01"
                  value={formData.grossWeight}
                  onChange={(e) => setFormData({ ...formData, grossWeight: e.target.value })}
                />
              ) : (
                <div className="text-sm font-medium">{entry.grossWeight || 'Not entered'}</div>
              )}
            </div>
          </div>
          
          {editMode && (user?.role === 'production' || user?.role === 'hod') ? (
            <>
              <div className="mt-4">
                <Label htmlFor="productionRemarks">Production Remarks</Label>
                <Textarea
                  id="productionRemarks"
                  value={formData.productionRemarks}
                  onChange={(e) => setFormData({ ...formData, productionRemarks: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="productionConfirm"
                  checked={formData.productionConfirmed}
                  onCheckedChange={(checked) => setFormData({ ...formData, productionConfirmed: checked as boolean })}
                />
                <Label htmlFor="productionConfirm">
                  Confirm entry (Date and time will be recorded)
                </Label>
              </div>
            </>
          ) : (
            <>
              {entry.productionRemarks && (
                <div className="mt-4">
                  <Label>Production Remarks</Label>
                  <div className="text-sm">{entry.productionRemarks}</div>
                </div>
              )}
              {entry.productionTimestamp && (
                <div className="mt-4">
                  <Label>Production Confirmed At</Label>
                  <div className="text-sm">{new Date(entry.productionTimestamp).toLocaleString()}</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stores Section */}
        {(entry.status === 'stores_pending' || entry.status === 'qa_pending' || entry.status === 'completed') && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Stores Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grossWeightObserved">Gross Weight Observed (kg)</Label>
                {editMode && (user?.role === 'stores' || user?.role === 'hod') && entry.status === 'stores_pending' ? (
                  <Input
                    id="grossWeightObserved"
                    type="number"
                    step="0.01"
                    value={formData.grossWeightObserved}
                    onChange={(e) => setFormData({ ...formData, grossWeightObserved: e.target.value })}
                    required
                  />
                ) : (
                  <div className="text-sm font-medium">{entry.grossWeightObserved || 'Not entered'}</div>
                )}
              </div>
              <div>
                <Label htmlFor="destructionDoneBy">Destruction Done By</Label>
                {editMode && (user?.role === 'stores' || user?.role === 'hod') && entry.status === 'stores_pending' ? (
                  <Input
                    id="destructionDoneBy"
                    value={formData.destructionDoneBy}
                    onChange={(e) => setFormData({ ...formData, destructionDoneBy: e.target.value })}
                    placeholder="Enter name of person who performed destruction"
                    required
                  />
                ) : (
                  <div className="text-sm font-medium">{entry.destructionDoneBy || 'Not entered'}</div>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="destructionVerifiedBy">Destruction Verified By</Label>
                {editMode && (user?.role === 'stores' || user?.role === 'hod') && entry.status === 'stores_pending' ? (
                  <Input
                    id="destructionVerifiedBy"
                    value={formData.destructionVerifiedBy}
                    onChange={(e) => setFormData({ ...formData, destructionVerifiedBy: e.target.value })}
                    placeholder="Enter name of person who verified destruction"
                    required
                  />
                ) : (
                  <div className="text-sm font-medium">{entry.destructionVerifiedBy || 'Not entered'}</div>
                )}
              </div>
            </div>
            
            {editMode && (user?.role === 'stores' || user?.role === 'hod') && entry.status === 'stores_pending' ? (
              <div className="mt-4">
                <Label htmlFor="storesRemarks">Stores Remarks</Label>
                <Textarea
                  id="storesRemarks"
                  value={formData.storesRemarks}
                  onChange={(e) => setFormData({ ...formData, storesRemarks: e.target.value })}
                  placeholder="Enter any additional remarks"
                />
              </div>
            ) : (
              <>
                {entry.storesRemarks && (
                  <div className="mt-4">
                    <Label>Stores Remarks</Label>
                    <div className="text-sm">{entry.storesRemarks}</div>
                  </div>
                )}
                {entry.recordedTimestamp && (
                  <div className="mt-4">
                    <Label>Recorded At</Label>
                    <div className="text-sm">{new Date(entry.recordedTimestamp).toLocaleString()} by {entry.recordedBy}</div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* QA Section */}
        {(entry.status === 'qa_pending' || entry.status === 'completed') && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">QA Sign-off</h3>
            
            {editMode && (user?.role === 'qa' || user?.role === 'hod') && entry.status === 'qa_pending' ? (
              <div>
                <Label htmlFor="qaRemarks">QA Remarks</Label>
                <Textarea
                  id="qaRemarks"
                  value={formData.qaRemarks}
                  onChange={(e) => setFormData({ ...formData, qaRemarks: e.target.value })}
                  placeholder="Enter any remarks for the QA sign-off"
                />
              </div>
            ) : (
              <>
                {entry.qaRemarks && (
                  <div>
                    <Label>QA Remarks</Label>
                    <div className="text-sm">{entry.qaRemarks}</div>
                  </div>
                )}
                {entry.qaTimestamp && (
                  <div className="mt-4">
                    <Label>QA Signed Off At</Label>
                    <div className="text-sm">{new Date(entry.qaTimestamp).toLocaleString()}</div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {editMode && (
          <div className="flex space-x-4 pt-4 border-t">
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogEntryDetails;
