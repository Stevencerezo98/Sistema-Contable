import React from 'react';
import { Building2, Fingerprint, Lock, Key, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import { AuthService } from '../services/auth';

interface AuthModalProps {
  isOpen: boolean;
  users?: User[];
  onLoginSuccess: (user: User) => void;
  onShowNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  users: propUsers,
  onLoginSuccess,
  onShowNotification,
}) => {
  const users = (propUsers && propUsers.length > 0) ? propUsers : AuthService.getUsers();
  const [selectedUser, setSelectedUser] = React.useState<User | null>(() => (users && users.length > 0 ? users[0] : null));
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  React.useEffect(() => {
    if (users && users.length > 0 && !selectedUser) {
      setSelectedUser(users[0]);
      setPassword(AuthService.getUserPassword(users[0].username));
    }
  }, [users, selectedUser]);

  if (!isOpen) return null;

  const handleSelectUser = (u: User) => {
    setSelectedUser(u);
    setPassword(AuthService.getUserPassword(u.username));
    setErrorMsg('');
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsLoading(true);
    setErrorMsg('');

    try {
      const user = await AuthService.loginWithPassword(selectedUser.username, password);
      onLoginSuccess(user);
      onShowNotification(`¡Bienvenido al sistema, ${user.fullName}!`, 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Contraseña incorrecta.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!selectedUser) return;
    setIsLoading(true);
    setErrorMsg('');

    try {
      await new Promise((res) => setTimeout(res, 600));
      const user = await AuthService.authenticateWithBiometrics(selectedUser.id);
      onLoginSuccess(user);
      onShowNotification(`Acceso biométrico concedido: ${user.fullName}`, 'success');
    } catch (err: any) {
      setErrorMsg('Error en sensor biométrico. Ingrese con contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Church Branding Banner */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
            Sistema Contable Eclesiástico
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Departamento de Comunicaciones • Acceso Seguro RBAC
          </p>
        </div>

        {/* User Selection Carousel / List */}
        <div className="mt-6">
          <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">
            Seleccionar Usuario Oficial:
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {users.map((u) => {
              const isSelected = selectedUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectUser(u)}
                  className={`flex items-center gap-2 rounded-xl border p-2 text-left transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300'
                  }`}
                >
                  {u.avatarUrl ? (
                    <img
                      src={u.avatarUrl}
                      alt={u.fullName}
                      className="h-8 w-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200 shrink-0">
                      {u.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{u.fullName?.split(' ')?.[0] || u.fullName || 'Usuario'} {u.fullName?.split(' ')?.[1] || ''}</p>
                    <p className="text-[10px] capitalize text-slate-400 truncate">{u.role}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected User Details Badge */}
        {selectedUser && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-slate-400">Usuario activo: </span>
              <strong className="text-slate-800 dark:text-slate-200">@{selectedUser.username}</strong>
              <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold uppercase dark:bg-indigo-950 dark:text-indigo-300">
                {selectedUser.role}
              </span>
            </div>
            {selectedUser.biometricRegistered && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <Fingerprint className="h-3 w-3" /> Sensor Activo
              </span>
            )}
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mt-3 rounded-xl bg-rose-50 p-2.5 text-center text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            {errorMsg}
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handlePasswordLogin} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>{isLoading ? 'Verificando credenciales...' : 'Ingresar al Sistema'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Biometric Option */}
        {selectedUser?.biometricRegistered && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={isLoading}
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <Fingerprint className="h-4 w-4" />
              <span>Desbloquear con Huella Dactilar o FaceID</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
