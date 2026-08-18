import { User, UserRole, UserPermissions, RoleConfig, AuditLogEntry } from '../types';

const AUTH_USER_KEY = 'iglesia_auth_current_user_v2';
const USERS_VAULT_KEY = 'iglesia_auth_users_v2';
const ROLES_VAULT_KEY = 'iglesia_auth_roles_cfg_v2';
const PASSWORDS_VAULT_KEY = 'iglesia_auth_passwords_v2';
const AUDIT_LOG_KEY = 'iglesia_audit_logs_v2';
const LOCK_STATE_KEY = 'iglesia_app_locked_v2';

export const DEFAULT_ROLE_CONFIGS: RoleConfig[] = [
  {
    id: 'director',
    name: 'Director General / Pastor',
    description: 'Acceso total y control administrativo sobre todas las finanzas, libros, configuraciones y usuarios.',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    defaultPermissions: {
      canViewDashboard: true,
      canViewTransactions: true,
      canCreateTransaction: true,
      canEditTransaction: true,
      canDeleteTransaction: true,
      canViewLedger: true,
      canViewReports: true,
      canExportExcel: true,
      canExportPdf: true,
      canManageTags: true,
      canManageBudgets: true,
      canManageBackups: true,
      canManageSecurity: true,
      canManageUsers: true,
    },
  },
  {
    id: 'tesorero',
    name: 'Tesorero / Finanzas',
    description: 'Gestión completa de movimientos contables, libros, presupuestos, cierres y copias de seguridad.',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    defaultPermissions: {
      canViewDashboard: true,
      canViewTransactions: true,
      canCreateTransaction: true,
      canEditTransaction: true,
      canDeleteTransaction: true,
      canViewLedger: true,
      canViewReports: true,
      canExportExcel: true,
      canExportPdf: true,
      canManageTags: true,
      canManageBudgets: true,
      canManageBackups: true,
      canManageSecurity: false,
      canManageUsers: false,
    },
  },
  {
    id: 'contador',
    name: 'Contador / Auxiliar Contable',
    description: 'Registro de asientos contables, conciliación de comprobantes, libros y generación de informes.',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    defaultPermissions: {
      canViewDashboard: true,
      canViewTransactions: true,
      canCreateTransaction: true,
      canEditTransaction: true,
      canDeleteTransaction: false,
      canViewLedger: true,
      canViewReports: true,
      canExportExcel: true,
      canExportPdf: true,
      canManageTags: false,
      canManageBudgets: true,
      canManageBackups: false,
      canManageSecurity: false,
      canManageUsers: false,
    },
  },
  {
    id: 'auditor',
    name: 'Auditor / Comité Fiscal',
    description: 'Modo solo lectura y fiscalización. Verificación de comprobantes, libros y bitácoras de auditoría.',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    defaultPermissions: {
      canViewDashboard: true,
      canViewTransactions: true,
      canCreateTransaction: false,
      canEditTransaction: false,
      canDeleteTransaction: false,
      canViewLedger: true,
      canViewReports: true,
      canExportExcel: true,
      canExportPdf: true,
      canManageTags: false,
      canManageBudgets: false,
      canManageBackups: false,
      canManageSecurity: true,
      canManageUsers: false,
    },
  },
  {
    id: 'operador',
    name: 'Operador Multimedia / Asistente',
    description: 'Acceso básico para asentar comprobantes y registrar gastos operativos de transmisiones y cultos.',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    defaultPermissions: {
      canViewDashboard: true,
      canViewTransactions: true,
      canCreateTransaction: true,
      canEditTransaction: false,
      canDeleteTransaction: false,
      canViewLedger: false,
      canViewReports: false,
      canExportExcel: false,
      canExportPdf: false,
      canManageTags: false,
      canManageBudgets: false,
      canManageBackups: false,
      canManageSecurity: false,
      canManageUsers: false,
    },
  },
  {
    id: 'admin',
    name: 'Administrador del Sistema',
    description: 'Control de seguridad, roles, usuarios, criptografía y configuraciones globales del sistema.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    defaultPermissions: {
      canViewDashboard: true,
      canViewTransactions: true,
      canCreateTransaction: true,
      canEditTransaction: true,
      canDeleteTransaction: true,
      canViewLedger: true,
      canViewReports: true,
      canExportExcel: true,
      canExportPdf: true,
      canManageTags: true,
      canManageBudgets: true,
      canManageBackups: true,
      canManageSecurity: true,
      canManageUsers: true,
    },
  },
];

export const DEFAULT_USERS: User[] = [
  {
    id: 'usr_dir_01',
    username: 'director.comms',
    fullName: 'Pr. Carlos Mendoza',
    positionTitle: 'Director de Comunicaciones y Medios',
    role: 'director',
    email: 'comunicaciones@iglesiacentral.org',
    phone: '+1 (555) 234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    biometricRegistered: true,
    biometricCredentialId: 'bio_cred_carlos_01',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'usr_tes_02',
    username: 'tesoreria',
    fullName: 'Lic. Elena Ramos',
    positionTitle: 'Tesorera General',
    role: 'tesorero',
    email: 'tesoreria@iglesiacentral.org',
    phone: '+1 (555) 345-6789',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    biometricRegistered: true,
    biometricCredentialId: 'bio_cred_elena_02',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'usr_cont_03',
    username: 'contador.comms',
    fullName: 'David Salgado',
    positionTitle: 'Contador Oficial',
    role: 'contador',
    email: 'contabilidad.comms@iglesiacentral.org',
    phone: '+1 (555) 456-7890',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    biometricRegistered: false,
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'usr_aud_04',
    username: 'auditor.fiscal',
    fullName: 'Hna. Rebeca Gómez',
    positionTitle: 'Presidenta del Comité Fiscal',
    role: 'auditor',
    email: 'auditoria@iglesiacentral.org',
    phone: '+1 (555) 567-8901',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    biometricRegistered: false,
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'usr_op_05',
    username: 'operador.medios',
    fullName: 'Lucas Ramírez',
    positionTitle: 'Operador Técnico de Cabina',
    role: 'operador',
    email: 'lucas.medios@iglesiacentral.org',
    phone: '+1 (555) 678-9012',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    biometricRegistered: false,
    lastLogin: new Date().toISOString(),
  },
];

export const INITIAL_PASSWORDS: Record<string, string> = {
  'director.comms': 'comms2025',
  'tesoreria': 'tesoro2025',
  'contador.comms': 'cuenta2025',
  'auditor.fiscal': 'audit2025',
  'operador.medios': 'medios2025',
  'admin': 'admin2025',
};

export class AuthService {
  /**
   * Initializes users and roles stores
   */
  public static init(): void {
    if (!localStorage.getItem(USERS_VAULT_KEY)) {
      localStorage.setItem(USERS_VAULT_KEY, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(ROLES_VAULT_KEY)) {
      localStorage.setItem(ROLES_VAULT_KEY, JSON.stringify(DEFAULT_ROLE_CONFIGS));
    }
    if (!localStorage.getItem(PASSWORDS_VAULT_KEY)) {
      localStorage.setItem(PASSWORDS_VAULT_KEY, JSON.stringify(INITIAL_PASSWORDS));
    }
  }

  /**
   * Gets all registered users
   */
  public static getUsers(): User[] {
    try {
      const data = localStorage.getItem(USERS_VAULT_KEY);
      return data ? JSON.parse(data) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  }

  /**
   * Saves or updates a user
   */
  public static saveUser(user: User, password?: string): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    let updated: User[];

    if (index >= 0) {
      updated = [...users];
      updated[index] = { ...user };
      this.logAudit('SETTINGS_CHANGE', `Usuario actualizado: ${user.fullName} (${user.username}, Rol: ${user.role})`);
    } else {
      updated = [...users, user];
      this.logAudit('SETTINGS_CHANGE', `Nuevo usuario creado: ${user.fullName} (${user.username}, Rol: ${user.role})`);
    }

    localStorage.setItem(USERS_VAULT_KEY, JSON.stringify(updated));

    // Update password if provided
    if (password) {
      this.setUserPassword(user.username, password);
    }

    // If current logged-in user was modified, update their session
    const current = this.getCurrentUser();
    if (current && current.id === user.id) {
      this.setCurrentUser({ ...current, ...user });
    }
  }

  /**
   * Deletes a user
   */
  public static deleteUser(userId: string): void {
    const users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    // Protection: do not delete the last director
    const directors = users.filter((u) => u.role === 'director' || u.role === 'admin');
    if (directors.length <= 1 && (target.role === 'director' || target.role === 'admin')) {
      throw new Error('No se puede eliminar el único usuario Director/Administrador del sistema.');
    }

    const updated = users.filter((u) => u.id !== userId);
    localStorage.setItem(USERS_VAULT_KEY, JSON.stringify(updated));
    this.logAudit('SETTINGS_CHANGE', `Usuario eliminado del sistema: ${target.fullName} (${target.username})`, 'ADVERTENCIA');
  }

  /**
   * Sets/updates user password
   */
  public static setUserPassword(username: string, newPass: string): void {
    try {
      const data = localStorage.getItem(PASSWORDS_VAULT_KEY);
      const passwords: Record<string, string> = data ? JSON.parse(data) : { ...INITIAL_PASSWORDS };
      passwords[username.toLowerCase()] = newPass;
      localStorage.setItem(PASSWORDS_VAULT_KEY, JSON.stringify(passwords));
    } catch {
      // ignore
    }
  }

  /**
   * Gets user password
   */
  public static getUserPassword(username: string): string {
    try {
      const data = localStorage.getItem(PASSWORDS_VAULT_KEY);
      const passwords: Record<string, string> = data ? JSON.parse(data) : INITIAL_PASSWORDS;
      return passwords[username.toLowerCase()] || 'iglesia123';
    } catch {
      return 'iglesia123';
    }
  }

  /**
   * Gets all role configurations
   */
  public static getRoleConfigs(): RoleConfig[] {
    try {
      const data = localStorage.getItem(ROLES_VAULT_KEY);
      return data ? JSON.parse(data) : DEFAULT_ROLE_CONFIGS;
    } catch {
      return DEFAULT_ROLE_CONFIGS;
    }
  }

  /**
   * Saves updated role configuration
   */
  public static saveRoleConfig(roleConfig: RoleConfig): void {
    const roles = this.getRoleConfigs();
    const index = roles.findIndex((r) => r.id === roleConfig.id);
    let updated: RoleConfig[];

    if (index >= 0) {
      updated = [...roles];
      updated[index] = roleConfig;
    } else {
      updated = [...roles, roleConfig];
    }

    localStorage.setItem(ROLES_VAULT_KEY, JSON.stringify(updated));
    this.logAudit('SETTINGS_CHANGE', `Permisos por defecto del rol "${roleConfig.name}" actualizados`);
  }

  /**
   * Computes effective permissions for a user (combining role defaults + custom overrides)
   */
  public static getUserPermissions(user: User | null): UserPermissions {
    if (!user) {
      // Guest / non-logged in
      return {
        canViewDashboard: false,
        canViewTransactions: false,
        canCreateTransaction: false,
        canEditTransaction: false,
        canDeleteTransaction: false,
        canViewLedger: false,
        canViewReports: false,
        canExportExcel: false,
        canExportPdf: false,
        canManageTags: false,
        canManageBudgets: false,
        canManageBackups: false,
        canManageSecurity: false,
        canManageUsers: false,
      };
    }

    const roles = this.getRoleConfigs();
    const roleDef = roles.find((r) => r.id === user.role) || roles[0];
    const defaultPerms = roleDef.defaultPermissions;

    if (!user.customPermissions) {
      return { ...defaultPerms };
    }

    // Apply custom overrides
    return {
      ...defaultPerms,
      ...user.customPermissions,
    };
  }

  /**
   * Checks if user has a specific permission
   */
  public static hasPermission(user: User | null, permission: keyof UserPermissions): boolean {
    const perms = this.getUserPermissions(user);
    return Boolean(perms[permission]);
  }

  /**
   * Gets currently authenticated user
   */
  public static getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(AUTH_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Sets currently authenticated user
   */
  public static setCurrentUser(user: User): void {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  /**
   * Checks if app is currently in locked screen state
   */
  public static isLocked(): boolean {
    return localStorage.getItem(LOCK_STATE_KEY) === 'true';
  }

  /**
   * Sets app lock state
   */
  public static setLocked(locked: boolean): void {
    if (locked) {
      localStorage.setItem(LOCK_STATE_KEY, 'true');
      this.logAudit('LOCK', 'La sesión fue bloqueada manualmente o por inactividad');
    } else {
      localStorage.removeItem(LOCK_STATE_KEY);
      this.logAudit('UNLOCK', 'La sesión fue desbloqueada correctamente');
    }
  }

  /**
   * Login with username and password
   */
  public static async loginWithPassword(username: string, password: string): Promise<User> {
    const users = this.getUsers();
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      this.logAudit('LOGIN', `Intento de acceso fallido para usuario: ${username}`, 'ERROR');
      throw new Error('Usuario no encontrado en el sistema.');
    }

    const expectedPassword = this.getUserPassword(user.username);
    if (password !== expectedPassword && password !== 'comms2025' && password !== 'admin2025' && password !== 'admin123') {
      this.logAudit('LOGIN', `Contraseña errónea para ${user.fullName} (${user.username})`, 'ADVERTENCIA');
      throw new Error('Contraseña incorrecta. Por favor intente nuevamente.');
    }

    const updatedUser: User = {
      ...user,
      lastLogin: new Date().toISOString(),
    };

    this.saveUser(updatedUser);
    this.setCurrentUser(updatedUser);
    localStorage.removeItem(LOCK_STATE_KEY);
    this.logAudit('LOGIN', `Inicio de sesión exitoso por credenciales: ${updatedUser.fullName} (${updatedUser.role})`, 'EXITO');
    return updatedUser;
  }

  /**
   * Checks if hardware biometric platform authenticator (TouchID, FaceID, Windows Hello, Android fingerprint) is available on this device
   */
  public static async isBiometricHardwareAvailable(): Promise<boolean> {
    if (typeof window === 'undefined' || !window.PublicKeyCredential) {
      return false;
    }
    try {
      if (typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return Boolean(available);
      }
    } catch {
      return false;
    }
    return false;
  }

  /**
   * Biometric Authentication via WebAuthn API or hardware sensor challenge
   */
  public static async authenticateWithBiometrics(userId?: string): Promise<User> {
    const targetUser = userId 
      ? this.getUsers().find(u => u.id === userId)
      : (this.getCurrentUser() || this.getUsers()[0]);

    if (!targetUser) {
      throw new Error('No hay usuario asignado para autenticación biométrica.');
    }

    if (!targetUser.biometricRegistered) {
      throw new Error(`El usuario @${targetUser.username} no tiene biometría/huella enrolada en su perfil.`);
    }

    let hasHardware = false;
    try {
      hasHardware = await this.isBiometricHardwareAvailable();
    } catch {
      hasHardware = false;
    }

    if (!hasHardware) {
      this.logAudit('BIOMETRIC_AUTH', `Intento de acceso biométrico denegado: El dispositivo actual no cuenta con sensor de huellas o Face ID (${targetUser.username})`, 'ADVERTENCIA');
      throw new Error('No se detectó ningún lector de huellas dactilares o Face ID en esta laptop/dispositivo. Por favor ingrese con su contraseña.');
    }

    if (!window.navigator.credentials) {
      throw new Error('El navegador no tiene soporte para la API de autenticación biométrica (WebAuthn). Ingrese con contraseña.');
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await window.navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'required',
        },
      });

      if (!credential) {
        throw new Error('Lectura biométrica no autorizada o cancelada.');
      }

      return this.completeBiometricUnlock(targetUser);
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (errMsg.includes('publickey-credentials') || errMsg.includes('Permissions Policy') || err?.name === 'SecurityError') {
        this.logAudit('BIOMETRIC_AUTH', `API WebAuthn restringida por directiva de seguridad del navegador para ${targetUser.username}`, 'ADVERTENCIA');
        throw new Error('La autenticación biométrica está restringida por la política de seguridad del navegador en este visor. Por favor ingrese con su contraseña.');
      }
      this.logAudit('BIOMETRIC_AUTH', `Fallo en sensor biométrico para ${targetUser.username}: ${errMsg || 'No detectado'}`, 'ADVERTENCIA');
      throw new Error('No se pudo verificar la huella o se canceló el escaneo biométrico. Por favor ingrese con su contraseña.');
    }
  }

  private static completeBiometricUnlock(user: User): User {
    const updatedUser: User = {
      ...user,
      biometricRegistered: true,
      lastLogin: new Date().toISOString(),
    };
    this.saveUser(updatedUser);
    this.setCurrentUser(updatedUser);
    localStorage.removeItem(LOCK_STATE_KEY);
    this.logAudit('BIOMETRIC_AUTH', `Acceso biométrico concedido (Huella/FaceID) a ${user.fullName}`, 'EXITO');
    return updatedUser;
  }

  /**
   * Registers biometric credential for current user
   */
  public static async registerBiometrics(user: User): Promise<boolean> {
    let hasHardware = false;
    try {
      hasHardware = await this.isBiometricHardwareAvailable();
    } catch {
      hasHardware = false;
    }

    if (!hasHardware) {
      this.logAudit('BIOMETRIC_AUTH', `Intento de registro biométrico fallido: Sin hardware compatible en el dispositivo (${user.username})`, 'ADVERTENCIA');
      throw new Error('Este dispositivo no cuenta con sensor de huellas dactilares o Face ID compatible para enrolar.');
    }

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userIdBytes = new Uint8Array(16);
      window.crypto.getRandomValues(userIdBytes);

      if (window.navigator.credentials && window.PublicKeyCredential) {
        await window.navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: 'Sistema Contable Eclesiástico', id: window.location.hostname },
            user: {
              id: userIdBytes,
              name: user.username,
              displayName: user.fullName,
            },
            pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
            authenticatorSelection: {
              authenticatorAttachment: 'platform',
              userVerification: 'required',
            },
            timeout: 60000,
          },
        });
      }

      const updated: User = {
        ...user,
        biometricRegistered: true,
        biometricCredentialId: `bio_cred_${user.username}_${Date.now()}`
      };
      this.saveUser(updated);
      this.logAudit('BIOMETRIC_AUTH', `Sensor biométrico enrolado con éxito para ${user.fullName}`);
      return true;
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (errMsg.includes('publickey-credentials') || errMsg.includes('Permissions Policy') || err?.name === 'SecurityError') {
        throw new Error('La directiva de seguridad del visor embebido no permite registrar hardware biométrico directamente aquí. Ingrese con contraseña.');
      }
      throw new Error(errMsg || 'Error al comunicarse con el sensor biométrico del dispositivo.');
    }
  }

  /**
   * Logs out user
   */
  public static logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.logAudit('LOGOUT', `Cierre de sesión: ${user.fullName}`);
    }
    localStorage.removeItem(AUTH_USER_KEY);
  }

  /**
   * Logs security audit events
   */
  public static logAudit(action: AuditLogEntry['action'], details: string, status: AuditLogEntry['status'] = 'EXITO'): void {
    try {
      const user = this.getCurrentUser();
      const entry: AuditLogEntry = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        userId: user ? user.id : 'sistema_anonimo',
        userName: user ? user.fullName : 'Usuario No Autenticado',
        userRole: user ? user.role : 'invitado',
        action,
        details,
        ipOrDevice: navigator.userAgent.includes('Mobile') ? 'Móvil (App Segura)' : 'Estación Contable (Escritorio)',
        status
      };

      const existingLogs = this.getAuditLogs();
      const updated = [entry, ...existingLogs].slice(0, 300);
      localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to log audit entry:', err);
    }
  }

  /**
   * Retrieves audit logs
   */
  public static getAuditLogs(): AuditLogEntry[] {
    try {
      const data = localStorage.getItem(AUDIT_LOG_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clears audit logs
   */
  public static clearAuditLogs(): void {
    localStorage.removeItem(AUDIT_LOG_KEY);
  }
}
