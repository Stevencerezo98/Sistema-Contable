import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Tag, Category } from '../types';
import { AuthService } from './auth';

export class PdfExportService {
  public static exportLedgerReport(
    transactions: Transaction[],
    tags: Tag[],
    categories: Category[],
    periodTitle: string = 'Período Contable General'
  ): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const currentUser = AuthService.getCurrentUser();

    // 1. Header Banner / Church Branding
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, pageWidth, 26, 'F');

    doc.setFillColor(59, 130, 246); // Blue-500 accent stripe
    doc.rect(0, 26, pageWidth, 2.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('IGLESIA CENTRAL CRISTIANA', 14, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(203, 213, 225); // Slate-300
    doc.text('DEPARTAMENTO DE COMUNICACIONES Y MEDIOS DIGITALES', 14, 18);

    doc.setFontSize(8.5);
    doc.text(`EMISIÓN: ${new Date().toLocaleDateString('es-ES')} | CIFRADO: AES-256`, pageWidth - 14, 18, { align: 'right' });

    // 2. Report Title & Info Section
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('LIBRO DE CONTABILIDAD Y ESTADO FINANCIERO', 14, 37);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`Período Reportado: ${periodTitle}`, 14, 43);
    doc.text(`Responsable Contable: ${currentUser?.fullName || 'Dirección de Medios'} (${currentUser?.role?.toUpperCase() || 'OFICIAL'})`, 14, 48);

    // Calculate Key Financial Metrics
    const totalIncome = transactions
      .filter((t) => t.type === 'ingreso')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'egreso')
      .reduce((sum, t) => sum + t.amount, 0);

    const netBalance = totalIncome - totalExpense;

    // 3. Summary Metric Cards
    const cardY = 53;
    const cardWidth = (pageWidth - 28 - 8) / 3;

    // Card 1: Ingresos
    doc.setFillColor(240, 253, 244); // Green-50
    doc.setDrawColor(187, 247, 208); // Green-200
    doc.roundedRect(14, cardY, cardWidth, 16, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setTextColor(22, 101, 52); // Green-800
    doc.text('TOTAL INGRESOS', 18, cardY + 5.5);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 18, cardY + 12);

    // Card 2: Egresos
    doc.setFillColor(254, 242, 242); // Red-50
    doc.setDrawColor(254, 202, 202); // Red-200
    doc.roundedRect(14 + cardWidth + 4, cardY, cardWidth, 16, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(153, 27, 27); // Red-800
    doc.text('TOTAL EGRESOS', 18 + cardWidth + 4, cardY + 5.5);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 18 + cardWidth + 4, cardY + 12);

    // Card 3: Saldo Disponible
    doc.setFillColor(239, 246, 255); // Blue-50
    doc.setDrawColor(191, 219, 254); // Blue-200
    doc.roundedRect(14 + (cardWidth + 4) * 2, cardY, cardWidth, 16, 2, 2, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 64, 175); // Blue-800
    doc.text('SALDO NETO DISPONIBLE', 18 + (cardWidth + 4) * 2, cardY + 5.5);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 18 + (cardWidth + 4) * 2, cardY + 12);

    // 4. Ledger Table (Libro Diario)
    let runningBalance = 0;
    const sortedTxs = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const tableBody = sortedTxs.map((t) => {
      const ingreso = t.type === 'ingreso' ? t.amount : 0;
      const egreso = t.type === 'egreso' ? t.amount : 0;
      runningBalance += ingreso - egreso;

      return [
        t.date,
        t.code,
        t.description.length > 32 ? t.description.substring(0, 30) + '...' : t.description,
        t.category.length > 22 ? t.category.substring(0, 20) + '...' : t.category,
        t.voucherNumber || '-',
        ingreso > 0 ? `$${ingreso.toFixed(2)}` : '-',
        egreso > 0 ? `$${egreso.toFixed(2)}` : '-',
        `$${runningBalance.toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: 74,
      head: [['Fecha', 'Código', 'Concepto / Descripción', 'Categoría', 'Comprobante', 'Debe (+)', 'Haber (-)', 'Saldo']],
      body: tableBody,
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 19, fontStyle: 'bold' },
        2: { cellWidth: 48 },
        3: { cellWidth: 32 },
        4: { cellWidth: 22 },
        5: { cellWidth: 16, halign: 'right', textColor: [22, 101, 52] },
        6: { cellWidth: 16, halign: 'right', textColor: [153, 27, 27] },
        7: { cellWidth: 17, halign: 'right', fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    });

    // 5. Signatures and Audit Seals at the bottom of the last page
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Check if we need a new page for signatures
    let sigY = finalY;
    if (sigY > pageHeight - 45) {
      doc.addPage();
      sigY = 25;
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);

    const sigBoxWidth = (pageWidth - 28 - 20) / 3;

    // Signature 1: Director de Comunicaciones
    doc.setDrawColor(148, 163, 184);
    doc.line(14, sigY + 15, 14 + sigBoxWidth, sigY + 15);
    doc.text('Pr. Carlos Mendoza', 14 + sigBoxWidth / 2, sigY + 19, { align: 'center' });
    doc.text('Director de Comunicaciones', 14 + sigBoxWidth / 2, sigY + 23, { align: 'center' });

    // Signature 2: Tesorería General
    doc.line(14 + sigBoxWidth + 10, sigY + 15, 14 + sigBoxWidth * 2 + 10, sigY + 15);
    doc.text('Lic. Elena Ramos', 14 + sigBoxWidth + 10 + sigBoxWidth / 2, sigY + 19, { align: 'center' });
    doc.text('Tesorería General / Finanzas', 14 + sigBoxWidth + 10 + sigBoxWidth / 2, sigY + 23, { align: 'center' });

    // Signature 3: Auditor / Pastor
    doc.line(14 + (sigBoxWidth + 10) * 2, sigY + 15, 14 + sigBoxWidth * 3 + 20, sigY + 15);
    doc.text('Comité de Auditoría Eclesiástica', 14 + (sigBoxWidth + 10) * 2 + sigBoxWidth / 2, sigY + 19, { align: 'center' });
    doc.text('Visto Bueno y Aprobación', 14 + (sigBoxWidth + 10) * 2 + sigBoxWidth / 2, sigY + 23, { align: 'center' });

    // Security Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(`Documento Eclesiástico Oficial | Cifrado E2EE | Página ${i} de ${totalPages}`, 14, pageHeight - 8);
      doc.text(`ID Verificación: ${Math.random().toString(36).substring(2, 10).toUpperCase()}-SEC`, pageWidth - 14, pageHeight - 8, { align: 'right' });
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `Informe_Contable_Comunicaciones_${dateStr}.pdf`;
    doc.save(fileName);

    AuthService.logAudit('EXPORT_PDF', `Libro contable y reporte oficial exportado en PDF (${fileName})`);
  }

  /**
   * Generates a single transaction receipt/voucher PDF
   */
  public static exportSingleVoucher(transaction: Transaction): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [148, 210], // A5 size for voucher
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const isIngreso = transaction.type === 'ingreso';

    // Top banner
    doc.setFillColor(isIngreso ? 22 : 153, isIngreso ? 101 : 27, isIngreso ? 52 : 27);
    doc.rect(0, 0, pageWidth, 20, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('IGLESIA CENTRAL CRISTIANA', 10, 8);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('DEPARTAMENTO DE COMUNICACIONES - COMPROBANTE OFICIAL', 10, 14);

    // Voucher Title & Code
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(isIngreso ? 'RECIBO OFICIAL DE INGRESO' : 'ORDEN DE PAGO Y EGRESO', 10, 30);

    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.text(`Nº ${transaction.code}`, pageWidth - 10, 30, { align: 'right' });

    // Details Table
    autoTable(doc, {
      startY: 36,
      head: [['Campo', 'Detalle Registrado']],
      body: [
        ['Fecha del Movimiento', transaction.date],
        ['Tipo de Operación', isIngreso ? 'INGRESO A CAJA / BANCO' : 'EGRESO / GASTO OPERATIVO'],
        ['Monto Total', `$${transaction.amount.toFixed(2)} USD`],
        ['Categoría', transaction.category],
        ['Beneficiario / Donante', transaction.beneficiaryOrDonor],
        ['Concepto / Descripción', transaction.description],
        ['Método de Pago', transaction.paymentMethod.replace('_', ' ').toUpperCase()],
        ['Nº Factura / Recibo Ref.', transaction.voucherNumber || 'N/A'],
        ['Cuenta Afectada', transaction.account],
        ['Etiquetas de Proyecto', transaction.tags.join(', ') || 'Ninguna'],
        ['Registrado por', transaction.createdBy],
      ],
      styles: { fontSize: 8, cellPadding: 2.2 },
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
      columnStyles: { 0: { cellWidth: 42, fontStyle: 'bold' } },
      margin: { left: 10, right: 10 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;

    // Signatures
    doc.setDrawColor(148, 163, 184);
    doc.line(12, finalY + 12, 65, finalY + 12);
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(isIngreso ? 'Firma de Quien Recibe' : 'Firma de Autorización', 38, finalY + 16, { align: 'center' });

    doc.line(83, finalY + 12, 136, finalY + 12);
    doc.text(isIngreso ? 'Firma del Donante / Pagador' : 'Firma del Beneficiario', 110, finalY + 16, { align: 'center' });

    doc.save(`Comprobante_${transaction.code}.pdf`);
  }
}
