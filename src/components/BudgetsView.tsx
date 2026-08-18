import React from 'react';
import {
  Target,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  X,
  Edit2,
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { BudgetGoal, Transaction, Category } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface BudgetsViewProps {
  budgets: BudgetGoal[];
  transactions: Transaction[];
  categories: Category[];
  onSaveBudget: (bg: BudgetGoal) => void;
  onDeleteBudget: (id: string) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  transactions,
  categories,
  onSaveBudget,
  onDeleteBudget,
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingBudget, setEditingBudget] = React.useState<BudgetGoal | null>(null);
  const [budgetToDelete, setBudgetToDelete] = React.useState<BudgetGoal | null>(null);

  const [categoryOrTag, setCategoryOrTag] = React.useState('');
  const [allocatedAmount, setAllocatedAmount] = React.useState<string>('500');
  const [period, setPeriod] = React.useState<'mensual' | 'anual'>('mensual');
  const [year, setYear] = React.useState<number>(2025);
  const [notes, setNotes] = React.useState('');

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setCategoryOrTag(categories.filter((c) => c.type === 'egreso')[0]?.name || 'Equipamiento Audiovisual');
    setAllocatedAmount('500');
    setPeriod('mensual');
    setYear(2025);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bg: BudgetGoal) => {
    setEditingBudget(bg);
    setCategoryOrTag(bg.categoryOrTag);
    setAllocatedAmount(bg.allocatedAmount.toString());
    setPeriod(bg.period);
    setYear(bg.year);
    setNotes(bg.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(allocatedAmount);
    if (isNaN(amount) || amount <= 0) return;

    const bg: BudgetGoal = {
      id: editingBudget ? editingBudget.id : `bg_${Date.now()}`,
      categoryOrTag,
      allocatedAmount: amount,
      period,
      year,
      notes: notes.trim(),
    };

    onSaveBudget(bg);
    setIsModalOpen(false);
  };

  // Compute execution for each budget goal
  const budgetStats = React.useMemo(() => {
    return budgets.map((bg) => {
      // Find matching transactions
      const matchingTxs = transactions.filter((t) => {
        if (t.type !== 'egreso') return false;
        const matchesCategory = t.category === bg.categoryOrTag;
        const matchesTag = t.tags.includes(bg.categoryOrTag);
        return matchesCategory || matchesTag;
      });

      const spent = matchingTxs.reduce((sum, t) => sum + t.amount, 0);
      const remaining = bg.allocatedAmount - spent;
      const percentage = Math.round((spent / bg.allocatedAmount) * 100);

      return {
        ...bg,
        spent,
        remaining,
        percentage,
        txCount: matchingTxs.length,
      };
    });
  }, [budgets, transactions]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Presupuestos y Techos de Gasto
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supervisión del presupuesto asignado por la Tesorería General para evitar sobrecostos
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Techo Presupuestario</span>
        </button>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {budgetStats.map((bg) => {
          const isOverBudget = bg.spent > bg.allocatedAmount;
          const isWarning = bg.percentage >= 80 && !isOverBudget;

          return (
            <div
              key={bg.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    {bg.period.toUpperCase()} • {bg.year}
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {bg.categoryOrTag}
                  </h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(bg)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setBudgetToDelete(bg)}
                    title="Eliminar Techo Presupuestal"
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-rose-950/30 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Progress and Numbers */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Ejecutado:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${bg.spent.toFixed(2)} de ${bg.allocatedAmount.toFixed(2)} ({bg.percentage}%)
                  </span>
                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOverBudget
                        ? 'bg-rose-600'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, bg.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className={isOverBudget ? 'font-bold text-rose-600' : 'text-slate-500'}>
                    {isOverBudget ? 'Excedido por:' : 'Disponible:'}
                  </span>
                  <span className={`font-bold ${isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                    ${Math.abs(bg.remaining).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {bg.notes && (
                <p className="mt-3 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  {bg.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal for create/edit budget */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingBudget ? 'Editar Presupuesto' : 'Crear Techo Presupuestario'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Rubro / Categoría o Proyecto
                </label>
                <select
                  value={categoryOrTag}
                  onChange={(e) => setCategoryOrTag(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {categories.filter((c) => c.type === 'egreso').map((c) => (
                    <option key={c.id} value={c.name}>
                      📁 {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Monto Asignado ($ USD)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="50"
                    required
                    value={allocatedAmount}
                    onChange={(e) => setAllocatedAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Periodicidad
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="mensual">Mensual</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Notas / Justificación
                </label>
                <textarea
                  rows={2}
                  placeholder="Aprobado en junta ministerial, proyecto especial..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Guardar Techo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(budgetToDelete)}
        title="Eliminar Techo Presupuestario"
        message={`¿Confirma la eliminación del techo presupuestario para "${budgetToDelete?.categoryOrTag}" ($${budgetToDelete?.allocatedAmount.toFixed(2)} / ${budgetToDelete?.period})?`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={() => {
          if (budgetToDelete) {
            onDeleteBudget(budgetToDelete.id);
            setBudgetToDelete(null);
          }
        }}
        onCancel={() => setBudgetToDelete(null)}
      />
    </div>
  );
};
