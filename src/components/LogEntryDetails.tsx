
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, CheckCircle, XCircle, AlertTriangle, Clock, FileText, User } from 'lucide-react';
import { LogEntry, AuditLog } from '@/types';
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
    storesConfirmed: entry.storesConfirmed || false,
    qaRemarks: entry.qaRemarks || '',
    hasVariations: entry.hasVariations || false,
    variationDetails: entry.variationDetails || '',
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

  const canApprove = () => {
    return user?.role === 'qa' && entry.status === 'qa_pending';
  };

  const createAuditLog = (action: string, details: string, previousStatus?: string, newStatus?: string): AuditLog => {
    return {
      id: Date.now().toString(),
      logEntryId: entry.id,
      action,
      performedBy: user?.name || 'Unknown',
      performedAt: new Date().toISOString(),
      details,
      previousStatus,
      newStatus,
    };
  };

  const saveAuditLog = (auditLog: AuditLog) => {
    const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
    existingLogs.push(auditLog);
    localStorage.setItem('auditLogs', JSON.stringify(existingLogs));
  };

  const handleSave = () => {
    let updatedEntry = { ...entry };
    let newStatus = entry.status;
    let auditDetails = '';

    // Production Team workflow
    if (user?.role === 'production' || (user?.role === 'hod' && entry.status === 'production_pending')) {
      if (!formData.polyBagNo || !formData.grossWeight) {
        toast({
          title: "Error",
          description: "Poly Bag No and Gross Weight are required",
          variant: "destructive",
        });
        return;
      }
      
      if (!formData.productionConfirmed) {
        toast({
          title: "Error",
          description: "Please confirm the production entry",
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
        productionUser: user?.name,
        lastModifiedBy: user?.name,
        lastModifiedAt: new Date().toISOString(),
      };
      
      newStatus = 'stores_pending';
      auditDetails = `Production data completed: Poly Bag No: ${formData.polyBagNo}, Gross Weight: ${formData.grossWeight}kg`;
    }

    // Stores Team workflow
    if (user?.role === 'stores' || (user?.role === 'hod' && entry.status === 'stores_pending')) {
      if (!formData.grossWeightObserved || !formData.destructionDoneBy || !formData.destructionVerifiedBy) {
        toast({
          title: "Error",
          description: "All stores fields are required",
          variant: "destructive",
        });
        return;
      }

      if (!formData.storesConfirmed) {
        toast({
          title: "Error",
          description: "Please confirm the stores entry",
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
        storesConfirmed: formData.storesConfirmed,
        hasVariations: formData.hasVariations,
        variationDetails: formData.variationDetails,
        lastModifiedBy: user?.name,
        lastModifiedAt: new Date().toISOString(),
      };
      
      newStatus = 'qa_pending';
      auditDetails = `Stores data completed: Observed Weight: ${formData.grossWeightObserved}kg, Destruction by: ${formData.destructionDoneBy}`;
      if (formData.hasVariations) {
        auditDetails += `, Variations noted: ${formData.variationDetails}`;
      }
    }

    // QA Team workflow - Allow saving remarks without approval/rejection
    if (user?.role === 'qa' || (user?.role === 'hod' && entry.status === 'qa_pending')) {
      updatedEntry = {
        ...updatedEntry,
        qaRemarks: formData.qaRemarks,
        lastModifiedBy: user?.name,
        lastModifiedAt: new Date().toISOString(),
      };
      
      auditDetails = `QA remarks updated: ${formData.qaRemarks}`;
      // Don't change status when just saving remarks
      newStatus = entry.status;
    }

    // Save audit log
    const auditLog = createAuditLog('UPDATE', auditDetails, entry.status, newStatus);
    saveAuditLog(auditLog);

    updatedEntry.status = newStatus;
    onUpdate(updatedEntry);
    setEditMode(false);
    
    toast({
      title: "Success",
      description: "Entry updated successfully",
    });
  };

  const handleApprove = () => {
    // QA approval requires remarks
    if (!formData.qaRemarks.trim()) {
      toast({
        title: "Error",
        description: "QA remarks are required for approval",
        variant: "destructive",
      });
      return;
    }

    const updatedEntry = {
      ...entry,
      status: 'approved' as const,
      qaSignedOff: true,
      qaTimestamp: new Date().toISOString(),
      qaApprovalStatus: 'approved' as const,
      qaUser: user?.name,
      qaRemarks: formData.qaRemarks,
      lastModifiedBy: user?.name,
      lastModifiedAt: new Date().toISOString(),
    };

    // Save audit log
    const auditLog = createAuditLog('APPROVE', `Entry approved by QA. Remarks: ${formData.qaRemarks}`, entry.status, 'approved');
    saveAuditLog(auditLog);

    onUpdate(updatedEntry);
    toast({
      title: "✅ Entry Approved",
      description: "Rejection log entry has been successfully approved and signed off",
    });
  };

  const handleReject = () => {
    if (!formData.qaRemarks.trim()) {
      toast({
        title: "Error",
        description: "QA remarks are required for rejection",
        variant: "destructive",
      });
      return;
    }

    const updatedEntry = {
      ...entry,
      status: 'rejected' as const,
      qaSignedOff: false,
      qaTimestamp: new Date().toISOString(),
      qaApprovalStatus: 'rejected' as const,
      qaUser: user?.name,
      qaRemarks: formData.qaRemarks,
      lastModifiedBy: user?.name,
      lastModifiedAt: new Date().toISOString(),
    };

    // Save audit log
    const auditLog = createAuditLog('REJECT', `Entry rejected by QA. Reason: ${formData.qaRemarks}`, entry.status, 'rejected');
    saveAuditLog(auditLog);

    onUpdate(updatedEntry);
    toast({
      title: "❌ Entry Rejected",
      description: "Entry has been rejected and sent back for revision",
      variant: "destructive",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: FileText },
      production_pending: { variant: 'destructive' as const, label: 'Production Pending', icon: Clock },
      stores_pending: { variant: 'destructive' as const, label: 'Stores Pending', icon: Clock },
      qa_pending: { variant: 'destructive' as const, label: 'QA Review Pending', icon: Clock },
      approved: { variant: 'default' as const, label: '✅ Approved', icon: CheckCircle, className: 'bg-green-600 hover:bg-green-700' },
      rejected: { variant: 'destructive' as const, label: '❌ Rejected', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 text-sm px-3 py-1 ${config.className || ''}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </Badge>
    );
  };

  const getWorkflowProgress = () => {
    const steps = [
      { key: 'production', label: 'Production', completed: entry.productionConfirmed },
      { key: 'stores', label: 'Stores', completed: entry.storesConfirmed },
      { key: 'qa', label: 'QA Review', completed: entry.qaSignedOff },
    ];

    return (
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700">Workflow Progress:</h4>
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {step.completed ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
            <span className={`ml-2 text-sm ${step.completed ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 mx-2 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const getAssignedUserName = (userId: string | undefined, teamType: string) => {
    if (!userId) return `No ${teamType} assigned`;
    const assignedUser = staticUsers.find(u => u.id === userId);
    return assignedUser ? `${assignedUser.name} (${teamType.toUpperCase()})` : `${teamType.toUpperCase()} Team`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle>Rejection Log Entry Details</CardTitle>
          {getStatusBadge(entry.status)}
          {entry.hasVariations && (
            <Badge variant="outline" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border-yellow-300">
              <AlertTriangle className="w-3 h-3" />
              Variations Noted
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          {canEdit() && !editMode && (
            <Button onClick={() => setEditMode(true)}>
              Edit
            </Button>
          )}
          {canApprove() && (
            <>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                ✅ Approve & Sign Off
              </Button>
              <Button onClick={handleReject} variant="destructive">
                <XCircle className="w-4 h-4 mr-2" />
                ❌ Reject
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Workflow Progress */}
        {getWorkflowProgress()}

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Date</Label>
            <div className="text-sm font-medium mt-1">{new Date(entry.date).toLocaleDateString()}</div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Product</Label>
            <div className="text-sm font-medium mt-1">{entry.productName}</div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Batch No</Label>
            <div className="text-sm font-medium mt-1">{entry.batchNo}</div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Line No</Label>
            <div className="text-sm font-medium mt-1">{entry.lineNo}</div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Created By</Label>
            <div className="text-sm font-medium flex items-center gap-2 mt-1">
              <User className="w-4 h-4" />
              {staticUsers.find(u => u.id === entry.createdBy)?.name || 'Unknown'}
              <Badge variant="outline" className="text-xs">
                {entry.createdByRole?.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Created At</Label>
            <div className="text-sm font-medium mt-1">{new Date(entry.createdAt || entry.date).toLocaleString()}</div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Assigned Production User</Label>
            <div className="text-sm font-medium mt-1">{getAssignedUserName(entry.assignedProductionUser, 'production')}</div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Assigned Stores User</Label>
            <div className="text-sm font-medium mt-1">{getAssignedUserName(entry.assignedStoresUser, 'stores')}</div>
          </div>
        </div>

        <Separator />

        {/* Production Section - Only show if production has started or is pending */}
        {(entry.status !== 'draft') && (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🏭 Production Details
                {entry.productionConfirmed && <CheckCircle className="w-5 h-5 text-green-600" />}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="polyBagNo" className="text-sm font-medium text-gray-600">Poly Bag No *</Label>
                  {editMode && (user?.role === 'production' || user?.role === 'hod') ? (
                    <Input
                      id="polyBagNo"
                      value={formData.polyBagNo}
                      onChange={(e) => setFormData({ ...formData, polyBagNo: e.target.value })}
                      required
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm font-medium mt-1">{entry.polyBagNo || 'Not entered'}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="grossWeight" className="text-sm font-medium text-gray-600">Gross Weight (kg) *</Label>
                  {editMode && (user?.role === 'production' || user?.role === 'hod') ? (
                    <Input
                      id="grossWeight"
                      type="number"
                      step="0.01"
                      value={formData.grossWeight}
                      onChange={(e) => setFormData({ ...formData, grossWeight: e.target.value })}
                      required
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm font-medium mt-1">{entry.grossWeight || 'Not entered'}</div>
                  )}
                </div>
              </div>
              
              {editMode && (user?.role === 'production' || user?.role === 'hod') ? (
                <>
                  <div className="mt-4">
                    <Label htmlFor="productionRemarks" className="text-sm font-medium text-gray-600">Production Remarks</Label>
                    <Textarea
                      id="productionRemarks"
                      value={formData.productionRemarks}
                      onChange={(e) => setFormData({ ...formData, productionRemarks: e.target.value })}
                      placeholder="Enter any production-related remarks"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Checkbox
                      id="productionConfirm"
                      checked={formData.productionConfirmed}
                      onCheckedChange={(checked) => setFormData({ ...formData, productionConfirmed: checked as boolean })}
                    />
                    <Label htmlFor="productionConfirm" className="text-sm font-medium">
                      ✅ Confirm and sign off production entry (Date and time will be recorded)
                    </Label>
                  </div>
                </>
              ) : (
                <>
                  {entry.productionRemarks && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-600">Production Remarks</Label>
                      <div className="text-sm mt-1">{entry.productionRemarks}</div>
                    </div>
                  )}
                  {entry.productionTimestamp && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Production Confirmed At</Label>
                        <div className="text-sm mt-1">{new Date(entry.productionTimestamp).toLocaleString()}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Production User</Label>
                        <div className="text-sm mt-1">{entry.productionUser || 'Unknown'}</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Stores Section - Only show if stores workflow has started */}
        {(entry.status === 'stores_pending' || entry.status === 'qa_pending' || entry.status === 'approved' || entry.status === 'rejected') && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                📦 Stores Details
                {entry.storesConfirmed && <CheckCircle className="w-5 h-5 text-green-600" />}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grossWeightObserved" className="text-sm font-medium text-gray-600">Gross Weight Observed (kg) *</Label>
                  {editMode && (user?.role === 'stores' || user?.role === 'hod') && entry.status === 'stores_pending' ? (
                    <Input
                      id="grossWeightObserved"
                      type="number"
                      step="0.01"
                      value={formData.grossWeightObserved}
                      onChange={(e) => setFormData({ ...formData, grossWeightObserved: e.target.value })}
                      required
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm font-medium mt-1">{entry.grossWeightObserved || 'Not entered'}</div>
                  )}
                </div>
                <div>
                  <Label htmlFor="destructionDoneBy" className="text-sm font-medium text-gray-600">Destruction Done By *</Label>
                  {editMode && (user?.role === 'stores' || user?.role === 'hod') && entry.status === 'stores_pending' ? (
                    <Input
                      id="destructionDoneBy"
                      value={formData.destructionDoneBy}
                      onChange={(e) => setFormData({ ...formData, destructionDoneBy: e.target.value })}
                      placeholder="Enter name of person who performed destruction"
                      required
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm font-medium mt-1">{entry.destructionDoneBy || 'Not entered'}</div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="destructionVerifiedBy" className="text-sm font-medium text-gray-600">Destruction Verified By *</Label>
                  {editMode && (user?.role === 'stores' || user?.role === 'hod') && entry.status === 'stores_pending' ? (
                    <Input
                      id="destructionVerifiedBy"
                      value={formData.destructionVerifiedBy}
                      onChange={(e) => setFormData({ ...formData, destructionVerifiedBy: e.target.value })}
                      placeholder="Enter name of person who verified destruction"
                      required
                      className="mt-1"
                    />
                  ) : (
                    <div className="text-sm font-medium mt-1">{entry.destructionVerifiedBy || 'Not entered'}</div>
                  )}
                </div>
              </div>
              
              {editMode && (user?.role === 'stores' || user?.role === 'hod') && entry.status === 'stores_pending' ? (
                <>
                  <div className="mt-4">
                    <Label htmlFor="storesRemarks" className="text-sm font-medium text-gray-600">Stores Remarks</Label>
                    <Textarea
                      id="storesRemarks"
                      value={formData.storesRemarks}
                      onChange={(e) => setFormData({ ...formData, storesRemarks: e.target.value })}
                      placeholder="Enter any stores-related remarks"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id="hasVariations"
                      checked={formData.hasVariations}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasVariations: checked as boolean })}
                    />
                    <Label htmlFor="hasVariations" className="text-sm font-medium">
                      ⚠️ Variations identified that require QA approval
                    </Label>
                  </div>
                  {formData.hasVariations && (
                    <div className="mt-4">
                      <Label htmlFor="variationDetails" className="text-sm font-medium text-gray-600">Variation Details *</Label>
                      <Textarea
                        id="variationDetails"
                        value={formData.variationDetails}
                        onChange={(e) => setFormData({ ...formData, variationDetails: e.target.value })}
                        placeholder="Describe the variations identified"
                        required
                        className="mt-1"
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Checkbox
                      id="storesConfirm"
                      checked={formData.storesConfirmed}
                      onCheckedChange={(checked) => setFormData({ ...formData, storesConfirmed: checked as boolean })}
                    />
                    <Label htmlFor="storesConfirm" className="text-sm font-medium">
                      ✅ Confirm and sign off stores entry (Date and time will be recorded)
                    </Label>
                  </div>
                </>
              ) : (
                <>
                  {entry.storesRemarks && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-600">Stores Remarks</Label>
                      <div className="text-sm mt-1">{entry.storesRemarks}</div>
                    </div>
                  )}
                  {entry.hasVariations && entry.variationDetails && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-600">⚠️ Variation Details</Label>
                      <div className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-md mt-1">
                        {entry.variationDetails}
                      </div>
                    </div>
                  )}
                  {entry.recordedTimestamp && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium text-gray-600">Stores Confirmed At</Label>
                      <div className="text-sm mt-1">{new Date(entry.recordedTimestamp).toLocaleString()} by {entry.recordedBy}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* QA Section - Only show if QA workflow has started */}
        {(entry.status === 'qa_pending' || entry.status === 'approved' || entry.status === 'rejected') && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🔬 QA Review & Sign-off
                {entry.qaSignedOff && <CheckCircle className="w-5 h-5 text-green-600" />}
              </h3>
              
              {editMode && (user?.role === 'qa' || user?.role === 'hod') && entry.status === 'qa_pending' ? (
                <div>
                  <Label htmlFor="qaRemarks" className="text-sm font-medium text-gray-600">QA Remarks *</Label>
                  <Textarea
                    id="qaRemarks"
                    value={formData.qaRemarks}
                    onChange={(e) => setFormData({ ...formData, qaRemarks: e.target.value })}
                    placeholder="Enter QA review comments and remarks (required for approval/rejection)"
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    Note: QA remarks are required for both approval and rejection
                  </div>
                </div>
              ) : (
                <>
                  {entry.qaRemarks && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">QA Remarks</Label>
                      <div className="text-sm p-3 bg-blue-50 border border-blue-200 rounded-md mt-1">{entry.qaRemarks}</div>
                    </div>
                  )}
                  {entry.qaTimestamp && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">QA Action Taken At</Label>
                        <div className="text-sm mt-1">{new Date(entry.qaTimestamp).toLocaleString()}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">QA User</Label>
                        <div className="text-sm mt-1">{entry.qaUser || 'Unknown'}</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Audit Information */}
        {entry.lastModifiedBy && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4">📋 Audit Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Modified By</Label>
                  <div className="mt-1">{entry.lastModifiedBy}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Modified At</Label>
                  <div className="mt-1">{entry.lastModifiedAt ? new Date(entry.lastModifiedAt).toLocaleString() : 'N/A'}</div>
                </div>
              </div>
            </div>
          </>
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
