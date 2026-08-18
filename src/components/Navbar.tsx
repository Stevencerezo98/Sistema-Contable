import React, { useState } from 'react';
import { 
  Lock, 
  CloudCheck, 
  Plus, 
  User as UserIcon, 
  LogOut, 
  Fingerprint, 
  Sun,
  Moon,
  Users
} from 'lucide-react';
import { User, TransactionType } from '../types';
import { AuthService } from '../services/auth';

interface NavbarProps {
  currentUser: User | null;
  onLockSession: () => void;
  onSwitchUser: () => void;
  onToggleTheme: () => void;
  darkMode: boolean;
  onNewTransaction: (type?: TransactionType) => void;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLockSession,
  onSwitchUser,
  onToggleTheme,
  darkMode,
  onNewTransaction,
  onNavigate,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const perms = AuthService.getUserPermissions(currentUser);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white px-4 sm:px-8 flex items-center justify-between dark:border-slate-800 dark:bg-slate-900 transition-colors">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs">
          E
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            Ecclesia Finance <span className="text-slate-400 font-normal">| Depto. Comunicaciones</span>
          </h1>
        </div>
      </div>

      {/* Right Controls & Status */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Cloud Sync Status */}
        {perms.canManageBackups && (
          <button
            onClick={() => onNavigate('backup')}
            title="Sincronización segura y cifrado AES-256"
            className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300 transition-colors"
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Sincronización en la Nube: Activa</span>
          </button>
        )}

        {/* Quick New Transaction Action if permitted */}
        {perms.canCreateTransaction && (
          <button
            onClick={() => onNewTransaction()}
            className="flex items-center gap-1.5 bg-slate-900 text-white rounded-xl px-3.5 py-2 text-xs font-medium hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Registro</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        )}

        {/* Quick Lock Button */}
        <button
          onClick={onLockSession}
          title="Bloqueo de sesión"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          <Lock className="h-3.5 w-3.5" />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleTheme}
          title="Cambiar tema visual"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          {darkMode ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        {/* User Profile dropdown */}
        <div className="relative border-l pl-3 sm:pl-6 border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 text-left transition-opacity hover:opacity-85"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                {currentUser?.fullName?.split(' ')[0]} {currentUser?.fullName?.split(' ')[1] || ''}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Rol: {currentUser?.role || 'invitado'}
              </p>
            </div>
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs dark:border-slate-800"
              />
            ) : (
              <div className="w-9 h-9 bg-slate-200 rounded-full border-2 border-white shadow-xs flex items-center justify-center font-bold text-slate-700 text-xs dark:bg-slate-700 dark:text-slate-200 dark:border-slate-800">
                {currentUser?.fullName?.charAt(0) || 'U'}
              </div>
            )}
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-100 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-800 z-50">
              <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {currentUser?.fullName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {currentUser?.email}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 uppercase">
                    {currentUser?.role}
                  </span>
                  {currentUser?.biometricRegistered && (
                    <span className="flex items-center gap-0.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <Fingerprint className="h-3 w-3" /> Biometría
                    </span>
                  )}
                </div>
              </div>

              <div className="py-1">
                {(perms.canManageUsers || currentUser?.role === 'director' || currentUser?.role === 'admin') && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('users-roles');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-indigo-600 font-semibold hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                  >
                    <Users className="h-4 w-4" />
                    <span>Usuarios y Roles</span>
                  </button>
                )}

                {perms.canManageSecurity && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('security');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/60"
                  >
                    <Fingerprint className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Seguridad y Auditoría</span>
                  </button>
                )}

                {perms.canManageBackups && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onNavigate('backup');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/60"
                  >
                    <CloudCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Copias en la Nube</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSwitchUser();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/60"
                >
                  <UserIcon className="h-4 w-4 text-slate-500" />
                  <span>Cambiar de Usuario / Probar Rol</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1 dark:border-slate-700">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLockSession();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Bloquear Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
