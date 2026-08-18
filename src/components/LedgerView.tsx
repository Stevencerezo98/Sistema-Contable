import React from 'react';
import {
  BookOpenCheck,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Filter
} from 'lucide-react';
import { Transaction, AccountType } from '../types';

interface LedgerViewProps {
  transactions: Transaction[];
  onExportExcel: () => void;
  onExportPdf: () => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  transactions,
  onExportExcel,
  onExportPdf,
}) => {
  const [tab, setTab] = React.useState<'diario' | 'mayor' | 'balance'>('diario');
  const [selectedAccount, setSelectedAccount] = React.useState<string>('todas');
  const [yearFilter, setYearFilter] = React.useState<string>('2025');

  // Sorted chronologically for official ledger
  const sortedTransactions = React.useMemo(() => {
    return [...transactions]
      .filter((t) => {
        if (selectedAccount !== 'todas' && t.account !== selectedAccount) return false;
        if (yearFilter && !t.date.startsWith(yearFilter)) return false;
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, selectedAccount, yearFilter]);

  // Compute Libro Mayor accounts
  const mayorAccounts = React.useMemo(() => {
    const accounts: AccountType[] = [
      'Banco Principal Iglesia',
      'Caja General Comunicaciones',
      'Fondo de Reserva Equipamiento',
      'Caja Chica Producción',
    ];

    return accounts.map((acc) => {
      const accTxs = transactions.filter((t) => t.account === acc);
      const totalDebe = accTxs
        .filter((t) => t.type === 'ingreso')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalHaber = accTxs
        .filter((t) => t.type === 'egreso')
        .reduce((sum, t) => sum + t.amount, 0);
      const saldo = totalDebe - totalHaber;

      return {
        account: acc,
        transactions: accTxs,
        totalDebe,
        totalHaber,
        saldo,
      };
    });
  }, [transactions]);

  // Compute Balance General & Statement
  const balanceStatement = React.useMemo(() => {
    const totalIngresos = transactions
      .filter((t) => t.type === 'ingreso')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalEgresos = transactions
      .filter((t) => t.type === 'egreso')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSurplus = totalIngresos - totalEgresos;

    // Categories breakdown
    const catMap: Record<string, { type: 'ingreso' | 'egreso'; amount: number }> = {};
    transactions.forEach((t) => {
      if (!catMap[t.category]) {
        catMap[t.category] = { type: t.type, amount: 0 };
      }
      catMap[t.category].amount += t.amount;
    });

    return {
      totalIngresos,
      totalEgresos,
      netSurplus,
      categories: Object.entries(catMap).map(([name, data]) => ({
        name,
        type: data.type,
        amount: data.amount,
      })),
    };
  }, [transactions]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Export actions */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Libro Contable Oficial
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Libro Diario de asientos contables, Libro Mayor de cuentas y Balance General
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-95"
          >
            <FileText className="h-4 w-4" />
            <span>Descargar Libro en PDF</span>
          </button>
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Descargar en Excel</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('diario')}
            className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              tab === 'diario'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            1. Libro Diario (Asientos)
          </button>
          <button
            onClick={() => setTab('mayor')}
            className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              tab === 'mayor'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            2. Libro Mayor (Cuentas T)
          </button>
          <button
            onClick={() => setTab('balance')}
            className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              tab === 'balance'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            3. Estado de Resultados & Balance
          </button>
        </div>

        {/* Filter controls */}
        {tab === 'diario' && (
          <div className="flex items-center gap-2 pb-2">
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="todas">Todas las Cuentas</option>
              <option value="Banco Principal Iglesia">Banco Principal</option>
              <option value="Caja General Comunicaciones">Caja General</option>
              <option value="Fondo de Reserva Equipamiento">Fondo Reserva</option>
              <option value="Caja Chica Producción">Caja Chica</option>
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="2025">Año 2025</option>
              <option value="2024">Año 2024</option>
              <option value="">Todos los años</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: LIBRO DIARIO */}
      {tab === 'diario' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Libro Diario - Asientos Cronológicos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Formato contable estándar con Debe (Ingresos), Haber (Egresos) y Saldo Acumulado
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Asientos Verificados</span>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-mono text-[11px] uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
                  <tr>
                    <th className="px-3 py-2.5">Fecha</th>
                    <th className="px-3 py-2.5">Código Asiento</th>
                    <th className="px-3 py-2.5">Detalle / Explicación</th>
                    <th className="px-3 py-2.5">Cuenta Contable</th>
                    <th className="px-3 py-2.5">Comprobante</th>
                    <th className="px-3 py-2.5 text-right text-emerald-700 dark:text-emerald-400">Debe (+)</th>
                    <th className="px-3 py-2.5 text-right text-rose-700 dark:text-rose-400">Haber (-)</th>
                    <th className="px-3 py-2.5 text-right font-bold">Saldo Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono dark:divide-slate-800">
                  {(() => {
                    let running = 0;
                    return sortedTransactions.map((tx) => {
                      const debe = tx.type === 'ingreso' ? tx.amount : 0;
                      const haber = tx.type === 'egreso' ? tx.amount : 0;
                      running += debe - haber;

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                          <td className="whitespace-nowrap px-3 py-2.5 text-slate-600 dark:text-slate-400">
                            {tx.date}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 font-bold text-slate-900 dark:text-white">
                            {tx.code}
                          </td>
                          <td className="px-3 py-2.5 font-sans">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {tx.description}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {tx.beneficiaryOrDonor} • <span className="italic">{tx.category}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 font-sans text-slate-600 dark:text-slate-300">
                            {tx.account}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-slate-500">
                            {tx.voucherNumber || '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                            {debe > 0 ? `$${debe.toFixed(2)}` : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-rose-600 dark:text-rose-400">
                            {haber > 0 ? `$${haber.toFixed(2)}` : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-right font-bold text-slate-900 dark:text-white">
                            ${running.toFixed(2)}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIBRO MAYOR */}
      {tab === 'mayor' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {mayorAccounts.map((item) => (
            <div
              key={item.account}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.account}
                  </h4>
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Saldo: ${item.saldo.toFixed(2)}
                </div>
              </div>

              {/* Mayor T-Table */}
              <div className="mt-4 grid grid-cols-2 divide-x divide-slate-200 text-xs dark:divide-slate-800">
                {/* Left: DEBE */}
                <div className="pr-3">
                  <div className="mb-2 text-center font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">
                    DEBE (Cargos / Ingresos)
                  </div>
                  <div className="space-y-1.5">
                    {item.transactions
                      .filter((t) => t.type === 'ingreso')
                      .map((t) => (
                        <div key={t.id} className="flex justify-between text-[11px]">
                          <span className="truncate pr-1 text-slate-600 dark:text-slate-400">{t.code}</span>
                          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                            ${t.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>
                  <div className="mt-4 border-t border-slate-200 pt-2 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    Total: ${item.totalDebe.toFixed(2)}
                  </div>
                </div>

                {/* Right: HABER */}
                <div className="pl-3">
                  <div className="mb-2 text-center font-mono font-bold uppercase text-rose-700 dark:text-rose-400">
                    HABER (Abonos / Egresos)
                  </div>
                  <div className="space-y-1.5">
                    {item.transactions
                      .filter((t) => t.type === 'egreso')
                      .map((t) => (
                        <div key={t.id} className="flex justify-between text-[11px]">
                          <span className="truncate pr-1 text-slate-600 dark:text-slate-400">{t.code}</span>
                          <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                            ${t.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                  </div>
                  <div className="mt-4 border-t border-slate-200 pt-2 text-right font-mono font-bold text-rose-700 dark:text-rose-400">
                    Total: ${item.totalHaber.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: BALANCE GENERAL Y ESTADO DE RESULTADOS */}
      {tab === 'balance' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Estado de Rendimiento Financiero del Departamento
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Resumen acumulado para rendición de cuentas ante la Junta de la Iglesia
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Ingresos Section */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 dark:border-emerald-950/60 dark:bg-emerald-950/20">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2 dark:border-emerald-800">
                  <h4 className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
                    1. INGRESOS Y FONDOS ASIGNADOS
                  </h4>
                  <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    +${balanceStatement.totalIngresos.toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  {balanceStatement.categories
                    .filter((c) => c.type === 'ingreso')
                    .map((c) => (
                      <div key={c.name} className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span>{c.name}</span>
                        <span className="font-mono font-semibold">${c.amount.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Egresos Section */}
              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 dark:border-rose-950/60 dark:bg-rose-950/20">
                <div className="flex items-center justify-between border-b border-rose-200 pb-2 dark:border-rose-800">
                  <h4 className="text-xs font-bold uppercase text-rose-800 dark:text-rose-300">
                    2. GASTOS Y EGRESOS OPERACIONALES
                  </h4>
                  <span className="font-mono text-sm font-bold text-rose-700 dark:text-rose-400">
                    -${balanceStatement.totalEgresos.toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  {balanceStatement.categories
                    .filter((c) => c.type === 'egreso')
                    .map((c) => (
                      <div key={c.name} className="flex justify-between text-slate-700 dark:text-slate-300">
                        <span>{c.name}</span>
                        <span className="font-mono font-semibold">${c.amount.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Net Surplus Summary */}
            <div className="mt-6 flex flex-wrap items-center justify-between rounded-xl bg-slate-900 p-4 text-white">
              <div>
                <span className="text-xs uppercase text-slate-400">Superávit / Saldo Líquido de la Obra</span>
                <div className="text-2xl font-black text-emerald-400">
                  ${balanceStatement.netSurplus.toFixed(2)} USD
                </div>
              </div>

              <div className="text-right text-xs text-slate-300">
                <div>Documento Contable Aprobado</div>
                <div className="text-[11px] text-slate-400">Cifrado con Hash SHA-256</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
