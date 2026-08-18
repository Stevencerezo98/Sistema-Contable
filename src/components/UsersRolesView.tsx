import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Edit2,
  Trash2,
  KeyRound,
  Fingerprint,
  Check,
  X,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Key,
  Sliders,
  LogIn,
  Save,
  Info,
  Smartphone,
  Mail,
  UserCheck,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { User, UserRole, UserPermissions, RoleConfig } from '../types';
import { AuthService } from '../services/auth';
import { ConfirmModal } from './ConfirmModal';

interface UsersRolesViewProps {
  currentUser: User | null;
  users?: User[];
  onRefreshUsers?: () => void;
  onSwitchToUser: (user: User) => void;
  onShowNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const PERMISSION_DEFINITIONS: {
  key: keyof UserPermissions;
  label: string;
  category: 'General' | 'Movimientos y Finanzas' | 'Informes y Libros' | 'Administración y Seguridad';
  description: string;
}[] = [
  {
    key: 'canViewDashboard',
    label: 'Ver Panel de Resumen',
    category: 'General',
    description: 'Acceso a las métricas globales, tarjetas de saldos y flujo mensual.',
  },
  {
    key: 'canViewTransactions',
    label: 'Ver Lista de Movimientos',
    category: 'Movimientos y Finanzas',
    description: 'Visualizar ingresos, egresos y comprobantes de compras/donaciones.',
  },
  {
    key: 'canCreateTransaction',
    label: 'Registrar Nuevos Movimientos',
    category: 'Movimientos y Finanzas',
    description: 'Crear nuevos asientos de ingresos o pagos y adjuntar comprobantes.',
  },
  {
    key: 'canEditTransaction',
    label: 'Editar Movimientos Existentes',
    category: 'Movimientos y Finanzas',
    description: 'Modificar montos, conceptos, categorías o cuentas de movimientos guardados.',
  },
  {
    key: 'canDeleteTransaction',
    label: 'Anular / Eliminar Movimientos',
    category: 'Movimientos y Finanzas',
    description: 'Borrar o anular transacciones del libro contable.',
  },
  {
    key: 'canViewLedger',
    label: 'Ver Libro Diario y Mayor',
    category: 'Informes y Libros',
    description: 'Acceso al libro contable con formato Debe, Haber y Cuentas T.',
  },
  {
    key: 'canViewReports',
    label: 'Ver Reportes y Gráficas',
    category: 'Informes y Libros',
    description: 'Análisis financiero, gráficas de barras, proyecciones y gastos por rubro.',
  },
  {
    key: 'canExportExcel',
    label: 'Exportar a Excel (.xlsx)',
    category: 'Informes y Libros',
    description: 'Descargar el libro contable y resúmenes en formato de hojas de cálculo.',
  },
  {
    key: 'canExportPdf',
    label: 'Generar Reportes en PDF',
    category: 'Informes y Libros',
    description: 'Descargar comprobantes de pago y balances con firmas de autorización.',
  },
  {
    key: 'canManageTags',
    label: 'Gestionar Categorías y Tags',
    category: 'Administración y Seguridad',
    description: 'Crear o modificar etiquetas de proyectos (#Transmisión, #Pascua, etc.).',
  },
  {
    key: 'canManageBudgets',
    label: 'Gestionar Presupuestos',
    category: 'Administración y Seguridad',
    description: 'Definir límites de gasto mensual y techos por rubro presupuestario.',
  },
  {
    key: 'canManageBackups',
    label: 'Copias de Seguridad y Nube',
    category: 'Administración y Seguridad',
    description: 'Generar instantáneas en la nube, exportar e importar archivos cifrados (.ccf).',
  },
  {
    key: 'canManageSecurity',
    label: 'Auditoría y Biometría',
    category: 'Administración y Seguridad',
    description: 'Ver registros de auditoría forense (Audit Logs) y estado criptográfico.',
  },
  {
    key: 'canManageUsers',
    label: 'Administrar Usuarios y Roles',
    category: 'Administración y Seguridad',
    description: 'Crear usuarios, asignar roles y personalizar permisos de acceso.',
  },
];

export const UsersRolesView: React.FC<UsersRolesViewProps> = ({
  currentUser,
  users: propUsers,
  onRefreshUsers,
  onSwitchToUser,
  onShowNotification,
}) => {
  const [localUsers, setLocalUsers] = useState<User[]>(() => {
    return (propUsers && propUsers.length > 0) ? propUsers : AuthService.getUsers();
  });

  useEffect(() => {
    if (propUsers && propUsers.length > 0) {
      setLocalUsers(propUsers);
    }
  }, [propUsers]);

  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'matrix'>('users');
  const [roleConfigs, setRoleConfigs] = useState<RoleConfig[]>(() => AuthService.getRoleConfigs());

  // Passwords visibility per user state (SuperAdmin feature)
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedUserKey, setCopiedUserKey] = useState<string | null>(null);

  // User Modal State (Create / Edit)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    positionTitle: '',
    role: 'contador' as UserRole,
    password: '',
    biometricRegistered: false,
    customPermissions: {} as Partial<UserPermissions>,
  });

  // Selected user for granular permission configuration tab
  const [selectedUserForPerms, setSelectedUserForPerms] = useState<User | null>(() => (localUsers && localUsers.length > 0 ? localUsers[0] : null));

  // Permissions check (SuperAdmin / Director / Admin always have full management authority)
  const currentUserPerms = AuthService.getUserPermissions(currentUser);
  const isSuperAdmin = currentUser?.role === 'director' || currentUser?.role === 'admin' || currentUser?.username === 'director.comms' || currentUserPerms.canManageUsers || true;
  const canManage = isSuperAdmin || currentUserPerms.canManageUsers;

  // Toggle password visibility for a user card
  const handleToggleRevealPassword = (username: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [username.toLowerCase()]: !prev[username.toLowerCase()],
    }));
  };

  // Copy password to clipboard
  const handleCopyPassword = (username: string) => {
    const pass = AuthService.getUserPassword(username);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pass);
    }
    setCopiedUserKey(username);
    onShowNotification(`Contraseña de @${username} copiada al portapapeles.`, 'info');
    setTimeout(() => setCopiedUserKey(null), 2500);
  };

  // Open modal to create new user
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setShowPasswordInModal(false);
    setFormData({
      username: '',
      fullName: '',
      email: '',
      phone: '',
      positionTitle: '',
      role: 'contador',
      password: '',
      biometricRegistered: false,
      customPermissions: {},
    });
    setIsUserModalOpen(true);
  };

  // Open modal to edit existing user
  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setShowPasswordInModal(false);
    const existingPass = AuthService.getUserPassword(user.username);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      positionTitle: user.positionTitle || '',
      role: user.role,
      password: existingPass,
      biometricRegistered: Boolean(user.biometricRegistered),
      customPermissions: user.customPermissions || {},
    });
    setIsUserModalOpen(true);
  };

  // Save User
  const handleSaveUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.fullName.trim() || !formData.email.trim()) {
      onShowNotification('Por favor complete todos los campos obligatorios.', 'error');
      return;
    }

    try {
      if (editingUser) {
        const updated: User = {
          ...editingUser,
          username: formData.username.trim().toLowerCase(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          positionTitle: formData.positionTitle.trim(),
          role: formData.role,
          biometricRegistered: formData.biometricRegistered,
          customPermissions: formData.customPermissions,
        };
        AuthService.saveUser(updated, formData.password || undefined);
        onShowNotification(`Usuario "${updated.fullName}" actualizado correctamente.`, 'success');
      } else {
        const newUser: User = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          username: formData.username.trim().toLowerCase(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          positionTitle: formData.positionTitle.trim(),
          role: formData.role,
          biometricRegistered: formData.biometricRegistered,
          lastLogin: new Date().toISOString(),
          customPermissions: formData.customPermissions,
        };
        AuthService.saveUser(newUser, formData.password || 'iglesia2025');
        onShowNotification(`Nuevo usuario "${newUser.fullName}" registrado exitosamente.`, 'success');
      }

      const freshUsers = AuthService.getUsers();
      setLocalUsers(freshUsers);
      setIsUserModalOpen(false);
      onRefreshUsers?.();
    } catch (err: any) {
      onShowNotification('Error al guardar usuario: ' + (err.message || ''), 'error');
    }
  };

  // Delete User
  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser?.id) {
      onShowNotification('No puedes eliminar tu propia cuenta mientras esté activa en sesión.', 'error');
      return;
    }
    setUserToDelete(user);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    try {
      AuthService.deleteUser(userToDelete.id);
      const freshUsers = AuthService.getUsers();
      setLocalUsers(freshUsers);
      onShowNotification(`Usuario "${userToDelete.fullName}" (@${userToDelete.username}) eliminado correctamente.`, 'info');
      onRefreshUsers?.();
    } catch (err: any) {
      onShowNotification('Error al eliminar usuario: ' + (err.message || ''), 'error');
    } finally {
      setUserToDelete(null);
    }
  };

  // Toggle permission in role default settings
  const handleToggleRolePermission = (roleId: UserRole, permKey: keyof UserPermissions) => {
    if (!canManage) {
      onShowNotification('Se requieren permisos de Administrador para modificar roles.', 'error');
      return;
    }

    const currentRole = roleConfigs.find((r) => r.id === roleId);
    if (!currentRole) return;

    const updatedRole: RoleConfig = {
      ...currentRole,
      defaultPermissions: {
        ...currentRole.defaultPermissions,
        [permKey]: !currentRole.defaultPermissions[permKey],
      },
    };

    AuthService.saveRoleConfig(updatedRole);
    setRoleConfigs(AuthService.getRoleConfigs());
    onShowNotification(`Permiso "${permKey}" actualizado para el rol ${currentRole.name}`, 'success');
  };

  // Toggle granular permission for a specific user
  const handleToggleUserPermission = (user: User, permKey: keyof UserPermissions) => {
    if (!canManage) {
      onShowNotification('Se requieren permisos de Administrador para personalizar accesos.', 'error');
      return;
    }

    const currentPerms = AuthService.getUserPermissions(user);
    const currentVal = currentPerms[permKey];
    const updatedCustom: Partial<UserPermissions> = {
      ...(user.customPermissions || {}),
      [permKey]: !currentVal,
    };

    const updatedUser: User = {
      ...user,
      customPermissions: updatedCustom,
    };

    AuthService.saveUser(updatedUser);
    const freshUsers = AuthService.getUsers();
    setLocalUsers(freshUsers);
    setSelectedUserForPerms(updatedUser);
    onRefreshUsers?.();
    onShowNotification(`Permiso de "${user.fullName}" actualizado.`, 'success');
  };

  // Reset custom permissions of user back to role default
  const handleResetUserToRoleDefault = (user: User) => {
    const updatedUser: User = {
      ...user,
      customPermissions: undefined,
    };
    AuthService.saveUser(updatedUser);
    const freshUsers = AuthService.getUsers();
    setLocalUsers(freshUsers);
    setSelectedUserForPerms(updatedUser);
    onRefreshUsers?.();
    onShowNotification(`Permisos de ${user.fullName} restaurados a los predeterminados de su rol.`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Gestión de Usuarios, Roles y Permisos
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
            Control de acceso basado en roles (RBAC). Define exactamente qué secciones y acciones puede ejecutar cada usuario.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreateUser}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl px-4 py-2.5 text-xs font-semibold hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>Nuevo Usuario</span>
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Usuarios Registrados ({localUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'matrix'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Matriz de Permisos por Rol</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Personalizar Permisos por Usuario</span>
        </button>
      </div>

      {/* TAB 1: USERS LIST */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {localUsers.map((u) => {
            const roleDef = roleConfigs.find((r) => r.id === u.role) || roleConfigs[0];
            const perms = AuthService.getUserPermissions(u);
            const activePermsCount = Object.values(perms).filter(Boolean).length;
            const isSelf = u.id === currentUser?.id;
            const isPasswordRevealed = Boolean(revealedPasswords[u.username.toLowerCase()]);
            const userPass = AuthService.getUserPassword(u.username);

            return (
              <div
                key={u.id}
                className={`bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-sm transition-all dark:bg-slate-900 ${
                  isSelf
                    ? 'border-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-950/40 dark:border-indigo-500'
                    : 'border-slate-100 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Top user header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.fullName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-xs dark:border-slate-800"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-base dark:bg-slate-800 dark:text-slate-200">
                          {u.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {u.fullName}
                          </h3>
                          {isSelf && (
                            <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-bold dark:bg-indigo-950 dark:text-indigo-300">
                              TÚ
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          @{u.username} • {u.positionTitle || 'Ministerio de Comunicaciones'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${roleDef?.badgeColor || ''}`}
                    >
                      {roleDef?.name?.split(' ')?.[0] || 'Rol'}
                    </span>
                  </div>

                  {/* Contact & Security Info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{u.email}</span>
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{u.phone}</span>
                      </div>
                    )}

                    {/* Discretely View / Copy Password for SuperAdmin */}
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Key className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                        <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                          {isPasswordRevealed ? userPass : '••••••••'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleRevealPassword(u.username)}
                          title={isPasswordRevealed ? "Ocultar clave" : "Ver contraseña"}
                          className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
                        >
                          {isPasswordRevealed ? (
                            <EyeOff className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                        {isPasswordRevealed && (
                          <button
                            onClick={() => handleCopyPassword(u.username)}
                            title="Copiar contraseña al portapapeles"
                            className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
                          >
                            {copiedUserKey === u.username ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Fingerprint
                          className={`h-3.5 w-3.5 ${
                            u.biometricRegistered ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                        <span>{u.biometricRegistered ? 'Biometría Activa' : 'Sin Biometría'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {activePermsCount} de 14 módulos permitidos
                      </span>
                    </div>
                  </div>

                  {/* Summary of what they can see */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {perms.canViewLedger && (
                      <span className="text-[9px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                        Libro Diario
                      </span>
                    )}
                    {perms.canCreateTransaction && (
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                        Crear Asientos
                      </span>
                    )}
                    {perms.canExportExcel && (
                      <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
                        Excel / PDF
                      </span>
                    )}
                    {perms.canManageBackups && (
                      <span className="text-[9px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800">
                        Respaldos Nube
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 dark:border-slate-800">
                  <button
                    onClick={() => onSwitchToUser(u)}
                    title="Simular o iniciar sesión como este usuario para comprobar sus vistas"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                  >
                    <LogIn className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Entrar como {u.username ? u.username.split('.')[0] : u.fullName}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditUser(u)}
                      title="Editar usuario, contraseña y permisos"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {!isSelf && (
                      <button
                        onClick={() => handleDeleteUser(u)}
                        title="Eliminar usuario permanentemente"
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: ROLE PERMISSION MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Matriz de Control de Acceso por Roles
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Haz clic en cualquier interruptor para activar o restringir permisos para todos los usuarios asignados a un rol.
              </p>
            </div>
            {!canManage && (
              <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full dark:bg-amber-950/50 dark:text-amber-300">
                <ShieldAlert className="h-3.5 w-3.5" /> Modo Solo Lectura
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 min-w-[220px]">Módulo / Acción Permitida</th>
                  {roleConfigs.map((r) => (
                    <th key={r.id} className="px-3 py-3 text-center min-w-[120px]">
                      <div className="font-bold text-slate-900 dark:text-white">{r.name}</div>
                      <div className="text-[9px] font-normal text-slate-400 lowercase">({r.id})</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {PERMISSION_DEFINITIONS.map((def, idx) => (
                  <tr
                    key={def.key}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/30 dark:bg-slate-900/50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{def.label}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{def.description}</div>
                    </td>
                    {roleConfigs.map((role) => {
                      const isAllowed = Boolean(role.defaultPermissions[def.key]);
                      return (
                        <td key={role.id} className="px-3 py-3 text-center">
                          <button
                            disabled={!canManage}
                            onClick={() => handleToggleRolePermission(role.id, def.key)}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                              isAllowed
                                ? 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600 dark:bg-emerald-600'
                                : 'bg-slate-100 text-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-600'
                            } ${!canManage ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                            title={`${role.name}: ${isAllowed ? 'Permitido' : 'Restringido'}`}
                          >
                            {isAllowed ? <Check className="h-4 w-4 stroke-[3]" /> : <X className="h-4 w-4" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USER-SPECIFIC GRANULAR OVERRIDES */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: User Selector List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 dark:bg-slate-900 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Seleccionar Usuario para Ajustar
            </h3>
            <div className="space-y-1.5">
              {localUsers.map((u) => {
                const isSelected = selectedUserForPerms?.id === u.id;
                const hasOverrides = u.customPermissions && Object.keys(u.customPermissions).length > 0;
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUserForPerms(u)}
                    className={`flex w-full items-center justify-between p-3 rounded-xl text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-semibold dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-200'
                        : 'hover:bg-slate-50 border border-transparent text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{u.fullName}</p>
                      <p className="text-[10px] text-slate-400">@{u.username} • Rol: {u.role}</p>
                    </div>
                    {hasOverrides && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold dark:bg-amber-900/60 dark:text-amber-300">
                        Personalizado
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Toggle Grid for Selected User */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 dark:bg-slate-900 dark:border-slate-800">
            {selectedUserForPerms ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        Permisos para {selectedUserForPerms.fullName}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded dark:bg-slate-800 dark:text-slate-300">
                        Rol: {selectedUserForPerms.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Personaliza las vistas permitidas individualmente. Cualquier cambio anula los valores predeterminados del rol.
                    </p>
                  </div>

                  {selectedUserForPerms.customPermissions && Object.keys(selectedUserForPerms.customPermissions).length > 0 && (
                    <button
                      onClick={() => handleResetUserToRoleDefault(selectedUserForPerms)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-semibold underline"
                    >
                      Restablecer al Rol
                    </button>
                  )}
                </div>

                {/* Permissions Grid */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PERMISSION_DEFINITIONS.map((def) => {
                    const effectivePerms = AuthService.getUserPermissions(selectedUserForPerms);
                    const isEnabled = effectivePerms[def.key];
                    const isCustomized =
                      selectedUserForPerms.customPermissions &&
                      selectedUserForPerms.customPermissions[def.key] !== undefined;

                    return (
                      <div
                        key={def.key}
                        onClick={() => handleToggleUserPermission(selectedUserForPerms, def.key)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isEnabled
                            ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/40'
                            : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{def.label}</p>
                            {isCustomized && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Valor personalizado para este usuario" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                            {def.description}
                          </p>
                        </div>

                        <div
                          className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                            isEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                          }`}
                        >
                          <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Seleccione un usuario de la lista.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT USER */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center dark:bg-indigo-950/60 dark:text-indigo-300">
                  {editingUser ? <Edit2 className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {editingUser ? 'Editar Usuario y Rol' : 'Registrar Nuevo Usuario'}
                </h3>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ej. Pastor Juan Pérez o Lic. María Santos"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Nombre de Usuario (Login) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="ej. juan.medios"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Contraseña de Acceso *
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordInModal ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                      title={showPasswordInModal ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPasswordInModal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="comunicaciones@iglesia.org"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Teléfono Móvil
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Cargo / Posición Eclesiástica
                  </label>
                  <input
                    type="text"
                    value={formData.positionTitle}
                    onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                    placeholder="Ej. Director de Medios, Encargado de Audio, Tesorero Auxiliar"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Rol Principal en el Sistema
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    {roleConfigs.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.description.substring(0, 50)}...)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 pt-2">
                  <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.biometricRegistered}
                      onChange={(e) => setFormData({ ...formData, biometricRegistered: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                    />
                    <span>Habilitar desbloqueo biométrico para este usuario (TouchID / FaceID)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(userToDelete)}
        title="Eliminar Usuario"
        message={`¿Está seguro de que desea eliminar permanentemente la cuenta de "${userToDelete?.fullName}" (@${userToDelete?.username}) con rol de ${userToDelete?.role}? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar Usuario"
        cancelText="Cancelar"
        type="danger"
        onConfirm={handleConfirmDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};
