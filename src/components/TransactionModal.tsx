import React from 'react';
import {
  X,
  ArrowUpRight,
  ArrowDownRight,
  Save,
  Plus,
  Tag as TagIcon,
  Building2,
  Calendar,
  DollarSign,
  Receipt,
  FileText,
  HelpCircle
} from 'lucide-react';
import { Transaction, Tag, Category, AccountType, PaymentMethod, TransactionType } from '../types';
import { AuthService } from '../services/auth';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => void;
  onSaveNewTag: (tag: Tag) => void;
  editingTransaction: Transaction | null;
  initialType?: TransactionType;
  tags: Tag[];
  categories: Category[];
  existingTransactionsCount: number;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveNewTag,
  editingTransaction,
  initialType = 'egreso',
  tags,
  categories,
  existingTransactionsCount,
}) => {
  const [type, setType] = React.useState<TransactionType>(initialType);
  const [code, setCode] = React.useState('');
  const [date, setDate] = React.useState('');
  const [amount, setAmount] = React.useState<string>('');
  const [category, setCategory] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [beneficiaryOrDonor, setBeneficiaryOrDonor] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('transferencia');
  const [voucherNumber, setVoucherNumber] = React.useState('');
  const [account, setAccount] = React.useState<AccountType>('Banco Principal Iglesia');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [notes, setNotes] = React.useState('');
  const [isDesignated, setIsDesignated] = React.useState(false);

  // Inline Tag creation state
  const [showNewTagInput, setShowNewTagInput] = React.useState(false);
  const [newTagName, setNewTagName] = React.useState('');
  const [newTagColor, setNewTagColor] = React.useState('#3b82f6');

  // Set form fields on open or change
  React.useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setCode(editingTransaction.code);
      setDate(editingTransaction.date);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description);
      setBeneficiaryOrDonor(editingTransaction.beneficiaryOrDonor);
      setPaymentMethod(editingTransaction.paymentMethod);
      setVoucherNumber(editingTransaction.voucherNumber);
      setAccount(editingTransaction.account);
      setSelectedTags(editingTransaction.tags || []);
      setNotes(editingTransaction.notes || '');
      setIsDesignated(editingTransaction.isDesignated || false);
    } else {
      const activeType = initialType || 'egreso';
      const year = new Date().getFullYear();
      const nextNum = String(existingTransactionsCount + 1).padStart(3, '0');
      const prefix = activeType === 'ingreso' ? 'ING' : 'EGR';
      
      setType(activeType);
      setCode(`${prefix}-${year}-${nextNum}`);
      setDate(new Date().toISOString().slice(0, 10));
      setAmount('');
      const defaultCats = categories.filter((c) => c.type === activeType);
      setCategory(defaultCats.length > 0 ? defaultCats[0].name : '');
      setDescription('');
      setBeneficiaryOrDonor('');
      setPaymentMethod('transferencia');
      setVoucherNumber('');
      setAccount('Banco Principal Iglesia');
      setSelectedTags([]);
      setNotes('');
      setIsDesignated(false);
    }
  }, [editingTransaction, initialType, isOpen, existingTransactionsCount, categories]);

  if (!isOpen) return null;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const prefix = newType === 'ingreso' ? 'ING' : 'EGR';
    const year = new Date().getFullYear();
    const nextNum = String(existingTransactionsCount + 1).padStart(3, '0');
    setCode(`${prefix}-${year}-${nextNum}`);

    const filteredCats = categories.filter((c) => c.type === newType);
    if (filteredCats.length > 0) {
      setCategory(filteredCats[0].name);
    }
  };

  const handleToggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    const newTag: Tag = {
      id: `tag_${Date.now()}`,
      name: newTagName.trim(),
      color: newTagColor,
      description: 'Etiqueta creada desde formulario contable',
    };
    onSaveNewTag(newTag);
    setSelectedTags([...selectedTags, newTag.name]);
    setNewTagName('');
    setShowNewTagInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Por favor ingrese un monto válido mayor a 0.');
      return;
    }
    if (!description.trim()) {
      alert('Por favor ingrese una descripción o concepto del movimiento.');
      return;
    }

    const currentUser = AuthService.getCurrentUser();
    const tx: Transaction = {
      id: editingTransaction ? editingTransaction.id : `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      code: code.trim() || `TX-${Date.now()}`,
      type,
      date,
      amount: numAmount,
      category: category || (type === 'ingreso' ? 'Presupuesto Asignado por Tesorería' : 'Equipamiento Audiovisual'),
      tags: selectedTags,
      description: description.trim(),
      beneficiaryOrDonor: beneficiaryOrDonor.trim() || (type === 'ingreso' ? 'Tesorería / Iglesia' : 'Proveedor General'),
      paymentMethod,
      voucherNumber: voucherNumber.trim(),
      account,
      status: 'conciliado',
      notes: notes.trim(),
      isDesignated,
      createdBy: editingTransaction ? editingTransaction.createdBy : (currentUser ? currentUser.fullName : 'Oficial Comms'),
      createdAt: editingTransaction ? editingTransaction.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(tx);
    onClose();
  };

  const availableCategories = categories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingTransaction ? 'Editar Registro Contable' : 'Registrar Nuevo Movimiento'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Departamento de Comunicaciones • Libro Diario Oficial
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => handleTypeChange('ingreso')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                type === 'ingreso'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>INGRESO / ENTRADA (+)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('egreso')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                type === 'egreso'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <ArrowDownRight className="h-4 w-4" />
              <span>EGRESO / GASTO (-)</span>
            </button>
          </div>

          {/* Amount and Code */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Monto Total ($ USD / Moneda Local) *
              </label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Código Contable Correlativo
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-mono font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Date & Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Fecha del Movimiento *
              </label>
              <div className="relative mt-1">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Categoría Contable *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Concept / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Concepto / Detalle de la Operación *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Compra de 2 cables HDMI blindados 10m para cámara principal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Beneficiary/Donor & Voucher Reference */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {type === 'ingreso' ? 'Donante / Entidad Pagadora' : 'Proveedor / Beneficiario'}
              </label>
              <input
                type="text"
                placeholder={type === 'ingreso' ? 'Ej. Donación Familia Pérez / Tesorería' : 'Ej. AudioVideo Store S.A.'}
                value={beneficiaryOrDonor}
                onChange={(e) => setBeneficiaryOrDonor(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nº Factura / Comprobante / Recibo Ref.
              </label>
              <input
                type="text"
                placeholder="Ej. FACT-00941 / REC-4412"
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Account & Payment Method */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Cuenta Financiera / Caja
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value as AccountType)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Banco Principal Iglesia">Banco Principal Iglesia</option>
                <option value="Caja General Comunicaciones">Caja General Comunicaciones</option>
                <option value="Fondo de Reserva Equipamiento">Fondo de Reserva Equipamiento</option>
                <option value="Caja Chica Producción">Caja Chica Producción</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Método de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="tarjeta">Tarjeta Débito / Crédito</option>
                <option value="efectivo">Efectivo en Caja</option>
                <option value="cheque">Cheque Administrativo</option>
                <option value="caja_chica">Caja Chica</option>
                <option value="donacion_en_linea">Donación / Plataforma Digital</option>
              </select>
            </div>
          </div>

          {/* Custom Tags Section (Multi-select + Inline Tag Creator) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <TagIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Etiquetas y Proyectos Asignados</span>
              </div>
              <button
                type="button"
                onClick={() => setShowNewTagInput(!showNewTagInput)}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <Plus className="h-3 w-3" />
                <span>Crear Etiqueta</span>
              </button>
            </div>

            {/* Inline tag creator input */}
            {showNewTagInput && (
              <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2 dark:border-blue-900/50 dark:bg-blue-950/40">
                <input
                  type="text"
                  placeholder="Nombre de etiqueta (ej. #NocheDeMilagros)"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="h-7 w-8 cursor-pointer rounded border-none bg-transparent"
                  title="Color de la etiqueta"
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Agregar
                </button>
              </div>
            )}

            {/* Tags Pills List */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggleTag(tag.name)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'text-white shadow-xs scale-105'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                    style={{
                      backgroundColor: isSelected ? tag.color : undefined,
                    }}
                  >
                    <span>#{tag.name}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Designated Fund and Notes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDesignated"
                checked={isDesignated}
                onChange={(e) => setIsDesignated(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isDesignated" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Fondo con Destino Específico / Donación Designada para Comunicaciones
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Notas de Auditoría o Justificación
              </label>
              <textarea
                rows={2}
                placeholder="Observaciones adicionales, estado de la garantía, aprobación en junta..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
            >
              <Save className="h-4 w-4" />
              <span>Guardar en Libro Diario</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
