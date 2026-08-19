# 🚀 Guía de Despliegue en Servidor aaPanel (Node.js + Nginx)

Este proyecto está optimizado y preparado para desplegarse como una aplicación **Full-Stack (Node.js Express + React Vite)** en cualquier servidor VPS con el panel de control **aaPanel**.

---

## 🛠️ 1. Requisitos Previos en aaPanel

1. En el panel de **aaPanel**, ve a la sección **App Store**.
2. Busca e instala:
   - **Node.js Version Manager** (Instala Node.js v18, v20 o v22 LTS).
   - **Nginx** (servidor web y reverse proxy).
   - **PM2 Manager** (para mantener la aplicación activa 24/7).

---

## 📦 2. Subir el Código al Servidor

Puedes subir los archivos mediante Git o archivo ZIP a la ruta de tu sitio web (por ejemplo `/www/wwwroot/sistema-contable`):

```bash
cd /www/wwwroot
git clone https://github.com/Stevencerezo98/Sistema-Contable.git sistema-contable
cd sistema-contable
```

---

## ⚡ 3. Instalar Dependencias y Compilar

Dentro de la carpeta del proyecto en la terminal del servidor:

```bash
# 1. Instalar paquetes de npm
npm install

# 2. Compilar la aplicación para producción (Frontend Vite + Backend Express)
npm run build
```

Esto generará la carpeta `dist/` con:
- El frontend React optimizado y minimizado.
- El servidor backend empaquetado en `dist/server.cjs`.

---

## 🌐 4. Crear el Proyecto Node.js en aaPanel

1. En **aaPanel**, ve a **Website** > pestaña **Node project**.
2. Haz clic en **Add Node Project**:
   - **Project Name**: `sistema-contable`
   - **Path**: `/www/wwwroot/sistema-contable`
   - **Run Opt**: `npm run start` o script `dist/server.cjs`
   - **Node Version**: Selecciona Node 18, 20 o 22 LTS
   - **Port**: `3000` (o el puerto de tu preferencia)
   - **Run User**: `www` o `root`
3. Haz clic en **Submit**.

---

## 🔒 5. Configurar Dominio y Certificado SSL (Esencial para Biometría)

> ⚠️ **Importante**: La autenticación biométrica (Touch ID, Face ID, Windows Hello, WebAuthn) requiere **HTTPS obligatorio** por directiva de seguridad del navegador.

1. En la lista de proyectos Node en aaPanel, haz clic en **Mapping** / **Config** para vincular tu dominio (ej: `contabilidad.tudominio.com`).
2. Ve a la pestaña **SSL** del sitio en aaPanel.
3. Activa **Let's Encrypt** con 1 solo clic y activa la opción **Force HTTPS**.

---

## 💾 6. Base de Datos y Persistencia

- La base de datos persistente se almacena automáticamente en el archivo:
  `/www/wwwroot/sistema-contable/data/db.json`
- Guarda todas las transacciones, usuarios, contraseñas, etiquetas, categorías, presupuestos, credenciales biométricas y bitácora de auditoría.
- **Ventaja Híbrida**:
  - Funciona de forma 100% autónoma en tu servidor VPS sin costos de Firebase.
  - Sincroniza en tiempo real entre múltiples contadores/directores conectados simultáneamente.
  - Cuenta con respaldo y exportación de archivos cifrados `.ccf` y en Excel/PDF.

---

## 🔄 7. Comandos de Mantenimiento

```bash
# Ver estado del servidor con PM2
pm2 status

# Reiniciar la aplicación
pm2 restart sistema-contable

# Ver logs en tiempo real
pm2 logs sistema-contable
```
