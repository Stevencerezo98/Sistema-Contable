import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  X,
  RefreshCw,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import {
  Transaction,
  User,
  Tag,
  Category,
  BudgetGoal,
  CloudBackupSnapshot,
  AuditLogEntry,
  FinancialSummary
} from './types';
import { AuthService } from './services/auth';
import { StorageService } from './services/storage';
import { ExcelExportService } from './services/exportExcel';
import { PdfExportService } from './services/exportPdf';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { LedgerView } from './components/LedgerView';
import { ReportsView } from './components/ReportsView';
import { TagsManagerView } from './components/TagsManagerView';
import { BudgetsView } from './components/BudgetsView';
import { CloudBackupView } from './components/CloudBackupView';
import { SecurityView } from './components/SecurityView';
import { UsersRolesView } from './components/UsersRolesView';
import { TransactionModal } from './components/TransactionModal';
import { VoucherModal } from './components/VoucherModal';
import { LockScreen } from './components/LockScreen';
import { ConfirmModal } from './components/ConfirmModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Authentication & Security state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Core Data state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<BudgetGoal[]>([]);
  const [backups, setBackups] = useState<CloudBackupSnapshot[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Modals state
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [viewingVoucherTransaction, setViewingVoucherTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);

  // Theme & Notifications
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('comms_dark_mode') === 'true';
  });
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const [isLoadingVault, setIsLoadingVault] = useState(true);

  // Notification helper
  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  // Current effective permissions
  const perms = useMemo(() => {
    return AuthService.getUserPermissions(currentUser);
  }, [currentUser]);

  // Theme sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('comms_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('comms_dark_mode', 'false');
    }
  }, [darkMode]);

  // Initial Data & Vault Loading
  const loadAllVaultData = useCallback(async () => {
    setIsLoadingVault(true);
    try {
      // 1. Load active user & users list
      const uList = AuthService.getUsers();
      setUsers(uList);
      let curr = AuthService.getCurrentUser();
      if (!curr) {
        curr = uList[0];
        AuthService.setCurrentUser(curr);
      }
      setCurrentUser(curr);

      // 2. Load Decrypted Transactions from Local Encrypted Storage
      const txs = await StorageService.getTransactions();
      setTransactions(txs);

      // 3. Load Auxiliary Data (Tags, Categories, Budgets, Backups, Logs)
      const tgs = StorageService.getTags();
      setTags(tgs);

      const cats = StorageService.getCategories();
      setCategories(cats);

      const bgs = StorageService.getBudgets();
      setBudgets(bgs);

      const bkps = StorageService.getCloudBackups();
      setBackups(bkps);

      const logs = AuthService.getAuditLogs();
      setAuditLogs(logs);
    } catch (err: any) {
      showNotification('Error al inicializar la bóveda criptográfica: ' + (err.message || ''), 'error');
    } finally {
      setIsLoadingVault(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadAllVaultData();
  }, [loadAllVaultData]);

  // Computed Financial Summary
  const summary: FinancialSummary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === 'ingreso')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'egreso')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpenses;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthTxs = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const currentMonthIncome = currentMonthTxs
      .filter((t) => t.type === 'ingreso')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentMonthExpenses = currentMonthTxs
      .filter((t) => t.type === 'egreso')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentMonthNet = currentMonthIncome - currentMonthExpenses;

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      currentMonthIncome: currentMonthIncome || totalIncome,
      currentMonthExpenses: currentMonthExpenses || totalExpenses,
      currentMonthNet: currentMonthNet || netBalance,
      pendingTransactionsCount: transactions.filter((t) => t.status === 'pendiente').length,
    };
  }, [transactions]);

  // Transaction Handlers
  const handleSaveTransaction = async (txData: Omit<Transaction, 'id' | 'code' | 'createdBy' | 'createdAt'>) => {
    if (!perms.canCreateTransaction && !editingTransaction) {
      showNotification('Tu rol no tiene permiso para crear registros contables.', 'error');
      return;
    }
    if (!perms.canEditTransaction && editingTransaction) {
      showNotification('Tu rol no tiene permiso para editar registros contables.', 'error');
      return;
    }

    try {
      let updatedList: Transaction[] = [];
      const user = currentUser?.fullName || 'Tesorero';

      if (editingTransaction) {
        const updatedTx: Transaction = {
          ...editingTransaction,
          ...txData,
        };
        updatedList = transactions.map((t) => (t.id === editingTransaction.id ? updatedTx : t));
        AuthService.logAudit('TRANSACTION_UPDATE', `Movimiento modificado: ${updatedTx.code} (${updatedTx.description})`);
        showNotification(`Movimiento ${updatedTx.code} actualizado correctamente.`, 'success');
      } else {
        const codeNum = transactions.length + 1001;
        const codePrefix = txData.type === 'ingreso' ? 'ING' : 'EGR';
        const newTx: Transaction = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          code: `${codePrefix}-${codeNum}`,
          createdBy: user,
          createdAt: new Date().toISOString(),
          ...txData,
        };
        updatedList = [newTx, ...transactions];
        AuthService.logAudit('TRANSACTION_CREATE', `Nuevo registro: ${newTx.code} por $${newTx.amount.toFixed(2)} (${newTx.description})`);
        showNotification(`Movimiento contable ${newTx.code} registrado con éxito.`, 'success');
      }

      await StorageService.saveTransactions(updatedList);
      setTransactions(updatedList);
      setAuditLogs(AuthService.getAuditLogs());
      setIsTransactionModalOpen(false);
      setEditingTransaction(null);
    } catch (err: any) {
      showNotification('Error al guardar en bóveda cifrada: ' + (err.message || ''), 'error');
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (!perms.canDeleteTransaction) {
      showNotification('Tu rol no tiene permiso para anular o eliminar registros contables.', 'error');
      return;
    }

    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;
    setTransactionToDelete(tx);
  };

  const handleConfirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    try {
      const updatedList = transactions.filter((t) => t.id !== transactionToDelete.id);
      await StorageService.saveTransactions(updatedList);
      setTransactions(updatedList);
      AuthService.logAudit('TRANSACTION_DELETE', `Registro anulado: ${transactionToDelete.code} ($${transactionToDelete.amount.toFixed(2)})`);
      setAuditLogs(AuthService.getAuditLogs());
      showNotification(`Registro ${transactionToDelete.code} eliminado de la contabilidad.`, 'info');
    } catch (err: any) {
      showNotification('Error al eliminar registro: ' + (err.message || ''), 'error');
    } finally {
      setTransactionToDelete(null);
    }
  };

  // Tag & Category Handlers
  const handleSaveTag = (tag: Tag) => {
    if (!perms.canManageTags) {
      showNotification('No tienes permiso para gestionar categorías o etiquetas.', 'error');
      return;
    }
    StorageService.saveTag(tag);
    setTags(StorageService.getTags());
    showNotification(`Etiqueta #${tag.name} guardada correctamente.`, 'success');
  };

  const handleDeleteTag = (tagId: string) => {
    if (!perms.canManageTags) {
      showNotification('No tienes permiso para eliminar etiquetas.', 'error');
      return;
    }
    StorageService.deleteTag(tagId);
    setTags(StorageService.getTags());
    showNotification('Etiqueta eliminada.', 'info');
  };

  const handleSaveCategory = (cat: Category) => {
    if (!perms.canManageTags) {
      showNotification('No tienes permiso para gestionar categorías.', 'error');
      return;
    }
    StorageService.saveCategory(cat);
    setCategories(StorageService.getCategories());
    showNotification(`Categoría "${cat.name}" guardada correctamente.`, 'success');
  };

  const handleDeleteCategory = (catId: string) => {
    if (!perms.canManageTags) {
      showNotification('No tienes permiso para eliminar categorías.', 'error');
      return;
    }
    StorageService.deleteCategory(catId);
    setCategories(StorageService.getCategories());
    showNotification('Categoría eliminada.', 'info');
  };

  // Budget Handlers
  const handleSaveBudget = (bg: BudgetGoal) => {
    if (!perms.canManageBudgets) {
      showNotification('No tienes permiso para gestionar presupuestos.', 'error');
      return;
    }
    StorageService.saveBudget(bg);
    setBudgets(StorageService.getBudgets());
    showNotification(`Presupuesto para ${bg.categoryOrTag} guardado.`, 'success');
  };

  const handleDeleteBudget = (bgId: string) => {
    if (!perms.canManageBudgets) {
      showNotification('No tienes permiso para eliminar presupuestos.', 'error');
      return;
    }
    StorageService.deleteBudget(bgId);
    setBudgets(StorageService.getBudgets());
    showNotification('Techo presupuestario eliminado.', 'info');
  };

  // Export handlers
  const handleExportExcel = () => {
    if (!perms.canExportExcel) {
      showNotification('Tu rol no tiene permiso para exportar a Excel.', 'error');
      return;
    }
    ExcelExportService.exportFinancialReport(transactions, tags, categories, 'Libro Contable - Departamento de Comunicaciones');
    setAuditLogs(AuthService.getAuditLogs());
    showNotification('Libro contable descargado en formato Excel (.xlsx)', 'success');
  };

  const handleExportPdf = () => {
    if (!perms.canExportPdf) {
      showNotification('Tu rol no tiene permiso para exportar a PDF.', 'error');
      return;
    }
    PdfExportService.exportLedgerReport(transactions, tags, categories, 'LIBRO CONTABLE GENERAL - DEPARTAMENTO DE COMUNICACIONES');
    setAuditLogs(AuthService.getAuditLogs());
    showNotification('Libro contable oficial generado en PDF', 'success');
  };

  // Demo & Reset Handlers
  const handleLoadDemoData = async () => {
    try {
      const data = await StorageService.loadDemoData();
      setTransactions(data);
      setAuditLogs(AuthService.getAuditLogs());
      showNotification('¡Datos de demostración cargados con éxito! 10 movimientos contables disponibles para análisis.', 'success');
    } catch (err: any) {
      showNotification('Error al cargar datos de demostración: ' + (err.message || ''), 'error');
    }
  };

  const handleClearAllData = () => {
    if (!perms.canDeleteTransaction) {
      showNotification('Tu rol no tiene permisos para vaciar la contabilidad.', 'error');
      return;
    }
    setIsClearAllModalOpen(true);
  };

  const handleConfirmClearAllData = async () => {
    try {
      await StorageService.clearAllData();
      setTransactions([]);
      setAuditLogs(AuthService.getAuditLogs());
      showNotification('Bóveda contable vaciada a cero correctamente.', 'info');
    } catch (err: any) {
      showNotification('Error al vaciar datos: ' + (err.message || ''), 'error');
    } finally {
      setIsClearAllModalOpen(false);
    }
  };

  // Check if current view is authorized for the user
  const isViewAuthorized = useMemo(() => {
    switch (currentView) {
      case 'dashboard':
        return perms.canViewDashboard;
      case 'transactions':
        return perms.canViewTransactions;
      case 'ledger':
        return perms.canViewLedger;
      case 'reports':
        return perms.canViewReports;
      case 'tags':
        return perms.canManageTags;
      case 'budgets':
        return perms.canManageBudgets;
      case 'users-roles':
        return perms.canManageUsers || currentUser?.role === 'director' || currentUser?.role === 'admin';
      case 'backup':
        return perms.canManageBackups;
      case 'security':
        return perms.canManageSecurity;
      default:
        return true;
    }
  }, [currentView, perms, currentUser]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {notification.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
          {notification.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />}
          {notification.type === 'info' && <Info className="h-4 w-4 text-indigo-500 shrink-0" />}
          <span className="text-slate-800 dark:text-slate-200">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Lock Screen Overlay */}
      {isLocked && (
        <LockScreen
          currentUser={currentUser}
          onUnlock={() => setIsLocked(false)}
          onShowNotification={showNotification}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        users={users}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setIsAuthModalOpen(false);
          setAuditLogs(AuthService.getAuditLogs());
          // If previous view is not accessible to new role, switch to dashboard or transactions
          const newPerms = AuthService.getUserPermissions(u);
          if (!newPerms.canViewDashboard && newPerms.canViewTransactions) {
            setCurrentView('transactions');
          } else {
            setCurrentView('dashboard');
          }
        }}
        onShowNotification={showNotification}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        transaction={editingTransaction}
        tags={tags}
        categories={categories}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
      />

      {/* Voucher Modal */}
      <VoucherModal
        transaction={viewingVoucherTransaction}
        onClose={() => setViewingVoucherTransaction(null)}
      />

      {/* Header */}
      <Navbar
        currentUser={currentUser}
        onLockSession={() => setIsLocked(true)}
        onSwitchUser={() => setIsAuthModalOpen(true)}
        onToggleTheme={() => setDarkMode(!darkMode)}
        darkMode={darkMode}
        onNewTransaction={() => {
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        onNavigate={setCurrentView}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          summary={summary}
          currentUser={currentUser}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
        />

        {/* Dynamic View Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto min-w-0">
          {isLoadingVault ? (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm font-medium">Desencriptando bóveda local AES-256...</p>
            </div>
          ) : !isViewAuthorized ? (
            /* Access Denied Card */
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center dark:bg-amber-950/60 dark:text-amber-400 mb-4">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Módulo Restringido
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1 mb-6">
                Tu usuario actual ({currentUser?.fullName}) con rol <strong>{currentUser?.role}</strong> no tiene permisos configurados para acceder a esta sección.
              </p>
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Resumen Principal</span>
              </button>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && (
                <DashboardView
                  transactions={transactions}
                  tags={tags}
                  categories={categories}
                  summary={summary}
                  onOpenNewTransaction={(type) => {
                    setEditingTransaction(null);
                    setIsTransactionModalOpen(true);
                  }}
                  onNavigate={setCurrentView}
                  onViewVoucher={(tx) => setViewingVoucherTransaction(tx)}
                  onExportExcel={handleExportExcel}
                  onExportPdf={handleExportPdf}
                  onLoadDemoData={handleLoadDemoData}
                  onClearAllData={handleClearAllData}
                />
              )}

              {currentView === 'transactions' && (
                <TransactionsView
                  transactions={transactions}
                  tags={tags}
                  categories={categories}
                  currentUser={currentUser}
                  onOpenNewTransaction={(type) => {
                    setEditingTransaction(null);
                    setIsTransactionModalOpen(true);
                  }}
                  onEditTransaction={(tx) => {
                    setEditingTransaction(tx);
                    setIsTransactionModalOpen(true);
                  }}
                  onDeleteTransaction={handleDeleteTransaction}
                  onViewVoucher={(tx) => setViewingVoucherTransaction(tx)}
                  onExportExcel={handleExportExcel}
                  onExportPdf={handleExportPdf}
                  onLoadDemoData={handleLoadDemoData}
                  onClearAllData={handleClearAllData}
                />
              )}

              {currentView === 'ledger' && (
                <LedgerView
                  transactions={transactions}
                  onExportExcel={handleExportExcel}
                  onExportPdf={handleExportPdf}
                />
              )}

              {currentView === 'reports' && (
                <ReportsView
                  transactions={transactions}
                  tags={tags}
                  categories={categories}
                  onExportExcel={handleExportExcel}
                  onExportPdf={handleExportPdf}
                />
              )}

              {currentView === 'tags' && (
                <TagsManagerView
                  tags={tags}
                  categories={categories}
                  transactions={transactions}
                  onSaveTag={handleSaveTag}
                  onDeleteTag={handleDeleteTag}
                  onSaveCategory={handleSaveCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onNavigateToTransactionsWithTag={(tName) => {
                    setCurrentView('transactions');
                  }}
                />
              )}

              {currentView === 'budgets' && (
                <BudgetsView
                  budgets={budgets}
                  transactions={transactions}
                  categories={categories}
                  onSaveBudget={handleSaveBudget}
                  onDeleteBudget={handleDeleteBudget}
                />
              )}

              {currentView === 'users-roles' && (
                <UsersRolesView
                  currentUser={currentUser}
                  users={users}
                  onRefreshUsers={() => setUsers(AuthService.getUsers())}
                  onShowNotification={showNotification}
                  onSwitchToUser={(user) => {
                    setCurrentUser(user);
                    AuthService.setCurrentUser(user);
                    setAuditLogs(AuthService.getAuditLogs());
                    showNotification(`Sesión cambiada a: ${user.fullName} (${user.role})`, 'success');
                  }}
                />
              )}

              {currentView === 'backup' && (
                <CloudBackupView
                  backups={backups}
                  onRefreshBackups={() => setBackups(StorageService.getCloudBackups())}
                  onShowNotification={showNotification}
                  onReloadAllData={loadAllVaultData}
                />
              )}

              {currentView === 'security' && (
                <SecurityView
                  currentUser={currentUser}
                  users={users}
                  auditLogs={auditLogs}
                  onRefreshLogs={() => setAuditLogs(AuthService.getAuditLogs())}
                  onShowNotification={showNotification}
                  onRefreshUser={() => setCurrentUser(AuthService.getCurrentUser())}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Clean Minimalism Footer */}
      <footer className="h-8 bg-slate-100 px-6 flex items-center justify-between text-[9px] text-slate-400 uppercase tracking-widest border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800 shrink-0">
        <span>© 2025 Ecclesia Finance • Depto. Comunicaciones | Cifrado Activo</span>
        <span className="hidden sm:inline">Bóveda: AES-256 | Control de Acceso: RBAC Granular</span>
      </footer>

      {/* Delete Transaction Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(transactionToDelete)}
        title="Anular / Eliminar Registro Contable"
        message={`¿Confirma la anulación definitiva del registro ${transactionToDelete?.code} ("${transactionToDelete?.description}") por valor de $${transactionToDelete?.amount?.toFixed(2)}?`}
        confirmText="Sí, Eliminar Registro"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleConfirmDeleteTransaction}
        onCancel={() => setTransactionToDelete(null)}
      />

      {/* Clear All Data Confirm Modal */}
      <ConfirmModal
        isOpen={isClearAllModalOpen}
        title="Vaciar Toda la Bóveda Contable"
        message="¿Está completamente seguro de que desea vaciar TODOS los movimientos contables registrados? Esta acción eliminará los registros de ingresos y egresos de la base de datos."
        confirmText="Sí, Vaciar Todo"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleConfirmClearAllData}
        onCancel={() => setIsClearAllModalOpen(false)}
      />
    </div>
  );
}
