import React, { useState, useEffect } from 'react';
import { Fingerprint, Lock, Key, ShieldCheck, Building2, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { User } from '../types';
import { AuthService } from '../services/auth';

interface LockScreenProps {
  currentUser: User | null;
  onUnlock: () => void;
  onShowNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  currentUser,
  onUnlock,
  onShowNotification,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingBio, setIsVerifyingBio] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasBiometricHardware, setHasBiometricHardware] = useState<boolean | null>(null);

  useEffect(() => {
    AuthService.isBiometricHardwareAvailable().then((available) => {
      setHasBiometricHardware(available);
    });
  }, []);

  const handleBiometricUnlock = async () => {
    setIsVerifyingBio(true);
    setErrorMsg('');
    try {
      if (!currentUser?.biometricRegistered) {
        throw new Error('Este usuario no tiene biometría/huella enrolada en su perfil. Ingrese con contraseña.');
      }
      if (!hasBiometricHardware) {
        throw new Error('Esta laptop o dispositivo no cuenta con sensor de huella o Face ID. Ingrese con contraseña.');
      }

      await AuthService.authenticateWithBiometrics(currentUser?.id);
      onUnlock();
      onShowNotification(`Sesión desbloqueada por biometría (${currentUser?.fullName}).`, 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error en sensor biométrico. Ingrese con su contraseña.');
    } finally {
      setIsVerifyingBio(false);
    }
  };

  const handlePasswordUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (!currentUser) return;
      await AuthService.loginWithPassword(currentUser.username, password);
      onUnlock();
      onShowNotification('Sesión desbloqueada con éxito.', 'success');
    } catch (err: any) {
      setErrorMsg(err.message || 'Contraseña incorrecta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900/95 p-8 text-center text-white shadow-2xl">
        {/* Church Seal */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20">
          <Building2 className="h-8 w-8 text-white" />
        </div>

        <h2 className="mt-4 text-lg font-bold">Sesión Bloqueada</h2>
        <p className="text-xs text-slate-400">
          Sistema Contable • Depto. Comunicaciones
        </p>

        {/* User Info */}
        <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-slate-800/60 p-3 border border-slate-700/50">
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
          )}
          <div className="text-left">
            <div className="text-xs font-bold text-white">{currentUser?.fullName}</div>
            <div className="text-[10px] text-slate-400 capitalize">@{currentUser?.username} • {currentUser?.role}</div>
          </div>
        </div>

        {/* Biometric Fast Unlock Button */}
        <div className="mt-6 space-y-1.5">
          <button
            onClick={handleBiometricUnlock}
            disabled={isVerifyingBio}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold transition shadow-lg ${
              currentUser?.biometricRegistered && hasBiometricHardware
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110 shadow-blue-500/25 active:scale-95'
                : 'bg-slate-800 text-slate-400 border border-slate-700/70 hover:bg-slate-700/80 hover:text-slate-200'
            }`}
          >
            <Fingerprint className={`h-4 w-4 ${isVerifyingBio ? 'animate-pulse text-indigo-400' : ''}`} />
            <span>{isVerifyingBio ? 'Escaneando sensor biométrico...' : 'Desbloquear con Biometría (Huella / Face ID)'}</span>
          </button>

          {!hasBiometricHardware && (
            <p className="text-[10px] text-slate-500">
              Dispositivo sin sensor de huellas dactilares detectado.
            </p>
          )}
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] uppercase text-slate-500">O con contraseña</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-3 flex items-start gap-2 rounded-xl bg-rose-950/50 p-2.5 text-left text-xs font-semibold text-rose-300 border border-rose-800/60">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Password fallback form */}
        <form onSubmit={handlePasswordUnlock} className="space-y-3">
          <div className="relative">
            <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña de acceso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 pl-9 pr-9 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition"
              title={showPassword ? 'Ocultar' : 'Ver'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <span>Desbloquear con Contraseña</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Protegido con Cifrado AES-256</span>
        </div>
      </div>
    </div>
  );
};
