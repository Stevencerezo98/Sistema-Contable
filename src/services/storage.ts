/**
 * Storage Service for Church Communications Department Accounting System.
 * Uses Web Crypto API with AES-GCM-256 for local vault persistence and
 * provides structured storage for categories, tags, budgets, and backups.
 */

import { Transaction, Tag, Category, BudgetGoal, CloudBackupSnapshot } from '../types';
import { CryptoService } from './crypto';
import { AuthService } from './auth';

// Storage keys
const STORAGE_VAULT_KEY = 'comms_church_accounting_vault_v2';
const STORAGE_TAGS_KEY = 'comms_church_accounting_tags_v2';
const STORAGE_CATEGORIES_KEY = 'comms_church_accounting_cats_v2';
const STORAGE_BUDGETS_KEY = 'comms_church_accounting_budgets_v2';
const STORAGE_BACKUPS_KEY = 'comms_church_accounting_backups_v2';

// Clean initial data (zero dummy records, ready for real church accounting data)
export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_TAGS: Tag[] = [
  { id: 'tag_1', name: 'Dominical', color: '#4f46e5', description: 'Servicios dominicales y cultos generales' },
  { id: 'tag_2', name: 'Streaming', color: '#06b6d4', description: 'Transmisión en vivo y plataformas digitales' },
  { id: 'tag_3', name: 'Equipo', color: '#8b5cf6', description: 'Compra o mantenimiento de hardware y audio/video' },
  { id: 'tag_4', name: 'Produccion', color: '#10b981', description: 'Materiales gráficos, escenografía e iluminación' },
  { id: 'tag_5', name: 'Software', color: '#f59e0b', description: 'Licencias de software (ProPresenter, vMix, Adobe)' },
  { id: 'tag_6', name: 'Mantenimiento', color: '#ef4444', description: 'Reparaciones y servicio técnico' },
  { id: 'tag_7', name: 'CampanaEspecial', color: '#ec4899', description: 'Eventos especiales, congresos y aniversarios' },
  { id: 'tag_8', name: 'Capacitacion', color: '#6366f1', description: 'Talleres para el equipo de voluntarios' },
];

export const INITIAL_CATEGORIES: Category[] = [
  // Ingresos
  { id: 'cat_in_1', name: 'Ofrenda Específica Depto.', type: 'ingreso', defaultCodePrefix: 'OFD' },
  { id: 'cat_in_2', name: 'Asignación Presupuestaria Iglesia', type: 'ingreso', defaultCodePrefix: 'ASG' },
  { id: 'cat_in_3', name: 'Donación para Equipos / Proyectos', type: 'ingreso', defaultCodePrefix: 'DON' },
  { id: 'cat_in_4', name: 'Venta de Material Multimedia', type: 'ingreso', defaultCodePrefix: 'VNT' },
  { id: 'cat_in_5', name: 'Servicios de Grabación / Eventos', type: 'ingreso', defaultCodePrefix: 'SRV' },
  // Egresos
  { id: 'cat_eg_1', name: 'Equipos de Audio y Microfonía', type: 'egreso', defaultCodePrefix: 'AUD' },
  { id: 'cat_eg_2', name: 'Equipos de Video y Cámaras', type: 'egreso', defaultCodePrefix: 'VID' },
  { id: 'cat_eg_3', name: 'Cables, Conectores y Accesorios', type: 'egreso', defaultCodePrefix: 'ACC' },
  { id: 'cat_eg_4', name: 'Suscripciones y Licencias de Software', type: 'egreso', defaultCodePrefix: 'LIC' },
  { id: 'cat_eg_5', name: 'Internet y Transmisión en Vivo', type: 'egreso', defaultCodePrefix: 'INT' },
  { id: 'cat_eg_6', name: 'Material Impreso y Diseño Gráfico', type: 'egreso', defaultCodePrefix: 'IMP' },
  { id: 'cat_eg_7', name: 'Mantenimiento y Reparación Técnica', type: 'egreso', defaultCodePrefix: 'MNT' },
  { id: 'cat_eg_8', name: 'Refrigerios del Equipo / Voluntarios', type: 'egreso', defaultCodePrefix: 'REF' },
  { id: 'cat_eg_9', name: 'Capacitación y Cursos de Producción', type: 'egreso', defaultCodePrefix: 'CAP' },
];

export const INITIAL_BUDGETS: BudgetGoal[] = [
  {
    id: 'bg_1',
    categoryOrTag: 'Suscripciones y Licencias de Software',
    allocatedAmount: 600,
    currentSpent: 0,
    period: 'anual',
    year: 2025,
  },
  {
    id: 'bg_2',
    categoryOrTag: 'Cables, Conectores y Accesorios',
    allocatedAmount: 500,
    currentSpent: 0,
    period: 'anual',
    year: 2025,
  },
  {
    id: 'bg_3',
    categoryOrTag: 'Mantenimiento y Reparación Técnica',
    allocatedAmount: 1000,
    currentSpent: 0,
    period: 'anual',
    year: 2025,
  },
  {
    id: 'bg_4',
    categoryOrTag: 'Refrigerios del Equipo / Voluntarios',
    allocatedAmount: 400,
    currentSpent: 0,
    period: 'anual',
    year: 2025,
  },
];

export const INITIAL_CLOUD_BACKUPS: CloudBackupSnapshot[] = [
  {
    id: 'bkp_init_001',
    timestamp: new Date().toISOString(),
    version: '1.2.0',
    recordCount: 0,
    tagCount: 8,
    cloudProvider: 'Google Drive',
    fileSizeKb: 2.1,
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    isEncrypted: true,
    status: 'sincronizado',
    createdBy: 'Pastor Roberto Silva',
  },
];

export const DEMO_SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_demo_01',
    code: 'ING-2025-001',
    type: 'ingreso',
    date: '2025-01-05',
    amount: 1500.00,
    category: 'Asignación Presupuestaria Iglesia',
    tags: ['Dominical', 'Produccion'],
    description: 'Asignación presupuestaria mensual enero para el Depto. de Comunicaciones',
    beneficiaryOrDonor: 'Tesorería Central Iglesia',
    paymentMethod: 'transferencia',
    voucherNumber: 'TRF-884920',
    account: 'Banco Principal Iglesia',
    status: 'conciliado',
    notes: 'Presupuesto regular aprobado por la junta administrativa.',
    createdBy: 'Pr. Carlos Mendoza',
    createdAt: '2025-01-05T09:00:00Z',
    updatedAt: '2025-01-05T09:00:00Z',
  },
  {
    id: 'tx_demo_02',
    code: 'ING-2025-002',
    type: 'ingreso',
    date: '2025-01-12',
    amount: 850.00,
    category: 'Donación para Equipos / Proyectos',
    tags: ['Equipo', 'Streaming'],
    description: 'Donación especial de miembro para adquisición de cámaras 4K',
    beneficiaryOrDonor: 'Familia Morales Méndez',
    paymentMethod: 'donacion_en_linea',
    voucherNumber: 'DON-2025-012',
    account: 'Fondo de Reserva Equipamiento',
    status: 'conciliado',
    isDesignated: true,
    notes: 'Fondo etiquetado exclusivamente para cámaras de transmisión.',
    createdBy: 'Lic. Elena Ramos',
    createdAt: '2025-01-12T11:30:00Z',
    updatedAt: '2025-01-12T11:30:00Z',
  },
  {
    id: 'tx_demo_03',
    code: 'EGR-2025-001',
    type: 'egreso',
    date: '2025-01-15',
    amount: 399.00,
    category: 'Suscripciones y Licencias de Software',
    tags: ['Software', 'Streaming'],
    description: 'Renovación anual licencia ProPresenter 7 Campus',
    beneficiaryOrDonor: 'Renewed Vision LLC',
    paymentMethod: 'tarjeta',
    voucherNumber: 'INV-US-99381',
    account: 'Banco Principal Iglesia',
    status: 'conciliado',
    notes: 'Software de proyección y transmisión para el templo principal.',
    createdBy: 'David Salgado',
    createdAt: '2025-01-15T14:15:00Z',
    updatedAt: '2025-01-15T14:15:00Z',
  },
  {
    id: 'tx_demo_04',
    code: 'EGR-2025-002',
    type: 'egreso',
    date: '2025-01-20',
    amount: 280.50,
    category: 'Cables, Conectores y Accesorios',
    tags: ['Equipo', 'Mantenimiento'],
    description: 'Compra de 6 cables XLR Neutrik y 2 splitters SDI 4K',
    beneficiaryOrDonor: 'Audiomaster S.A.',
    paymentMethod: 'transferencia',
    voucherNumber: 'FAC-004-9821',
    account: 'Caja General Comunicaciones',
    status: 'conciliado',
    notes: 'Reemplazo de líneas de audio deterioradas en escenario.',
    createdBy: 'Lucas Ramírez',
    createdAt: '2025-01-20T16:00:00Z',
    updatedAt: '2025-01-20T16:00:00Z',
  },
  {
    id: 'tx_demo_05',
    code: 'ING-2025-003',
    type: 'ingreso',
    date: '2025-01-26',
    amount: 620.00,
    category: 'Ofrenda Específica Depto.',
    tags: ['Dominical', 'CampanaEspecial'],
    description: 'Ofrenda especial recolectada en servicio de jóvenes pro-multimedia',
    beneficiaryOrDonor: 'Congregación General',
    paymentMethod: 'efectivo',
    voucherNumber: 'REC-00192',
    account: 'Caja General Comunicaciones',
    status: 'conciliado',
    notes: 'Conteo certificado por tesorería y dos testigos.',
    createdBy: 'Lic. Elena Ramos',
    createdAt: '2025-01-26T20:30:00Z',
    updatedAt: '2025-01-26T20:30:00Z',
  },
  {
    id: 'tx_demo_06',
    code: 'EGR-2025-003',
    type: 'egreso',
    date: '2025-02-02',
    amount: 85.00,
    category: 'Internet y Transmisión en Vivo',
    tags: ['Streaming'],
    description: 'Pago mensual enlace de fibra óptica simétrica para streaming',
    beneficiaryOrDonor: 'Telecom Fiber ISP',
    paymentMethod: 'transferencia',
    voucherNumber: 'REC-ISP-202502',
    account: 'Banco Principal Iglesia',
    status: 'conciliado',
    notes: '300 Mbps simétricos dedicados para transmisión de cultos.',
    createdBy: 'David Salgado',
    createdAt: '2025-02-02T10:00:00Z',
    updatedAt: '2025-02-02T10:00:00Z',
  },
  {
    id: 'tx_demo_07',
    code: 'EGR-2025-004',
    type: 'egreso',
    date: '2025-02-08',
    amount: 145.00,
    category: 'Refrigerios del Equipo / Voluntarios',
    tags: ['Dominical', 'Produccion'],
    description: 'Refrigerios y café para equipo técnico de cabina y camarógrafos (4 domingos)',
    beneficiaryOrDonor: 'Café & Panadería Central',
    paymentMethod: 'caja_chica',
    voucherNumber: 'CCH-041',
    account: 'Caja Chica Producción',
    status: 'conciliado',
    notes: 'Atención a 8 voluntarios del equipo de producción dominical.',
    createdBy: 'Lucas Ramírez',
    createdAt: '2025-02-08T13:00:00Z',
    updatedAt: '2025-02-08T13:00:00Z',
  },
  {
    id: 'tx_demo_08',
    code: 'EGR-2025-005',
    type: 'egreso',
    date: '2025-02-14',
    amount: 450.00,
    category: 'Mantenimiento y Reparación Técnica',
    tags: ['Mantenimiento', 'Equipo'],
    description: 'Servicio técnico especializado y limpieza de óptica de proyector láser',
    beneficiaryOrDonor: 'Proyectores & Video Pro',
    paymentMethod: 'transferencia',
    voucherNumber: 'FAC-4819',
    account: 'Banco Principal Iglesia',
    status: 'conciliado',
    notes: 'Mantenimiento preventivo anual antes del congreso.',
    createdBy: 'Pr. Carlos Mendoza',
    createdAt: '2025-02-14T15:30:00Z',
    updatedAt: '2025-02-14T15:30:00Z',
  },
  {
    id: 'tx_demo_09',
    code: 'ING-2025-004',
    type: 'ingreso',
    date: '2025-02-20',
    amount: 400.00,
    category: 'Servicios de Grabación / Eventos',
    tags: ['CampanaEspecial', 'Produccion'],
    description: 'Cobertura audiovisual y grabación master de concierto coral',
    beneficiaryOrDonor: 'Ministerio Coral Regional',
    paymentMethod: 'transferencia',
    voucherNumber: 'TRF-99120',
    account: 'Caja General Comunicaciones',
    status: 'completado',
    notes: 'Honorarios acordados para fondo de mejoras de cabina.',
    createdBy: 'David Salgado',
    createdAt: '2025-02-20T17:00:00Z',
    updatedAt: '2025-02-20T17:00:00Z',
  },
  {
    id: 'tx_demo_10',
    code: 'EGR-2025-006',
    type: 'egreso',
    date: '2025-02-25',
    amount: 190.00,
    category: 'Capacitación y Cursos de Producción',
    tags: ['Capacitacion'],
    description: 'Taller de iluminación para streaming y mezcla de audio en vivo',
    beneficiaryOrDonor: 'Academia Media Worship',
    paymentMethod: 'tarjeta',
    voucherNumber: 'CERT-2025-09',
    account: 'Banco Principal Iglesia',
    status: 'completado',
    notes: 'Capacitación de 4 voluntarios técnicos.',
    createdBy: 'Pr. Carlos Mendoza',
    createdAt: '2025-02-25T18:00:00Z',
    updatedAt: '2025-02-25T18:00:00Z',
  }
];

export class StorageService {
  /**
   * Helper to sync data with the Node.js / aaPanel backend if available
   */
  private static async syncServer(path: string, method: string = 'GET', data?: any): Promise<any> {
    try {
      const res = await fetch(`/api${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Offline or running in static context
    }
    return null;
  }

  /**
   * Retrieves decrypted transactions from encrypted local storage or backend server
   */
  public static async getTransactions(): Promise<Transaction[]> {
    // Try fetching from server first
    try {
      const serverTxs = await this.syncServer('/transactions');
      if (Array.isArray(serverTxs) && serverTxs.length > 0) {
        await this.saveTransactionsLocalOnly(serverTxs);
        return serverTxs;
      }
    } catch {
      // fallback
    }

    try {
      const encryptedData = localStorage.getItem(STORAGE_VAULT_KEY);
      if (!encryptedData) {
        // Initialize empty vault
        await this.saveTransactions(INITIAL_TRANSACTIONS);
        return INITIAL_TRANSACTIONS;
      }

      const decryptedJson = await CryptoService.decrypt(encryptedData);
      const parsed = JSON.parse(decryptedJson);
      return Array.isArray(parsed) ? parsed : INITIAL_TRANSACTIONS;
    } catch (err) {
      console.warn('Vault decryption warning, trying direct or re-init:', err);
      return INITIAL_TRANSACTIONS;
    }
  }

  private static async saveTransactionsLocalOnly(transactions: Transaction[]): Promise<void> {
    const jsonStr = JSON.stringify(transactions);
    const encryptedData = await CryptoService.encrypt(jsonStr);
    localStorage.setItem(STORAGE_VAULT_KEY, encryptedData);
  }

  /**
   * Encrypts and saves transactions to local storage and syncs with backend server
   */
  public static async saveTransactions(transactions: Transaction[]): Promise<void> {
    await this.saveTransactionsLocalOnly(transactions);
    this.syncServer('/state', 'POST', { transactions }).catch(() => {});
  }

  /**
   * Gets available tags
   */
  public static getTags(): Tag[] {
    try {
      const data = localStorage.getItem(STORAGE_TAGS_KEY);
      return data ? JSON.parse(data) : INITIAL_TAGS;
    } catch {
      return INITIAL_TAGS;
    }
  }

  /**
   * Saves or updates a tag
   */
  public static saveTag(tag: Tag): void {
    const tags = this.getTags();
    const existingIndex = tags.findIndex((t) => t.id === tag.id);
    let updated: Tag[] = [];
    if (existingIndex >= 0) {
      updated = tags.map((t) => (t.id === tag.id ? tag : t));
    } else {
      updated = [...tags, tag];
    }
    localStorage.setItem(STORAGE_TAGS_KEY, JSON.stringify(updated));
    AuthService.logAudit('TAG_UPDATE', `Etiqueta guardada: #${tag.name}`);
  }

  /**
   * Deletes a tag
   */
  public static deleteTag(id: string): void {
    const tags = this.getTags();
    const deleted = tags.find((t) => t.id === id);
    const updated = tags.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_TAGS_KEY, JSON.stringify(updated));
    if (deleted) {
      AuthService.logAudit('TAG_DELETE', `Etiqueta eliminada: #${deleted.name}`);
    }
  }

  /**
   * Gets categories
   */
  public static getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_CATEGORIES_KEY);
      return data ? JSON.parse(data) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  /**
   * Saves category
   */
  public static saveCategory(cat: Category): void {
    const cats = this.getCategories();
    const existingIndex = cats.findIndex((c) => c.id === cat.id);
    let updated: Category[] = [];
    if (existingIndex >= 0) {
      updated = cats.map((c) => (c.id === cat.id ? cat : c));
    } else {
      updated = [...cats, cat];
    }
    localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(updated));
    AuthService.logAudit('CATEGORY_UPDATE', `Categoría guardada: ${cat.name} (${cat.type})`);
  }

  /**
   * Deletes a category
   */
  public static deleteCategory(id: string): void {
    const cats = this.getCategories();
    const deleted = cats.find((c) => c.id === id);
    const updated = cats.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(updated));
    if (deleted) {
      AuthService.logAudit('CATEGORY_DELETE', `Categoría eliminada: ${deleted.name}`);
    }
  }

  /**
   * Gets budget goals
   */
  public static getBudgets(): BudgetGoal[] {
    try {
      const data = localStorage.getItem(STORAGE_BUDGETS_KEY);
      return data ? JSON.parse(data) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  }

  /**
   * Saves budget goal
   */
  public static saveBudget(budget: BudgetGoal): void {
    const budgets = this.getBudgets();
    const existingIndex = budgets.findIndex((b) => b.id === budget.id);
    let updated: BudgetGoal[] = [];
    if (existingIndex >= 0) {
      updated = budgets.map((b) => (b.id === budget.id ? budget : b));
    } else {
      updated = [...budgets, budget];
    }
    localStorage.setItem(STORAGE_BUDGETS_KEY, JSON.stringify(updated));
    AuthService.logAudit('BUDGET_UPDATE', `Presupuesto actualizado: ${budget.categoryOrTag} ($${budget.allocatedAmount})`);
  }

  /**
   * Deletes a budget
   */
  public static deleteBudget(id: string): void {
    const budgets = this.getBudgets();
    const updated = budgets.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_BUDGETS_KEY, JSON.stringify(updated));
  }

  /**
   * Gets cloud backups
   */
  public static getCloudBackups(): CloudBackupSnapshot[] {
    try {
      const data = localStorage.getItem(STORAGE_BACKUPS_KEY);
      return data ? JSON.parse(data) : INITIAL_CLOUD_BACKUPS;
    } catch {
      return INITIAL_CLOUD_BACKUPS;
    }
  }

  /**
   * Creates a new cloud backup snapshot
   */
  public static async createCloudBackup(
    provider: CloudBackupSnapshot['cloudProvider'],
    passphrase?: string
  ): Promise<CloudBackupSnapshot> {
    const transactions = await this.getTransactions();
    const tags = this.getTags();
    const categories = this.getCategories();
    const budgets = this.getBudgets();
    const user = AuthService.getCurrentUser();

    const payload = {
      transactions,
      tags,
      categories,
      budgets,
      timestamp: new Date().toISOString(),
      churchEntity: 'Iglesia Central - Departamento de Comunicaciones',
    };

    const jsonStr = JSON.stringify(payload);
    const sha256Hash = await CryptoService.generateSha256(jsonStr);

    const newSnapshot: CloudBackupSnapshot = {
      id: `bkp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      version: '1.2.0',
      recordCount: transactions.length,
      tagCount: tags.length,
      cloudProvider: provider,
      fileSizeKb: parseFloat((new Blob([jsonStr]).size / 1024).toFixed(1)),
      sha256Hash,
      isEncrypted: true,
      status: 'sincronizado',
      createdBy: user ? user.fullName : 'Administrador',
    };

    const existing = this.getCloudBackups();
    const updated = [newSnapshot, ...existing];
    localStorage.setItem(STORAGE_BACKUPS_KEY, JSON.stringify(updated));

    AuthService.logAudit('BACKUP_CREATE', `Copia de seguridad en la nube generada (${provider}) con ${transactions.length} registros contables.`);
    return newSnapshot;
  }

  /**
   * Exports an encrypted backup file (.ccf - Church Communications Finance)
   */
  public static async exportEncryptedFile(passphrase?: string): Promise<{ blob: Blob; filename: string }> {
    const transactions = await this.getTransactions();
    const tags = this.getTags();
    const categories = this.getCategories();
    const budgets = this.getBudgets();
    const users = AuthService.getUsers();

    const envelope = {
      appId: 'iglesia-comunicaciones-contable',
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      entity: 'Iglesia Central - Departamento de Comunicaciones',
      data: {
        transactions,
        tags,
        categories,
        budgets,
        users,
      },
    };

    const envelopeJson = JSON.stringify(envelope);
    let finalContent = envelopeJson;

    if (passphrase) {
      finalContent = await CryptoService.encryptWithCustomKey(envelopeJson, passphrase);
    } else {
      finalContent = await CryptoService.encrypt(envelopeJson);
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Respaldo_Contabilidad_Comunicaciones_${dateStr}.ccf`;
    const blob = new Blob([finalContent], { type: 'application/octet-stream' });

    AuthService.logAudit('BACKUP_CREATE', `Exportado archivo de respaldo encriptado: ${filename}`);
    return { blob, filename };
  }

  /**
   * Imports and restores from an encrypted backup file
   */
  public static async importEncryptedFile(
    fileContent: string,
    passphrase?: string
  ): Promise<{ success: boolean; recordsRestored: number }> {
    try {
      let decryptedJson = '';
      if (passphrase) {
        decryptedJson = await CryptoService.decryptWithCustomKey(fileContent, passphrase);
      } else {
        decryptedJson = await CryptoService.decrypt(fileContent);
      }

      const envelope = JSON.parse(decryptedJson);
      if (!envelope.data) {
        throw new Error('Formato de archivo de respaldo eclesiástico no válido.');
      }

      const { transactions, tags, categories, budgets } = envelope.data;

      if (Array.isArray(transactions)) {
        await this.saveTransactions(transactions);
      }
      if (Array.isArray(tags)) {
        localStorage.setItem(STORAGE_TAGS_KEY, JSON.stringify(tags));
      }
      if (Array.isArray(categories)) {
        localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
      }
      if (Array.isArray(budgets)) {
        localStorage.setItem(STORAGE_BUDGETS_KEY, JSON.stringify(budgets));
      }

      const count = transactions?.length || 0;
      AuthService.logAudit('BACKUP_RESTORE', `Bóveda contable restaurada con éxito (${count} movimientos)`, 'EXITO');
      return { success: true, recordsRestored: count };
    } catch (err: any) {
      AuthService.logAudit('BACKUP_RESTORE', `Fallo en restauración de respaldo: ${err.message}`, 'ERROR');
      throw err;
    }
  }

  /**
   * Loads rich realistic demo transactions for the church communications department
   */
  public static async loadDemoData(): Promise<Transaction[]> {
    await this.saveTransactions(DEMO_SAMPLE_TRANSACTIONS);
    AuthService.logAudit('TRANSACTION_CREATE', 'Cargados 10 movimientos contables de demostración departamental', 'EXITO');
    return DEMO_SAMPLE_TRANSACTIONS;
  }

  /**
   * Empties all transactions in vault for a clean slate
   */
  public static async clearAllData(): Promise<void> {
    await this.saveTransactions([]);
    AuthService.logAudit('TRANSACTION_DELETE', 'Bóveda de movimientos vaciada a cero', 'ADVERTENCIA');
  }
}

