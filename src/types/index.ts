export interface User {
  id: string;
  username: string;
  password: string;
  role: 'production' | 'stores' | 'qa' | 'hod' | 'admin';
  name: string;
  department?: string;
}

export interface Product {
  id: string;
  name: string;
  batchNo: string;
  lineNo: string;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  date: string;
  productId: string;
  productName: string;
  batchNo: string;
  lineNo: string;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
  assignedProductionUser?: string;
  assignedStoresUser?: string;
  status: 'draft' | 'production_pending' | 'stores_pending' | 'qa_pending' | 'approved' | 'rejected' | 'reopened';
  
  // Production Team fields
  polyBagNo?: string;
  grossWeight?: number;
  productionConfirmed?: boolean;
  productionTimestamp?: string;
  productionRemarks?: string;
  productionUser?: string;
  
  // Stores Team fields
  grossWeightObserved?: number;
  recordedBy?: string;
  recordedTimestamp?: string;
  destructionDoneBy?: string;
  destructionVerifiedBy?: string;
  storesRemarks?: string;
  storesConfirmed?: boolean;
  
  // QA fields
  qaSignedOff?: boolean;
  qaTimestamp?: string;
  qaRemarks?: string;
  qaApprovalStatus?: 'pending' | 'approved' | 'rejected';
  qaUser?: string;
  
  // Variations and approvals
  hasVariations?: boolean;
  variationDetails?: string;
  variationApprovalRequired?: boolean;
  
  // Audit trail
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  reopenedBy?: string;
  reopenedAt?: string;
  reopenReason?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export interface AuditLog {
  id: string;
  logEntryId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  details: string;
  previousStatus?: string;
  newStatus?: string;
}