import React from 'react';
import { X, Printer, Download, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Transaction } from '../types';
import { PdfExportService } from '../services/exportPdf';

interface VoucherModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const isIngreso = transaction.type === 'ingreso';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    PdfExportService.exportSingleVoucher(transaction);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Controls */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                isIngreso
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
              }`}
            >
              {isIngreso ? 'RECIBO DE INGRESO' : 'ORDEN DE PAGO'}
            </span>
            <span className="font-mono text-xs font-bold text-slate-500">{transaction.code}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Receipt Layout */}
        <div id="printable-voucher" className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-800/40">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  IGLESIA CENTRAL CRISTIANA
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Departamento de Comunicaciones & Medios Digitales
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                {transaction.code}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Fecha: {transaction.date}
              </div>
            </div>
          </div>

          {/* Amount Callout */}
          <div className="my-5 flex items-center justify-between rounded-xl bg-white p-4 shadow-xs dark:bg-slate-900">
            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-400">
                {isIngreso ? 'Monto Recibido en Fondos' : 'Monto Autorizado y Desembolsado'}
              </span>
              <div className={`text-2xl font-black ${isIngreso ? 'text-emerald-600' : 'text-rose-600'}`}>
                ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Verificado</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                {isIngreso ? 'Donante / Procedencia:' : 'Beneficiario / Proveedor:'}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {transaction.beneficiaryOrDonor}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">Concepto:</span>
              <span className="max-w-xs text-right font-medium text-slate-900 dark:text-white">
                {transaction.description}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">Categoría Contable:</span>
              <span className="font-medium">{transaction.category}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">Cuenta de Afectación:</span>
              <span className="font-medium">{transaction.account}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">Método de Pago:</span>
              <span className="capitalize">{transaction.paymentMethod.replace('_', ' ')}</span>
            </div>

            {transaction.voucherNumber && (
              <div className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
                <span className="font-medium text-slate-500 dark:text-slate-400">Nº Factura / Recibo:</span>
                <span className="font-mono font-medium">{transaction.voucherNumber}</span>
              </div>
            )}

            {transaction.tags.length > 0 && (
              <div className="flex justify-between border-b border-slate-100 py-1 dark:border-slate-800">
                <span className="font-medium text-slate-500 dark:text-slate-400">Etiquetas / Proyecto:</span>
                <div className="flex flex-wrap gap-1">
                  {transaction.tags.map((t) => (
                    <span key={t} className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Signature Boxes */}
          <div className="mt-8 grid grid-cols-2 gap-6 pt-4 text-center text-xs">
            <div>
              <div className="mx-auto h-10 border-b border-slate-300 dark:border-slate-600" />
              <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                {isIngreso ? 'Recibido Conforme' : 'Autorizado Por'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {transaction.createdBy}
              </p>
            </div>

            <div>
              <div className="mx-auto h-10 border-b border-slate-300 dark:border-slate-600" />
              <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                {isIngreso ? 'Firma Donante / Pagador' : 'Firma Beneficiario'}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {transaction.beneficiaryOrDonor}
              </p>
            </div>
          </div>

          {/* Cryptographic verification badge */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-3 text-[10px] text-slate-400 dark:border-slate-700">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> Registro Cifrado E2EE
            </span>
            <span>ID: {transaction.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
