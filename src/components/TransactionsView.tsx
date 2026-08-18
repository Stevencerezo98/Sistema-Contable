import React from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  FileText,
  Eye,
  Edit2,
  Trash2,
  Tags,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  X,
  CreditCard,
  Plus,
  Sparkles,
  Inbox
} from 'lucide-react';
import { Transaction, Tag, Category, User } from '../types';
import { AuthService } from '../services/auth';

interface TransactionsViewProps {
  transactions: Transaction[];
  tags: Tag[];
  categories: Category[];
  currentUser?: User | null;
  onOpenNewTransaction: (type?: 'ingreso' | 'egreso') => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onViewVoucher: (tx: Transaction) => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
  onLoadDemoData?: () => void;
  onClearAllData?: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  tags,
  categories,
  currentUser = null,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onViewVoucher,
  onExportExcel,
  onExportPdf,
  onLoadDemoData,
  onClearAllData,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<'todos' | 'ingreso' | 'egreso'>('todos');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('todas');
  const [tagFilter, setTagFilter] = React.useState<string>('todas');
  const [accountFilter, setAccountFilter] = React.useState<string>('todas');
  const [dateFrom, setDateFrom] = React.useState<string>('');
  const [dateTo, setDateTo] = React.useState<string>('');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const perms = AuthService.getUserPermissions(currentUser);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map((t) => t.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (!perms.canDeleteTransaction) return;
    if (window.confirm(`¿Está seguro de anular y eliminar los ${selectedIds.length} registros seleccionados?`)) {
      selectedIds.forEach((id) => onDeleteTransaction(id));
      setSelectedIds([]);
    }
  };

  // Filter logic
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      // Type
      if (typeFilter !== 'todos' && tx.type !== typeFilter) return false;

      // Category
      if (categoryFilter !== 'todas' && tx.category !== categoryFilter) return false;

      // Tag
      if (tagFilter !== 'todas' && !tx.tags.includes(tagFilter)) return false;

      // Account
      if (accountFilter !== 'todas' && tx.account !== accountFilter) return false;

      // Date Range
      if (dateFrom && tx.date < dateFrom) return false;
      if (dateTo && tx.date > dateTo) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesCode = tx.code.toLowerCase().includes(term);
        const matchesDesc = tx.description.toLowerCase().includes(term);
        const matchesBeneficiary = tx.beneficiaryOrDonor.toLowerCase().includes(term);
        const matchesVoucher = tx.voucherNumber.toLowerCase().includes(term);
        const matchesCategory = tx.category.toLowerCase().includes(term);
        return matchesCode || matchesDesc || matchesBeneficiary || matchesVoucher || matchesCategory;
      }

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, tagFilter, accountFilter, dateFrom, dateTo, searchTerm]);

  // Totals for filtered records
  const filteredIncome = React.useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'ingreso')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const filteredExpenses = React.useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'egreso')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('todos');
    setCategoryFilter('todas');
    setTagFilter('todas');
    setAccountFilter('todas');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters =
    searchTerm ||
    typeFilter !== 'todos' ||
    categoryFilter !== 'todas' ||
    tagFilter !== 'todas' ||
    accountFilter !== 'todas' ||
    dateFrom ||
    dateTo;

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Registro de Movimientos Contables
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Libro mayor de ingresos, egresos y comprobantes del Departamento de Comunicaciones
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onLoadDemoData && (
            <button
              onClick={onLoadDemoData}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span>Cargar Demo (10 Reg.)</span>
            </button>
          )}

          {perms.canExportExcel && (
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Excel</span>
            </button>
          )}

          {perms.canExportPdf && (
            <button
              onClick={onExportPdf}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <FileText className="h-4 w-4 text-rose-600" />
              <span>PDF</span>
            </button>
          )}

          {perms.canCreateTransaction && (
            <>
              <button
                onClick={() => onOpenNewTransaction('ingreso')}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <ArrowUpRight className="h-4 w-4" />
                <span>+ Ingreso</span>
              </button>

              <button
                onClick={() => onOpenNewTransaction('egreso')}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors"
              >
                <ArrowDownRight className="h-4 w-4" />
                <span>- Egreso</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, concepto, donante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="todos">Todos los Tipos</option>
              <option value="ingreso">Solo Ingresos (+)</option>
              <option value="egreso">Solo Egresos (-)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="todas">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.type === 'ingreso' ? '🟢' : '🔴'} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="todas">Todas las Etiquetas</option>
              {tags.map((t) => (
                <option key={t.id} value={t.name}>
                  #{t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="todas">Todas las Cuentas</option>
              <option value="Caja General Comunicaciones">Caja General</option>
              <option value="Banco Principal Iglesia">Banco Principal</option>
              <option value="Fondo de Reserva Equipamiento">Fondo Reserva</option>
              <option value="Caja Chica Producción">Caja Chica</option>
            </select>
          </div>
        </div>

        {/* Date Range & Active Filter Reset */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="h-3.5 w-3.5" /> Rango de Fecha:
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <span>hasta</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-rose-500 hover:text-rose-700 font-semibold"
            >
              <X className="h-3.5 w-3.5" />
              <span>Limpiar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Chips for Filtered Data & Batch Bar */}
      {transactions.length > 0 && (
        <div className="space-y-3">
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-indigo-600 px-4 py-2.5 text-white shadow-md animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>{selectedIds.length} movimientos seleccionados</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedIds([])}
                  className="rounded-lg bg-indigo-700/80 px-2.5 py-1 text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  Deseleccionar
                </button>
                {perms.canDeleteTransaction && (
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold hover:bg-rose-700 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Eliminar Seleccionados</span>
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="text-[10px] uppercase font-bold text-slate-400">Filtrados / Registros</div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {filteredTransactions.length}{' '}
                <span className="text-xs font-normal text-slate-400">de {transactions.length} movimientos</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                Ingresos en Vista
              </div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                +${filteredIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <div className="text-[10px] uppercase font-bold text-rose-500 dark:text-rose-400">
                Egresos en Vista
              </div>
              <div className="text-lg font-bold text-rose-500 dark:text-rose-400">
                -${filteredExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table / Empty State */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 dark:bg-slate-800/80 dark:text-slate-400">
              <tr>
                <th className="w-10 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={filteredTransactions.length > 0 && selectedIds.length === filteredTransactions.length}
                    onChange={toggleSelectAll}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Concepto & Comprobante</th>
                <th className="px-4 py-3">Categoría & Tags</th>
                <th className="px-4 py-3">Donante / Beneficiario</th>
                <th className="px-4 py-3">Cuenta</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-950/60 dark:text-indigo-400">
                        <Inbox className="h-6 w-6" />
                      </div>
                      <div className="max-w-md space-y-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {transactions.length === 0
                            ? 'Bóveda Contable Lista para Datos Reales'
                            : 'No hay movimientos que coincidan con los filtros'}
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {transactions.length === 0
                            ? 'La base de datos se encuentra limpia y lista para registrar los ingresos y egresos oficiales del ministerio.'
                            : 'Intenta modificar o limpiar los filtros seleccionados para ver otros registros.'}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 items-center justify-center">
                        {transactions.length === 0 && onLoadDemoData && (
                          <button
                            onClick={onLoadDemoData}
                            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs"
                          >
                            <Sparkles className="h-4 w-4" />
                            <span>Cargar Datos de Demostración</span>
                          </button>
                        )}
                        {perms.canCreateTransaction && (
                          <>
                            <button
                              onClick={() => onOpenNewTransaction('ingreso')}
                              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 shadow-xs"
                            >
                              <Plus className="h-4 w-4 text-emerald-400" />
                              <span>+ Registrar Primer Ingreso</span>
                            </button>
                            <button
                              onClick={() => onOpenNewTransaction('egreso')}
                              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            >
                              <Plus className="h-4 w-4 text-rose-500" />
                              <span>- Registrar Primer Egreso</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isSelected = selectedIds.includes(tx.id);
                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/50 ${
                        isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="w-10 px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(tx.id)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      {/* Code */}
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <span className="font-mono text-[11px]">{tx.code}</span>
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                        {new Date(tx.date).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Description & Voucher */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 max-w-[240px] truncate">
                          {tx.description}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>Recibo: {tx.voucherNumber}</span>
                          <span>•</span>
                          <span>Por: {tx.createdBy}</span>
                        </div>
                      </td>

                      {/* Category & Tags */}
                      <td className="px-4 py-3">
                        <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {tx.category}
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {tx.tags.map((tName) => {
                            const tagObj = tags.find((t) => t.name === tName);
                            return (
                              <span
                                key={tName}
                                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-2xs"
                                style={{ backgroundColor: tagObj?.color || '#3b82f6' }}
                              >
                                #{tName}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Donor / Beneficiary */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          {tx.beneficiaryOrDonor}
                        </div>
                        {tx.isDesignated && (
                          <span className="inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                            Fondo Designado
                          </span>
                        )}
                      </td>

                      {/* Account & Payment Method */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="text-slate-700 dark:text-slate-300">
                          {tx.account}
                        </div>
                        <div className="text-[10px] capitalize text-slate-400">
                          {tx.paymentMethod.replace('_', ' ')}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div
                          className={`text-sm font-bold ${
                            tx.type === 'ingreso'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {tx.type === 'ingreso' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-400">
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" /> Conciliado
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewVoucher(tx)}
                            title="Ver Comprobante Oficial"
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-blue-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {perms.canEditTransaction && (
                            <button
                              onClick={() => onEditTransaction(tx)}
                              title="Editar Movimiento"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {perms.canDeleteTransaction && (
                            <button
                              onClick={() => onDeleteTransaction(tx.id)}
                              title="Eliminar Registro"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-rose-950/30"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
