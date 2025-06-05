
export interface User {
  id: string;
  username: string;
  password: string;
  role: 'production' | 'stores' | 'qa' | 'hod' | 'admin';
  name: string;
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
  assignedProductionUser?: string;
  assignedStoresUser?: string;
  status: 'draft' | 'production_pending' | 'stores_pending' | 'qa_pending' | 'completed';
  
  // Production Team fields
  polyBagNo?: string;
  grossWeight?: number;
  productionConfirmed?: boolean;
  productionTimestamp?: string;
  productionRemarks?: string;
  
  // Stores Team fields
  grossWeightObserved?: number;
  recordedBy?: string;
  recordedTimestamp?: string;
  destructionDoneBy?: string;
  destructionVerifiedBy?: string;
  storesRemarks?: string;
  
  // QA fields
  qaSignedOff?: boolean;
  qaTimestamp?: string;
  qaRemarks?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}
