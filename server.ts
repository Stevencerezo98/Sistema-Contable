import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data directory exists for persistent aaPanel storage
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Schema
interface DatabaseSchema {
  transactions: any[];
  categories: any[];
  tags: any[];
  budgets: any[];
  users: any[];
  passwords: Record<string, string>;
  roleConfigs: any[];
  auditLogs: any[];
  backups: any[];
  settings: Record<string, any>;
  updatedAt: string;
}

const DEFAULT_CATEGORIES = [
  { id: 'cat_1', name: 'Ofrendas Especiales Audiovisual', type: 'ingreso', defaultCodePrefix: 'OFR' },
  { id: 'cat_2', name: 'Presupuesto Departamental Asignado', type: 'ingreso', defaultCodePrefix: 'ASG' },
  { id: 'cat_3', name: 'Donaciones de Equipos y Fondos', type: 'ingreso', defaultCodePrefix: 'DON' },
  { id: 'cat_4', name: 'Eventos y Transmisiones Especiales', type: 'ingreso', defaultCodePrefix: 'EVT' },
  { id: 'cat_5', name: 'Equipos de Transmisión y Streaming', type: 'egreso', defaultCodePrefix: 'STR' },
  { id: 'cat_6', name: 'Audio y Microfonía Profesional', type: 'egreso', defaultCodePrefix: 'AUD' },
  { id: 'cat_7', name: 'Cámaras, Ópticas y Video', type: 'egreso', defaultCodePrefix: 'VID' },
  { id: 'cat_8', name: 'Software y Licencias (vMix, Adobe)', type: 'egreso', defaultCodePrefix: 'LIC' },
  { id: 'cat_9', name: 'Mantenimiento y Cableado', type: 'egreso', defaultCodePrefix: 'MNT' },
  { id: 'cat_10', name: 'Servicios de Internet y Servidores', type: 'egreso', defaultCodePrefix: 'NET' },
  { id: 'cat_11', name: 'Materiales Gráficos y Escenografía', type: 'egreso', defaultCodePrefix: 'ESC' },
];

const DEFAULT_TAGS = [
  { id: 'tag_1', name: 'CultosDominicales', color: '#3b82f6', description: 'Transmisión dominical regular', budgetCap: 1200 },
  { id: 'tag_2', name: 'CampamentosYConferencias', color: '#8b5cf6', description: 'Cobertura de eventos masivos', budgetCap: 2500 },
  { id: 'tag_3', name: 'RedesSociales', color: '#10b981', description: 'Contenido y campañas digitales', budgetCap: 600 },
  { id: 'tag_4', name: 'RenovacionEquipos2025', color: '#f59e0b', description: 'Adquisición de hardware nuevo', budgetCap: 4000 },
  { id: 'tag_5', name: 'MusicaYAlabanza', color: '#ec4899', description: 'Grabaciones y microfonía musical', budgetCap: 1500 },
];

const DEFAULT_USERS = [
  {
    id: 'user_director_01',
    username: 'director',
    fullName: 'Pr. Carlos Mendoza',
    role: 'director',
    active: true,
    email: 'direccion@ecclesia.org',
    biometricRegistered: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_tesorero_01',
    username: 'tesorero',
    fullName: 'Lic. Ana Rodríguez',
    role: 'tesorero',
    active: true,
    email: 'finanzas@ecclesia.org',
    biometricRegistered: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_contador_01',
    username: 'contador',
    fullName: 'C.P. David Silva',
    role: 'contador',
    active: true,
    email: 'contabilidad@ecclesia.org',
    biometricRegistered: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_auditor_01',
    username: 'auditor',
    fullName: 'Mtra. Elena Gómez',
    role: 'auditor',
    active: true,
    email: 'auditoria@ecclesia.org',
    biometricRegistered: false,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_PASSWORDS: Record<string, string> = {
  director: 'comms2025',
  tesorero: 'comms2025',
  contador: 'comms2025',
  auditor: 'comms2025',
  admin: 'admin2025',
};

function readDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading DB file, using default structure:', err);
  }

  const initialDb: DatabaseSchema = {
    transactions: [],
    categories: DEFAULT_CATEGORIES,
    tags: DEFAULT_TAGS,
    budgets: [],
    users: DEFAULT_USERS,
    passwords: DEFAULT_PASSWORDS,
    roleConfigs: [],
    auditLogs: [
      {
        id: `audit_init_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'sistema',
        userName: 'Sistema Servidor Node.js',
        userRole: 'director',
        action: 'SISTEMA_INICIALIZADO',
        details: 'Base de datos persistente inicializada con éxito.',
        ipOrDevice: 'Servidor Local Node.js / aaPanel',
        status: 'EXITO',
      },
    ],
    backups: [],
    settings: {
      currency: 'USD',
      orgName: 'Departamento de Comunicaciones - Iglesia Central',
    },
    updatedAt: new Date().toISOString(),
  };

  writeDb(initialDb);
  return initialDb;
}

function writeDb(data: DatabaseSchema): void {
  try {
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to DB file:', err);
  }
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    serverTime: new Date().toISOString(),
    dbPath: DB_FILE,
    persistent: true,
  });
});

// Full state sync (Get all collections)
app.get('/api/state', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    data: db,
  });
});

// Full state sync (Push all collections)
app.post('/api/state', (req, res) => {
  try {
    const current = readDb();
    const payload = req.body;

    const merged: DatabaseSchema = {
      ...current,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    writeDb(merged);
    res.json({ success: true, message: 'Estado sincronizado con éxito en el servidor.', updatedAt: merged.updatedAt });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Transactions CRUD
app.get('/api/transactions', (req, res) => {
  const db = readDb();
  res.json(db.transactions || []);
});

app.post('/api/transactions', (req, res) => {
  try {
    const db = readDb();
    const newTx = req.body;
    if (!newTx.id) {
      newTx.id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    }

    const existingIdx = db.transactions.findIndex((t) => t.id === newTx.id);
    if (existingIdx >= 0) {
      db.transactions[existingIdx] = newTx;
    } else {
      db.transactions = [newTx, ...db.transactions];
    }

    writeDb(db);
    res.json({ success: true, data: newTx });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/transactions/:id', (req, res) => {
  try {
    const db = readDb();
    const id = req.params.id;
    db.transactions = (db.transactions || []).filter((t) => t.id !== id);
    writeDb(db);
    res.json({ success: true, message: 'Registro eliminado del servidor.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Categories CRUD
app.get('/api/categories', (req, res) => {
  const db = readDb();
  res.json(db.categories || DEFAULT_CATEGORIES);
});

app.post('/api/categories', (req, res) => {
  try {
    const db = readDb();
    const cat = req.body;
    if (!cat.id) cat.id = `cat_${Date.now()}`;
    const idx = (db.categories || []).findIndex((c) => c.id === cat.id);
    if (idx >= 0) {
      db.categories[idx] = cat;
    } else {
      db.categories.push(cat);
    }
    writeDb(db);
    res.json({ success: true, data: cat });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/categories/:id', (req, res) => {
  try {
    const db = readDb();
    const id = req.params.id;
    db.categories = (db.categories || []).filter((c) => c.id !== id);
    writeDb(db);
    res.json({ success: true, message: 'Categoría eliminada del servidor.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Tags CRUD
app.get('/api/tags', (req, res) => {
  const db = readDb();
  res.json(db.tags || DEFAULT_TAGS);
});

app.post('/api/tags', (req, res) => {
  try {
    const db = readDb();
    const tag = req.body;
    if (!tag.id) tag.id = `tag_${Date.now()}`;
    const idx = (db.tags || []).findIndex((t) => t.id === tag.id);
    if (idx >= 0) {
      db.tags[idx] = tag;
    } else {
      db.tags.push(tag);
    }
    writeDb(db);
    res.json({ success: true, data: tag });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/tags/:id', (req, res) => {
  try {
    const db = readDb();
    const id = req.params.id;
    db.tags = (db.tags || []).filter((t) => t.id !== id);
    writeDb(db);
    res.json({ success: true, message: 'Etiqueta eliminada del servidor.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Users & Auth
app.get('/api/users', (req, res) => {
  const db = readDb();
  res.json(db.users || DEFAULT_USERS);
});

app.post('/api/users', (req, res) => {
  try {
    const db = readDb();
    const user = req.body;
    if (!user.id) user.id = `user_${Date.now()}`;
    const idx = (db.users || []).findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      db.users[idx] = user;
    } else {
      db.users.push(user);
    }
    writeDb(db);
    res.json({ success: true, data: user });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    const db = readDb();
    const id = req.params.id;
    db.users = (db.users || []).filter((u) => u.id !== id);
    writeDb(db);
    res.json({ success: true, message: 'Usuario eliminado del servidor.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Biometrics Registration challenge (WebAuthn helper)
app.post('/api/auth/biometrics/challenge', (req, res) => {
  const challenge = Buffer.from(Math.random().toString(36).substring(2) + Date.now().toString()).toString('base64');
  res.json({
    success: true,
    challenge,
    rp: {
      name: 'Sistema Contable - Departamento de Comunicaciones',
      id: req.hostname,
    },
  });
});

// Audit logs
app.get('/api/audit-logs', (req, res) => {
  const db = readDb();
  res.json(db.auditLogs || []);
});

app.post('/api/audit-logs', (req, res) => {
  try {
    const db = readDb();
    const log = req.body;
    if (!log.id) log.id = `audit_${Date.now()}`;
    db.auditLogs = [log, ...(db.auditLogs || [])].slice(0, 500);
    writeDb(db);
    res.json({ success: true, data: log });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/audit-logs', (req, res) => {
  try {
    const db = readDb();
    db.auditLogs = [];
    writeDb(db);
    res.json({ success: true, message: 'Registros de auditoría vaciados.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// VITE OR STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 Servidor Sistema Contable Node.js activo en puerto: ${PORT}`);
    console.log(`📁 Base de Datos Persistente: ${DB_FILE}`);
    console.log(`🌐 Acceso local: http://localhost:${PORT}`);
    console.log(`⚡ Listo para aaPanel / PM2 / Nginx Reverse Proxy`);
    console.log(`====================================================`);
  });
}

startServer();
