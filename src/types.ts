export type TransactionType = 'ingreso' | 'egreso';

export type PaymentMethod = 
  | 'efectivo' 
  | 'transferencia' 
  | 'tarjeta' 
  | 'cheque' 
  | 'caja_chica' 
  | 'donacion_en_linea';

export type AccountType = 
  | 'Caja General Comunicaciones' 
  | 'Banco Principal Iglesia' 
  | 'Fondo de Reserva Equipamiento' 
  | 'Caja Chica Producción';

export type TransactionStatus = 'completado' | 'pendiente' | 'conciliado';

export interface Tag {
  id: string;
  name: string;
  color: string; // e.g. '#3b82f6'
  description?: string;
  budgetCap?: number;
  icon?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
  description?: string;
  color?: string;
  defaultCodePrefix?: string;
}

export interface Transaction {
  id: string;
  code: string; // e.g. "ING-2025-001" or "EGR-2025-042"
  type: TransactionType;
  date: string; // YYYY-MM-DD
  amount: number;
  category: string;
  tags: string[]; // Tag IDs or names
  description: string;
  beneficiaryOrDonor: string; // Donante, Proveedor o Miembro
  paymentMethod: PaymentMethod;
  voucherNumber: string; // Nº Recibo o Factura
  account: AccountType;
  status: TransactionStatus;
  notes?: string;
  isDesignated?: boolean; // Fondo designado/etiquetado
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetGoal {
  id: string;
  categoryOrTag: string;
  allocatedAmount: number;
  currentSpent?: number;
  period: 'mensual' | 'anual';
  year: number;
  month?: number; // 1-12 if monthly
  notes?: string;
}

export type UserRole = 'director' | 'tesorero' | 'contador' | 'auditor' | 'operador' | 'admin';

export interface UserPermissions {
  canViewDashboard: boolean;
  canViewTransactions: boolean;
  canCreateTransaction: boolean;
  canEditTransaction: boolean;
  canDeleteTransaction: boolean;
  canViewLedger: boolean;
  canViewReports: boolean;
  canExportExcel: boolean;
  canExportPdf: boolean;
  canManageTags: boolean;
  canManageBudgets: boolean;
  canManageBackups: boolean;
  canManageSecurity: boolean;
  canManageUsers: boolean;
}

export interface RoleConfig {
  id: UserRole;
  name: string;
  description: string;
  badgeColor: string;
  defaultPermissions: UserPermissions;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email: string;
  avatarUrl?: string;
  biometricRegistered?: boolean;
  biometricCredentialId?: string;
  lastLogin?: string;
  customPermissions?: Partial<UserPermissions>;
  phone?: string;
  positionTitle?: string;
}

export interface CloudBackupSnapshot {
  id: string;
  timestamp: string;
  version: string;
  recordCount: number;
  tagCount: number;
  cloudProvider: 'Servidor Seguro Iglesia' | 'Google Drive' | 'Microsoft OneDrive' | 'Local Cifrado';
  fileSizeKb: number;
  sha256Hash: string;
  isEncrypted: boolean;
  status: 'completado' | 'sincronizado' | 'alerta';
  createdBy: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 
    | 'LOGIN' 
    | 'BIOMETRIC_AUTH' 
    | 'LOGOUT' 
    | 'LOCK' 
    | 'UNLOCK' 
    | 'TRANSACTION_CREATE' 
    | 'TRANSACTION_UPDATE' 
    | 'TRANSACTION_DELETE' 
    | 'EXPORT_EXCEL' 
    | 'EXPORT_PDF' 
    | 'BACKUP_CREATE' 
    | 'BACKUP_RESTORE' 
    | 'TAG_MANAGE' 
    | 'TAG_UPDATE'
    | 'TAG_DELETE'
    | 'CATEGORY_UPDATE'
    | 'CATEGORY_DELETE'
    | 'BUDGET_UPDATE'
    | 'USER_CREATE'
    | 'USER_UPDATE'
    | 'USER_DELETE'
    | 'ROLE_UPDATE'
    | 'SETTINGS_CHANGE';
  details: string;
  ipOrDevice: string;
  status: 'EXITO' | 'ADVERTENCIA' | 'ERROR';
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  currentMonthNet: number;
  previousMonthIncome?: number;
  previousMonthExpenses?: number;
  pendingTransactionsCount: number;
}
