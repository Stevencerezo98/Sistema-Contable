import React from 'react';
import {
  ShieldCheck,
  Fingerprint,
  Lock,
  Key,
  Users,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  History,
  Trash2,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { User, AuditLogEntry } from '../types';
import { AuthService } from '../services/auth';
import { ConfirmModal } from './ConfirmModal';

interface SecurityViewProps {
  currentUser: User | null;
  users: User[];
  auditLogs: AuditLogEntry[];
  onRefreshLogs: () => void;
  onShowNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onRefreshUser: () => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  currentUser,
  users,
  auditLogs,
  onRefreshLogs,
  onShowNotification,
  onRefreshUser,
}) => {
  const [isRegisteringBio, setIsRegisteringBio] = React.useState(false);
  const [logFilter, setLogFilter] = React.useState<string>('TODOS');
  const [showPasswords, setShowPasswords] = React.useState(false);
  const [hasBiometricHardware, setHasBiometricHardware] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    AuthService.isBiometricHardwareAvailable().then((available) => {
      setHasBiometricHardware(available);
    });
  }, []);

  const handleRegisterBiometrics = async () => {
    if (!currentUser) return;
    setIsRegisteringBio(true);
    try {
      const ok = await AuthService.registerBiometrics(currentUser);
      if (ok) {
        onRefreshUser();
        onRefreshLogs();
        onShowNotification('¡Sensor biométrico (Huella / Face ID) registrado con éxito!', 'success');
      }
    } catch (err: any) {
      onShowNotification(err.message || 'Error en hardware biométrico: no se detectó sensor compatible.', 'error');
    } finally {
      setIsRegisteringBio(false);
    }
  };

  const [isClearLogsModalOpen, setIsClearLogsModalOpen] = React.useState(false);

  const handleClearLogs = () => {
    setIsClearLogsModalOpen(true);
  };

  const handleConfirmClearLogs = () => {
    AuthService.clearAuditLogs();
    onRefreshLogs();
    onShowNotification('Registro de auditoría limpiado con éxito.', 'info');
    setIsClearLogsModalOpen(false);
  };

  const filteredLogs = React.useMemo(() => {
    if (logFilter === 'TODOS') return auditLogs;
    return auditLogs.filter((l) => l.action.includes(logFilter));
  }, [auditLogs, logFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Centro de Seguridad, Biometría y Cifrado
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control de acceso por roles, autenticación biométrica WebAuthn y registro de auditoría
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Lock className="h-3.5 w-3.5" />
            <span>AES-GCM-256 Activo</span>
          </span>
        </div>
      </div>

      {/* Grid of Security Modules */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Module 1: Biometric Access (WebAuthn / Touch ID / Face ID) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Acceso Biométrico
              </h3>
            </div>
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                currentUser?.biometricRegistered
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              {currentUser?.biometricRegistered ? 'Enrolado' : 'Pendiente'}
            </span>
          </div>

          <div className="mt-4 flex flex-col items-center text-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-3xl transition-all ${
                currentUser?.biometricRegistered
                  ? 'bg-emerald-50 text-emerald-600 shadow-md shadow-emerald-500/10 dark:bg-emerald-950/50 dark:text-emerald-400'
                  : 'bg-blue-50 text-blue-600 shadow-md shadow-blue-500/10 dark:bg-blue-950/50 dark:text-blue-400'
              }`}
            >
              <Fingerprint className="h-10 w-10" />
            </div>

            <h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
              {currentUser?.fullName}
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Permite desbloquear la aplicación en dispositivos compatibles con Touch ID, Face ID o sensor dactilar físico.
            </p>

            <div className="mt-3 w-full rounded-xl bg-slate-50 p-2.5 text-left text-[11px] border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500 dark:text-slate-400">Sensor en este equipo:</span>
                <span className={`font-bold ${hasBiometricHardware ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {hasBiometricHardware ? '✓ Disponible' : '✗ No detectado'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {hasBiometricHardware
                  ? 'Tu equipo cuenta con sensor biométrico compatible (Windows Hello / Touch ID).'
                  : 'Esta laptop no cuenta con lector de huellas o Face ID compatible; el acceso debe ser por contraseña.'}
              </p>
            </div>

            <button
              onClick={handleRegisterBiometrics}
              disabled={isRegisteringBio || !hasBiometricHardware}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:bg-slate-700"
            >
              <Fingerprint className="h-4 w-4" />
              <span>
                {currentUser?.biometricRegistered
                  ? 'Re-calibrar Sensor Biométrico'
                  : 'Enrolar Huella / Face ID Ahora'}
              </span>
            </button>
          </div>
        </div>

        {/* Module 2: Local Encryption Vault Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Bóveda de Cifrado Local y E2EE
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              Web Crypto API
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Algoritmo</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">AES-GCM-256</div>
              <p className="mt-1 text-[10px] text-slate-500">Cifrado de autenticación simétrica de grado bancario</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Derivación de Clave</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">PBKDF2 SHA-256</div>
              <p className="mt-1 text-[10px] text-slate-500">100,000 iteraciones con sal de 16 bytes</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <span className="text-[10px] font-bold uppercase text-slate-400">Integridad E2EE</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Checksum SHA-256</div>
              <p className="mt-1 text-[10px] text-slate-500">Comprobación anti-manipulación de transferencias</p>
            </div>
          </div>

          {/* User accounts list */}
          <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                Usuarios y Roles Autorizados
              </h4>
              <button
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700"
              >
                {showPasswords ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                <span>{showPasswords ? 'Ocultar Contraseñas Demo' : 'Ver Contraseñas Demo'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                      {u.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{u.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">@{u.username}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {u.role}
                    </span>
                    {showPasswords && (
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                        pass: {u.role === 'director' ? 'comms2025' : u.role === 'tesorero' ? 'tesoro2025' : 'cuenta2025'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security Audit Log (Audit Trail) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Registro de Auditoría y Trazabilidad (Audit Log)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Historial cronológico de accesos, biometría, modificaciones financieras y exportaciones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="TODOS">Todos los Eventos</option>
              <option value="LOGIN">Inicios de Sesión</option>
              <option value="BIOMETRIC">Biometría</option>
              <option value="TRANSACTION">Movimientos Contables</option>
              <option value="EXPORT">Exportaciones Excel/PDF</option>
              <option value="BACKUP">Copias de Seguridad</option>
            </select>

            <button
              onClick={handleClearLogs}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-rose-950/30"
              title="Limpiar registro"
            >
              <Trash2 className="h-3 w-3" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>

        <div className="mt-4 max-h-80 overflow-y-auto">
          <div className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                No hay registros de auditoría que coincidan con el filtro.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-16 items-center justify-center rounded-md text-[9px] font-bold ${
                        (log.action || '').includes('LOGIN') || (log.action || '').includes('BIOMETRIC')
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                          : (log.action || '').includes('TRANSACTION')
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                      }`}
                    >
                      {log.action ? log.action.split('_')[0] : 'LOG'}
                    </span>
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{log.details}</span>
                      <div className="text-[10px] text-slate-400">
                        {log.userName} • {log.ipOrDevice}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Clear Logs Confirm Modal */}
      <ConfirmModal
        isOpen={isClearLogsModalOpen}
        title="Vaciar Registro de Auditoría"
        message="¿Está seguro de que desea eliminar permanentemente todo el historial de eventos de auditoría y trazabilidad? Esta acción no se puede deshacer."
        confirmText="Sí, Vaciar Registro"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleConfirmClearLogs}
        onCancel={() => setIsClearLogsModalOpen(false)}
      />
    </div>
  );
};
