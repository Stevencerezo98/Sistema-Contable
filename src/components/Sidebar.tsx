import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BookOpenCheck,
  BarChart3,
  Tags,
  Target,
  Cloud,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Lock,
  Users,
  ShieldAlert
} from 'lucide-react';
import { FinancialSummary, User } from '../types';
import { AuthService } from '../services/auth';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  summary: FinancialSummary;
  currentUser: User | null;
  onExportExcel: () => void;
  onExportPdf: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  summary,
  currentUser,
  onExportExcel,
  onExportPdf,
}) => {
  const perms = AuthService.getUserPermissions(currentUser);

  const allNavItems = [
    {
      id: 'dashboard',
      label: 'Resumen',
      icon: LayoutDashboard,
      visible: perms.canViewDashboard,
    },
    {
      id: 'transactions',
      label: 'Movimientos',
      icon: ArrowLeftRight,
      visible: perms.canViewTransactions,
      badge: summary.pendingTransactionsCount > 0 ? `${summary.pendingTransactionsCount}` : undefined,
    },
    {
      id: 'ledger',
      label: 'Libro Diario',
      icon: BookOpenCheck,
      visible: perms.canViewLedger,
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: BarChart3,
      visible: perms.canViewReports,
    },
    {
      id: 'tags',
      label: 'Categorías y Tags',
      icon: Tags,
      visible: perms.canManageTags,
    },
    {
      id: 'budgets',
      label: 'Presupuestos',
      icon: Target,
      visible: perms.canManageBudgets,
    },
    {
      id: 'users-roles',
      label: 'Usuarios y Roles',
      icon: Users,
      visible: perms.canManageUsers || currentUser?.role === 'director' || currentUser?.role === 'admin',
    },
    {
      id: 'backup',
      label: 'Sincronización',
      icon: Cloud,
      visible: perms.canManageBackups,
    },
    {
      id: 'security',
      label: 'Seguridad',
      icon: ShieldCheck,
      visible: perms.canManageSecurity,
    },
  ];

  const visibleNavItems = allNavItems.filter((item) => item.visible);

  return (
    <aside className="flex flex-col gap-3 p-4 bg-slate-50 border-r border-slate-200 dark:bg-slate-900 dark:border-slate-800 lg:w-60 shrink-0">
      {/* Role Indicator Banner */}
      {currentUser && (
        <div className="px-3 py-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs dark:bg-slate-800 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-400">
              Rol Activo
            </span>
            <span className="text-[10px] font-bold text-indigo-600 uppercase dark:text-indigo-400">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-white truncate mt-0.5">
            {currentUser.fullName}
          </p>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="space-y-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Export actions if permitted */}
      {(perms.canExportExcel || perms.canExportPdf) && (
        <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-800/90">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
            Exportar Datos
          </div>
          <div className="flex gap-2">
            {perms.canExportExcel && (
              <button
                onClick={onExportExcel}
                className="flex-1 py-1.5 border border-slate-200 bg-white rounded-lg text-[10px] font-bold uppercase tracking-tighter hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-1 transition-colors"
              >
                <FileSpreadsheet className="h-3 w-3 text-emerald-600" />
                <span>Excel</span>
              </button>
            )}
            {perms.canExportPdf && (
              <button
                onClick={onExportPdf}
                className="flex-1 py-1.5 border border-slate-200 bg-white rounded-lg text-[10px] font-bold uppercase tracking-tighter hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 flex items-center justify-center gap-1 transition-colors"
              >
                <FileText className="h-3 w-3 text-rose-600" />
                <span>PDF</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Clean Minimalism Security Box */}
      <div className="mt-auto p-4 bg-indigo-900 rounded-xl text-white shadow-xs">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] uppercase tracking-widest text-indigo-200 font-semibold">Seguridad</p>
          <Lock className="h-3 w-3 text-indigo-300" />
        </div>
        <p className="text-xs font-light leading-relaxed text-indigo-100">
          Cifrado de extremo a extremo activo para transferencias y bóveda AES-256.
        </p>
      </div>
    </aside>
  );
};
