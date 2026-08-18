import * as XLSX from 'xlsx';
import { Transaction, Tag, Category } from '../types';
import { AuthService } from './auth';

export class ExcelExportService {
  public static exportFinancialReport(
    transactions: Transaction[],
    tags: Tag[],
    categories: Category[],
    reportTitle: string = 'Reporte Financiero Contable - Depto. Comunicaciones'
  ): void {
    // 1. Workbook creation
    const wb = XLSX.utils.book_new();

    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.type === 'ingreso')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'egreso')
      .reduce((acc, t) => acc + t.amount, 0);

    const netBalance = totalIncome - totalExpense;

    // --- SHEET 1: Resumen Ejecutivo ---
    const summaryData = [
      ['IGLESIA - DEPARTAMENTO DE COMUNICACIONES'],
      ['SISTEMA DE GESTIÓN CONTABLE Y FINANCIERA'],
      [`Fecha de Emisión: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`],
      [`Generado por: ${AuthService.getCurrentUser()?.fullName || 'Administración'} (${AuthService.getCurrentUser()?.role || 'Oficial'})`],
      [''],
      ['RESUMEN GENERAL DE FONDOS'],
      ['Concepto', 'Monto (USD / Moneda Local)'],
      ['Total de Ingresos Recaudados / Asignados', totalIncome],
      ['Total de Egresos y Gastos Operativos', totalExpense],
      ['Saldo Neto Disponible en Cuentas', netBalance],
      ['Total de Registros Contables', transactions.length],
      [''],
      ['DESGLOSE POR CUENTAS FINANCIERAS'],
      ['Cuenta', 'Ingresos ($)', 'Egresos ($)', 'Saldo ($)'],
    ];

    // Accounts breakdown
    const accounts = Array.from(new Set(transactions.map((t) => t.account)));
    accounts.forEach((acc) => {
      const accIngresos = transactions
        .filter((t) => t.account === acc && t.type === 'ingreso')
        .reduce((sum, t) => sum + t.amount, 0);
      const accEgresos = transactions
        .filter((t) => t.account === acc && t.type === 'egreso')
        .reduce((sum, t) => sum + t.amount, 0);
      summaryData.push([acc, accIngresos, accEgresos, accIngresos - accEgresos]);
    });

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Ejecutivo');

    // --- SHEET 2: Libro Diario Completo ---
    let runningBalance = 0;
    const sortedAsc = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const ledgerRows = sortedAsc.map((t) => {
      const ingreso = t.type === 'ingreso' ? t.amount : 0;
      const egreso = t.type === 'egreso' ? t.amount : 0;
      runningBalance += ingreso - egreso;

      return {
        'Fecha': t.date,
        'Código': t.code,
        'Tipo': t.type.toUpperCase(),
        'Categoría': t.category,
        'Descripción / Concepto': t.description,
        'Beneficiario / Donante': t.beneficiaryOrDonor,
        'Método Pago': t.paymentMethod.replace('_', ' ').toUpperCase(),
        'Nº Comprobante': t.voucherNumber,
        'Cuenta Contable': t.account,
        'Etiquetas / Proyecto': t.tags.join(', '),
        'Estado': t.status.toUpperCase(),
        'Ingreso (Debe $)': ingreso,
        'Egreso (Haber $)': egreso,
        'Saldo Acumulado ($)': runningBalance,
        'Notas': t.notes || '',
      };
    });

    const wsLedger = XLSX.utils.json_to_sheet(ledgerRows);
    XLSX.utils.book_append_sheet(wb, wsLedger, 'Libro Diario');

    // --- SHEET 3: Desglose por Etiquetas / Proyectos ---
    const tagBreakdown = tags.map((tag) => {
      const tagTxs = transactions.filter((t) => t.tags.includes(tag.name));
      const tagIngresos = tagTxs
        .filter((t) => t.type === 'ingreso')
        .reduce((sum, t) => sum + t.amount, 0);
      const tagEgresos = tagTxs
        .filter((t) => t.type === 'egreso')
        .reduce((sum, t) => sum + t.amount, 0);
      const balance = tagIngresos - tagEgresos;

      return {
        'Etiqueta / Proyecto': tag.name,
        'Descripción': tag.description || '-',
        'Tope Presupuestario ($)': tag.budgetCap || 0,
        'Total Ingresos Asignados ($)': tagIngresos,
        'Total Gastos Ejecutados ($)': tagEgresos,
        'Balance Neto ($)': balance,
        'Nº Movimientos': tagTxs.length,
      };
    });

    const wsTags = XLSX.utils.json_to_sheet(tagBreakdown);
    XLSX.utils.book_append_sheet(wb, wsTags, 'Etiquetas y Proyectos');

    // --- SHEET 4: Desglose por Categorías ---
    const catBreakdown = categories.map((cat) => {
      const catTxs = transactions.filter((t) => t.category === cat.name);
      const totalAmount = catTxs.reduce((sum, t) => sum + t.amount, 0);

      return {
        'Categoría': cat.name,
        'Tipo': cat.type.toUpperCase(),
        'Total Acumulado ($)': totalAmount,
        'Transacciones': catTxs.length,
        'Descripción': cat.description,
      };
    });

    const wsCats = XLSX.utils.json_to_sheet(catBreakdown);
    XLSX.utils.book_append_sheet(wb, wsCats, 'Categorías');

    // Generate filename and trigger download
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Contabilidad_Comunicaciones_${dateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);

    AuthService.logAudit('EXPORT_EXCEL', `Reporte contable completo exportado a Excel (${fileName})`);
  }
}
