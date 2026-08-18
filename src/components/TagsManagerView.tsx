import React, { useState, useMemo } from 'react';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Target,
  FileText,
  DollarSign,
  X,
  Check,
  FolderPlus,
  FolderOpen,
  ArrowUpRight,
  ArrowDownRight,
  Layers
} from 'lucide-react';
import { Tag, Category, Transaction } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface TagsManagerViewProps {
  tags: Tag[];
  categories: Category[];
  transactions: Transaction[];
  onSaveTag: (tag: Tag) => void;
  onDeleteTag: (id: string) => void;
  onSaveCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  onNavigateToTransactionsWithTag?: (tagName: string) => void;
}

export const TagsManagerView: React.FC<TagsManagerViewProps> = ({
  tags,
  categories,
  transactions,
  onSaveTag,
  onDeleteTag,
  onSaveCategory,
  onDeleteCategory,
  onNavigateToTransactionsWithTag,
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');

  // Tag Form states
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#3b82f6');
  const [tagDescription, setTagDescription] = useState('');
  const [tagBudgetCap, setTagBudgetCap] = useState<string>('1000');

  // Category Form states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'ingreso' | 'egreso'>('egreso');
  const [catPrefix, setCatPrefix] = useState('EGR');

  // Deletion Modal State
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'tag' | 'category';
    id: string;
    name: string;
  } | null>(null);

  // Tag Handlers
  const handleOpenCreateTag = () => {
    setEditingTag(null);
    setTagName('');
    setTagColor('#3b82f6');
    setTagDescription('');
    setTagBudgetCap('1000');
    setIsCreatingTag(true);
  };

  const handleOpenEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagColor(tag.color);
    setTagDescription(tag.description || '');
    setTagBudgetCap(tag.budgetCap ? tag.budgetCap.toString() : '1000');
    setIsCreatingTag(true);
  };

  const handleSaveTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    const newTag: Tag = {
      id: editingTag ? editingTag.id : `tag_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: tagName.trim().replace(/^#/, ''),
      color: tagColor,
      description: tagDescription.trim(),
      budgetCap: parseFloat(tagBudgetCap) || 1000,
    };

    onSaveTag(newTag);
    setIsCreatingTag(false);
  };

  // Category Handlers
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCatName('');
    setCatType('egreso');
    setCatPrefix('EGR');
    setIsCreatingCategory(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatType(cat.type);
    setCatPrefix(cat.defaultCodePrefix || (cat.type === 'ingreso' ? 'ING' : 'EGR'));
    setIsCreatingCategory(true);
  };

  const handleSaveCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const newCat: Category = {
      id: editingCategory ? editingCategory.id : `cat_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: catName.trim(),
      type: catType,
      defaultCodePrefix: catPrefix.trim().toUpperCase() || (catType === 'ingreso' ? 'ING' : 'EGR'),
    };

    onSaveCategory(newCat);
    setIsCreatingCategory(false);
  };

  // Confirm delete handler
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'tag') {
      onDeleteTag(itemToDelete.id);
    } else {
      onDeleteCategory(itemToDelete.id);
    }
    setItemToDelete(null);
  };

  // Tag Statistics
  const tagStats = useMemo(() => {
    return tags.map((tag) => {
      const tagTxs = transactions.filter((t) => t.tags.includes(tag.name));
      const totalIngreso = tagTxs
        .filter((t) => t.type === 'ingreso')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalEgreso = tagTxs
        .filter((t) => t.type === 'egreso')
        .reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIngreso - totalEgreso;
      const cap = tag.budgetCap || 1000;
      const executionPercent = Math.min(100, Math.round((totalEgreso / cap) * 100));

      return {
        ...tag,
        txCount: tagTxs.length,
        totalIngreso,
        totalEgreso,
        balance,
        executionPercent,
      };
    });
  }, [tags, transactions]);

  // Category Statistics
  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catTxs = transactions.filter((t) => t.category === cat.name);
      const totalAmount = catTxs.reduce((sum, t) => sum + t.amount, 0);
      return {
        ...cat,
        txCount: catTxs.length,
        totalAmount,
      };
    });
  }, [categories, transactions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Estructura Contable: Categorías y Etiquetas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Administración de rubros presupuestarios de ingreso/egreso y proyectos multimedia
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'categories' ? (
            <button
              id="create-category-btn"
              onClick={handleOpenCreateCategory}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition"
            >
              <FolderPlus className="h-4 w-4" />
              <span>Nueva Categoría / Rubro</span>
            </button>
          ) : (
            <button
              id="create-tag-btn"
              onClick={handleOpenCreateTag}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Etiqueta (#Tag)</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        <button
          id="tab-categories-btn"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'categories'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>Rubros y Categorías ({categories.length})</span>
        </button>

        <button
          id="tab-tags-btn"
          onClick={() => setActiveTab('tags')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === 'tags'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Tags className="h-4 w-4" />
          <span>Etiquetas de Proyectos ({tags.length})</span>
        </button>
      </div>

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Create/Edit Category Modal */}
          {isCreatingCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingCategory ? 'Editar Categoría / Rubro' : 'Crear Nueva Categoría'}
                  </h3>
                  <button
                    onClick={() => setIsCreatingCategory(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCategorySubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nombre del Rubro / Categoría *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Equipos de Audio, Internet, Donaciones..."
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Tipo de Flujo
                      </label>
                      <select
                        value={catType}
                        onChange={(e) => {
                          const t = e.target.value as 'ingreso' | 'egreso';
                          setCatType(t);
                          if (!editingCategory) {
                            setCatPrefix(t === 'ingreso' ? 'ING' : 'EGR');
                          }
                        }}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="egreso">Egreso / Gasto</option>
                        <option value="ingreso">Ingreso / Entrada</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Prefijo Código (3-4 letras)
                      </label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="AUD, LIC, OFD"
                        value={catPrefix}
                        onChange={(e) => setCatPrefix(e.target.value.toUpperCase())}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs uppercase text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsCreatingCategory(false)}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{editingCategory ? 'Actualizar Rubro' : 'Crear Rubro'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Categories Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryStats.map((cat) => (
              <div
                key={cat.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold ${
                        cat.type === 'ingreso'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {cat.type === 'ingreso' ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      <span>{cat.type === 'ingreso' ? 'INGRESO' : 'EGRESO'}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        title="Editar Categoría"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() =>
                          setItemToDelete({
                            type: 'category',
                            id: cat.id,
                            name: cat.name,
                          })
                        }
                        title="Eliminar Categoría"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-rose-950/30 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Prefijo: <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">{cat.defaultCodePrefix || 'N/A'}</span>
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">
                    {cat.txCount} {cat.txCount === 1 ? 'movimiento' : 'movimientos'}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${cat.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAGS TAB */}
      {activeTab === 'tags' && (
        <div className="space-y-6">
          {/* Create/Edit Tag Modal */}
          {isCreatingTag && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingTag ? 'Editar Etiqueta (#Tag)' : 'Crear Nueva Etiqueta'}
                  </h3>
                  <button
                    onClick={() => setIsCreatingTag(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveTagSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nombre de la Etiqueta (sin espacios) *
                    </label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">#</span>
                      <input
                        type="text"
                        required
                        placeholder="Transmision, Campaña, Pascua..."
                        value={tagName}
                        onChange={(e) => setTagName(e.target.value.replace(/\s+/g, ''))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-7 pr-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Color Distintivo
                      </label>
                      <input
                        type="color"
                        value={tagColor}
                        onChange={(e) => setTagColor(e.target.value)}
                        className="mt-1 h-9 w-full cursor-pointer rounded-xl border border-slate-200 p-1 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Techo Presupuestal ($ USD)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={tagBudgetCap}
                        onChange={(e) => setTagBudgetCap(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Descripción del Proyecto / Uso
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Propósito del proyecto o equipo asociado..."
                      value={tagDescription}
                      onChange={(e) => setTagDescription(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsCreatingTag(false)}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{editingTag ? 'Actualizar Etiqueta' : 'Guardar Etiqueta'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tags Cards Grid */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {tagStats.map((tag) => (
              <div
                key={tag.id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-2xs"
                      style={{ backgroundColor: tag.color }}
                    >
                      #{tag.name}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditTag(tag)}
                        title="Editar Etiqueta"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 transition"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() =>
                          setItemToDelete({
                            type: 'tag',
                            id: tag.id,
                            name: tag.name,
                          })
                        }
                        title="Eliminar Etiqueta"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-rose-950/30 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {tag.description || 'Sin descripción detallada.'}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400">Gastado</span>
                      <div className="text-sm font-bold text-rose-600 dark:text-rose-400">
                        -${tag.totalEgreso.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-400">Ingresos</span>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        +${tag.totalIngreso.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Ejecución del Techo:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        ${tag.totalEgreso.toFixed(0)} / ${tag.budgetCap || 1000} ({tag.executionPercent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${tag.executionPercent}%`,
                          backgroundColor: tag.color,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
                  <span className="text-slate-400">
                    {tag.txCount} {tag.txCount === 1 ? 'movimiento' : 'movimientos'}
                  </span>
                  {onNavigateToTransactionsWithTag && (
                    <button
                      onClick={() => onNavigateToTransactionsWithTag(tag.name)}
                      className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Ver registros →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        title={itemToDelete?.type === 'tag' ? 'Eliminar Etiqueta' : 'Eliminar Categoría'}
        message={`¿Está seguro de que desea eliminar ${itemToDelete?.type === 'tag' ? 'la etiqueta #' : 'la categoría "'} ${itemToDelete?.name}${itemToDelete?.type === 'tag' ? '' : '"'}? Los movimientos contables existentes conservarán el registro histórico.`}
        confirmText="Sí, Eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
