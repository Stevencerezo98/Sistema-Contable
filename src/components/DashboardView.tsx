import React from 'react';
import {
  Plus,
  Eye,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Database,
  Trash2,
  Inbox,
  ArrowRight,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Transaction, Tag, Category, FinancialSummary } from '../types';

interface DashboardViewProps {
  transactions: Transaction[];
  tags: Tag[];
  categories: Category[];
  summary: FinancialSummary;
  onOpenNewTransaction: (type?: 'ingreso' | 'egreso') => void;
  onNavigate: (view: string) => void;
  onViewVoucher: (tx: Transaction) => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onLoadDemoData?: () => void;
  onClearAllData?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  summary,
  onOpenNewTransaction,
  onNavigate,
  onViewVoucher,
  onExportExcel,
  onExportPdf,
  onLoadDemoData,
  onClearAllData,
}) => {
  // Process monthly data dynamically from actual transactions
  const monthlyBarData = React.useMemo(() => {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const currentYear = now.getFullYear();

    // Map all 12 months
    const monthlyMap: Record<number, { ingresos: number; egresos: number }> = {};
    for (let i = 0; i < 12; i++) {
      monthlyMap[i] = { ingresos: 0, egresos: 0 };
    }

    transactions.forEach((tx) => {
      const d = new Date(tx.date);
      const m = d.getMonth();
      if (tx.type === 'ingreso') {
        monthlyMap[m].ingresos += tx.amount;
      } else {
        monthlyMap[m].egresos += tx.amount;
      }
    });

    // Select the current and preceding 5 months
    const recent6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const net = monthlyMap[mIdx].ingresos - monthlyMap[mIdx].egresos;
      const totalVolume = monthlyMap[mIdx].ingresos + monthlyMap[mIdx].egresos;
      recent6Months.push({
        name: monthNames[mIdx].toUpperCase(),
        amount: `$${(monthlyMap[mIdx].ingresos / 1000).toFixed(1)}k`,
        value: monthlyMap[mIdx].ingresos || (transactions.length === 0 ? 0 : 50),
        height: totalVolume > 0 ? `${Math.min(100, Math.max(15, Math.round((monthlyMap[mIdx].ingresos / (summary.totalIncome || 1)) * 100)))}%` : '10%',
      });
    }

    return recent6Months;
  }, [transactions, summary]);

  // Recent transactions (last 6)
  const recentTransactions = React.useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [transactions]);

  // Expenses distribution
  const expenseCategories = React.useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'egreso');
    const total = expenses.reduce((s, t) => s + t.amount, 0) || 1;
    const catMap: Record<string, number> = {};
    expenses.forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    return Object.entries(catMap)
      .map(([name, val]) => ({
        name,
        percentage: Math.round((val / total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Demo helper banner if 0 transactions or quick tools */}
      {transactions.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-blue-50 p-6 shadow-xs dark:border-indigo-900/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-sm shrink-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Bóveda Contable Lista y Desencriptada
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Puedes registrar tus movimientos reales del departamento o cargar 10 registros de demostración con datos representativos (equipos, streaming, software, licencias).
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {onLoadDemoData && (
                <button
                  onClick={onLoadDemoData}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                >
                  <Database className="h-4 w-4" />
                  <span>Cargar Datos de Ejemplo (Demo)</span>
                </button>
              )}
              <button
                onClick={() => onOpenNewTransaction('ingreso')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
              >
                <Plus className="h-4 w-4 text-emerald-600" />
                <span>+ Primer Ingreso</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>{transactions.length} movimientos registrados en bóveda</span>
          </div>
          <div className="flex items-center gap-2">
            {onLoadDemoData && (
              <button
                onClick={onLoadDemoData}
                title="Recargar datos de ejemplo"
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold px-2 py-1 rounded-lg hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-slate-800"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Recargar Demo</span>
              </button>
            )}
            {onClearAllData && (
              <button
                onClick={onClearAllData}
                title="Vaciar bóveda"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Vaciar Bóveda</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4-Column Metric Cards & Action Panel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Ingresos Mensuales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Ingresos
            </p>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
            ${summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1 dark:text-emerald-400">
            <ArrowUpRight className="h-3 w-3" /> Depto. Comunicaciones
          </div>
        </div>

        {/* Card 2: Egresos Mensuales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Egresos
            </p>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
            ${summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-2 text-[10px] text-rose-500 font-bold flex items-center gap-1 dark:text-rose-400">
            <ArrowDownRight className="h-3 w-3" /> Gastos Ejecutados
          </div>
        </div>

        {/* Card 3: Saldo Disponible */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Saldo Neto Disponible
            </p>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <p className={`text-2xl font-bold mt-2 ${summary.netBalance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600'}`}>
            ${summary.netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-2 text-[10px] text-slate-400 font-medium">
            Bóveda Cifrada AES-256
          </div>
        </div>

        {/* Card 4: Quick Action buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => onOpenNewTransaction('ingreso')}
              className="flex-1 bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-2xs py-2.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Ingreso</span>
            </button>
            <button
              onClick={() => onOpenNewTransaction('egreso')}
              className="flex-1 bg-rose-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-700 transition-colors shadow-2xs py-2.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Egreso</span>
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onExportExcel}
              className="flex-1 py-2 border border-slate-200 bg-white rounded-lg text-[10px] font-bold uppercase tracking-tighter hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
            >
              <FileSpreadsheet className="h-3 w-3 text-emerald-600" />
              <span>Excel</span>
            </button>
            <button
              onClick={onExportPdf}
              className="flex-1 py-2 border border-slate-200 bg-white rounded-lg text-[10px] font-bold uppercase tracking-tighter hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
            >
              <FileText className="h-3 w-3 text-rose-600" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Libro de Contabilidad (Recientes) & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Libro de Movimientos Recientes
              </h3>
              <p className="text-[11px] text-slate-400">
                Últimos registros auditados y certificados en la bóveda
              </p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-1"
            >
              <span>Ver Todos ({transactions.length})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentTransactions.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Descripción</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3 text-right">Monto</th>
                    <th className="px-3 py-3 text-center">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-50 dark:divide-slate-800">
                  {recentTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">
                        {t.code}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap dark:text-slate-400">
                        {new Date(t.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                        {t.description}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {t.beneficiaryOrDonor} • {t.voucherNumber || 'Sin comprobante'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-medium dark:bg-indigo-950/60 dark:text-indigo-300">
                          {t.category}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold whitespace-nowrap ${
                          t.type === 'ingreso' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {t.type === 'ingreso' ? '+' : '-'}${t.amount.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => onViewVoucher(t)}
                          title="Ver Comprobante Oficial"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 dark:bg-slate-800 mb-3">
                  <Inbox className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No hay movimientos registrados todavía
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1 mb-4">
                  Comienza agregando un nuevo ingreso o egreso, o carga los datos de demostración con 1 click.
                </p>
                <div className="flex items-center gap-2">
                  {onLoadDemoData && (
                    <button
                      onClick={onLoadDemoData}
                      className="flex items-center gap-1.5 bg-indigo-600 text-white rounded-lg px-3 py-2 text-xs font-bold hover:bg-indigo-700"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Cargar Demo</span>
                    </button>
                  )}
                  <button
                    onClick={() => onOpenNewTransaction()}
                    className="flex items-center gap-1.5 border border-slate-300 bg-white text-slate-700 rounded-lg px-3 py-2 text-xs font-bold hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Crear Registro</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Flujo Mensual & Distribución */}
        <div className="flex flex-col gap-6">
          {/* Flujo Mensual Indigo Bars */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col flex-1 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Flujo de Ingresos Recientes
              </h3>
              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                Últimos 6 meses
              </span>
            </div>
            <div className="flex-1 flex items-end justify-between gap-2 pb-2 min-h-[140px]">
              {monthlyBarData.map((bar) => (
                <div key={bar.name} className="w-full flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-indigo-200 rounded-t-lg relative group transition-all hover:bg-indigo-600 dark:bg-indigo-900/60 dark:hover:bg-indigo-500"
                    style={{ height: bar.height }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-indigo-600 bg-white px-1.5 py-0.5 rounded shadow-xs opacity-0 group-hover:opacity-100 transition-opacity dark:bg-slate-800 dark:text-indigo-300 pointer-events-none whitespace-nowrap z-10">
                      {bar.amount}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                    {bar.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribución de Gastos */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-4">
              Distribución de Gastos por Categoría
            </h3>
            <div className="space-y-3">
              {expenseCategories.length > 0 ? (
                expenseCategories.map((cat, idx) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400 truncate max-w-[180px]">{cat.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{cat.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-emerald-500' : idx === 2 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">
                  Sin egresos registrados actualmente.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

