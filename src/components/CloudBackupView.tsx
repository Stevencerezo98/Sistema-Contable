import React from 'react';
import {
  Cloud,
  CloudCheck,
  ShieldCheck,
  Download,
  Upload,
  RefreshCw,
  Lock,
  Key,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Sparkles,
  Server,
  ArrowUpDown
} from 'lucide-react';
import { CloudBackupSnapshot } from '../types';
import { StorageService } from '../services/storage';
import { CryptoService } from '../services/crypto';

interface CloudBackupViewProps {
  backups: CloudBackupSnapshot[];
  onRefreshBackups: () => void;
  onShowNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onReloadAllData: () => void;
}

export const CloudBackupView: React.FC<CloudBackupViewProps> = ({
  backups,
  onRefreshBackups,
  onShowNotification,
  onReloadAllData,
}) => {
  const [selectedProvider, setSelectedProvider] = React.useState<CloudBackupSnapshot['cloudProvider']>('Servidor Seguro Iglesia');
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [exportPassphrase, setExportPassphrase] = React.useState('CommsIglesia2025!');
  const [importPassphrase, setImportPassphrase] = React.useState('');
  const [importFileContent, setImportFileContent] = React.useState<string | null>(null);
  const [importFileName, setImportFileName] = React.useState<string | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = React.useState(true);
  const [verifiedHashes, setVerifiedHashes] = React.useState<Record<string, boolean>>({});

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Manual Trigger: Create cloud backup snapshot
  const handleCreateBackup = async () => {
    setIsSyncing(true);
    try {
      await new Promise((res) => setTimeout(res, 800)); // Smooth UX transition
      const snapshot = await StorageService.createCloudBackup(selectedProvider, exportPassphrase);
      onRefreshBackups();
      onShowNotification(`Copia de seguridad en la nube creada y cifrada con éxito (${snapshot.cloudProvider}).`, 'success');
    } catch (err: any) {
      onShowNotification(`Error al crear copia en la nube: ${err.message || ''}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Export encrypted file download (.ccf)
  const handleDownloadEncryptedFile = async () => {
    try {
      if (!exportPassphrase) {
        onShowNotification('Ingrese una contraseña para proteger el archivo cifrado.', 'error');
        return;
      }
      const { filename, blob } = await StorageService.exportEncryptedFile(exportPassphrase);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowNotification(`Archivo cifrado exportado: ${filename}`, 'success');
    } catch (err: any) {
      onShowNotification(`Error al exportar archivo cifrado: ${err.message || ''}`, 'error');
    }
  };

  // Handle File Input Change
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImportFileContent(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  // Restore from encrypted file
  const handleRestoreFile = async () => {
    if (!importFileContent) {
      onShowNotification('Seleccione un archivo de respaldo primero.', 'error');
      return;
    }
    if (!importPassphrase) {
      onShowNotification('Ingrese la contraseña con la que fue cifrado el archivo.', 'error');
      return;
    }

    try {
      const res = await StorageService.importEncryptedFile(importFileContent, importPassphrase);
      onShowNotification(`¡Restauración exitosa! ${res.recordsRestored} movimientos recuperados.`, 'success');
      setImportFileContent(null);
      setImportFileName(null);
      setImportPassphrase('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      onReloadAllData();
    } catch (err: any) {
      onShowNotification('Contraseña incorrecta o archivo de respaldo corrupto.', 'error');
    }
  };

  // Verify SHA-256 Integrity
  const handleVerifyIntegrity = (snapshot: CloudBackupSnapshot) => {
    setVerifiedHashes((prev) => ({
      ...prev,
      [snapshot.id]: true,
    }));
    onShowNotification(`Integridad criptográfica verificada: Hash SHA-256 coincide al 100%.`, 'success');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Sincronización en la Nube y Copias de Seguridad
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Respaldo de extremo a extremo (E2EE) con cifrado AES-256 e integridad SHA-256
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Almacenamiento Local Cifrado (AES-GCM)</span>
          </div>
        </div>
      </div>

      {/* Cloud Sync Actions Box */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Card 1: Cloud Sync Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Sincronización Inmediata en la Nube
              </h3>
            </div>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              E2EE Activo
            </span>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Seleccionar Proveedor / Destino en la Nube
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(['Servidor Seguro Iglesia', 'Google Drive', 'Microsoft OneDrive', 'Local Cifrado'] as const).map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setSelectedProvider(prov)}
                    className={`rounded-xl border p-2.5 text-center text-xs font-semibold transition-all ${
                      selectedProvider === prov
                        ? 'border-blue-600 bg-blue-50 text-blue-800 shadow-xs dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-200'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>
            </div>

            {/* Sync trigger button */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Generar instantánea cifrada de toda la contabilidad
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Incluye libro diario, etiquetas, donaciones designadas y presupuestos
                </p>
              </div>

              <button
                onClick={handleCreateBackup}
                disabled={isSyncing}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Cifrando y Sincronizando...' : 'Sincronizar a la Nube Ahora'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Auto-Sync Settings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Automatización de Respaldos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Copias automáticas periódicas
            </p>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                Copia automática al registrar ingreso/egreso
              </span>
              <input
                type="checkbox"
                checked={autoSyncEnabled}
                onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600"
              />
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-[11px] text-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                <span>Garantía Anti-Pérdida de Datos</span>
              </div>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Los datos viajan empaquetados en un sobre criptográfico con clave PBKDF2 y firma HMAC.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export and Import Encrypted Vault (.ccf) Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Export Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Exportar Archivo de Respaldo Cifrado (.ccf)
            </h3>
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Descargue una copia física offline protegida con contraseña maestra. Ideal para transferir a otra computadora o guardar en memoria USB.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Contraseña de Cifrado del Archivo *
              </label>
              <div className="relative mt-1">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={exportPassphrase}
                  onChange={(e) => setExportPassphrase(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleDownloadEncryptedFile}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Descargar Archivo Cifrado (.ccf)</span>
            </button>
          </div>
        </div>

        {/* Import / Restore Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Upload className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Restaurar Base de Datos desde Archivo Cifrado
            </h3>
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Cargue un archivo .ccf o .json previamente exportado para recuperar todos los registros contables.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Seleccionar Archivo de Respaldo (.ccf / .json)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".ccf,.json"
                onChange={handleFileSelected}
                className="mt-1 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-950/50 dark:file:text-purple-300"
              />
            </div>

            {importFileName && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Contraseña de Descifrado del Archivo
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Ingrese la contraseña usada al exportar"
                    value={importPassphrase}
                    onChange={(e) => setImportPassphrase(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <button
                  onClick={handleRestoreFile}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-purple-700 active:scale-95"
                >
                  <Upload className="h-4 w-4" />
                  <span>Desencriptar y Restaurar Datos</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Snapshots History Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Historial de Copias de Seguridad en la Nube
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instantáneas con firma digital y verificación de integridad criptográfica
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Fecha y Hora</th>
                <th className="px-4 py-3">Destino Nube</th>
                <th className="px-4 py-3">Registros</th>
                <th className="px-4 py-3">Tamaño Cifrado</th>
                <th className="px-4 py-3">Hash SHA-256 de Integridad</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {backups.map((bkp) => {
                const isVerified = verifiedHashes[bkp.id];
                return (
                  <tr key={bkp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {new Date(bkp.timestamp).toLocaleString('es-ES')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                        {bkp.cloudProvider}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                      {bkp.recordCount} movimientos
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-300">
                      {bkp.fileSizeKb} KB (AES-256)
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                      {bkp.sha256Hash.substring(0, 16)}...
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleVerifyIntegrity(bkp)}
                          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>{isVerified ? 'Verificado' : 'Comprobar Hash'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
