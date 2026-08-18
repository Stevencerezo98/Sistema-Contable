import React from 'react';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Download,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { Transaction, Tag, Category } from '../types';

interface ReportsViewProps {
  transactions: Transaction[];
  tags: Tag[];
  categories: Category[];
  onExportExcel: () => void;
  onExportPdf: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  tags,
  categories,
  onExportExcel,
  onExportPdf,
}) => {
  const [selectedYear, setSelectedYear] = React.useState('2025');

  // 1. Monthly Financial Data
  const monthlyData = React.useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const data = months.map((m, idx) => {
      const monthNum = String(idx + 1).padStart(2, '0');
      const prefix = `${selectedYear}-${monthNum}`;

      const monthTxs = transactions.filter((t) => t.date.startsWith(prefix));
      const ingresos = monthTxs
        .filter((t) => t.type === 'ingreso')
        .reduce((sum, t) => sum + t.amount, 0);
      const egresos = monthTxs
        .filter((t) => t.type === 'egreso')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: m,
        ingresos,
        egresos,
        neto: ingresos - egresos,
      };
    });

    return data;
  }, [transactions, selectedYear]);

  // 2. Spending by Tag/Project
  const tagChartData = React.useMemo(() => {
    return tags.map((t) => {
      const tagTxs = transactions.filter((tx) => tx.tags.includes(t.name));
      const totalSpent = tagTxs
        .filter((tx) => tx.type === 'egreso')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const totalIngreso = tagTxs
        .filter((tx) => tx.type === 'ingreso')
        .reduce((sum, tx) => sum + tx.amount, 0);

      return {
        name: t.name.length > 16 ? t.name.substring(0, 14) + '...' : t.name,
        fullName: t.name,
        gastado: totalSpent,
        presupuesto: t.budgetCap || 1000,
        ingreso: totalIngreso,
        color: t.color,
      };
    });
  }, [tags, transactions]);

  // 3. Payment Methods Breakdown
  const paymentMethodData = React.useMemo(() => {
    const methods: Record<string, number> = {};
    transactions.forEach((t) => {
      const methodLabel = t.paymentMethod.replace('_', ' ').toUpperCase();
      methods[methodLabel] = (methods[methodLabel] || 0) + t.amount;
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
    return Object.entries(methods).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  }, [transactions]);

  // 4. Categories Breakdown
  const categoryExpenses = React.useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'egreso');
    const catMap: Record<string, number> = {};
    expenses.forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    const colors = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#3b82f6', '#ec4899', '#14b8a6'];
    return Object.entries(catMap).map(([name, value], index) => ({
      name: name.length > 20 ? name.substring(0, 18) + '...' : name,
      fullName: name,
      value,
      color: colors[index % colors.length],
    }));
  }, [transactions]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Análisis Gráfico y Reportes Financieros
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Visualización estadística de flujos, ejecución de proyectos y distribución presupuestaria
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="2025">Año 2025</option>
            <option value="2024">Año 2024</option>
          </select>

          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-95"
          >
            <FileText className="h-4 w-4" />
            <span>Exportar PDF</span>
          </button>
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Chart 1: Cash Flow Area Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Curva de Flujo de Efectivo Acumulado ({selectedYear})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Evolución mensual de recaudación vs gastos en transmisiones y medios
          </p>
        </div>

        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(val: any) => [`$${Number(val).toFixed(2)}`, '']}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="ingresos" name="Ingresos ($)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIngresos)" />
              <Area type="monotone" dataKey="egresos" name="Egresos ($)" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEgresos)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2 & 3: Projects vs Budget + Category Donut */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Project Spending Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Gastos por Proyecto / Etiqueta Personalizada
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparativa de monto gastado vs presupuesto asignado
            </p>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, '']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="gastado" name="Gasto Real ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="presupuesto" name="Techo Asignado ($)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Donut Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Desglose de Egresos por Rubro
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribución porcentual de los costos operativos
            </p>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryExpenses}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, '']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 4: Payment Methods Distribution */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Distribución por Método de Pago y Canales
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Transferencias bancarias, tarjetas corporativas, caja chica y efectivo
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {paymentMethodData.map((item) => (
            <div key={item.name} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-center dark:border-slate-800 dark:bg-slate-800/40">
              <div className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                {item.name}
              </div>
              <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                ${item.value.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
