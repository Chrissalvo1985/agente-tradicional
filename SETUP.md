# 🚀 Guía de Setup - Agente Tradicional

## ⚡ Quick Start

### 1. Instalar dependencias

```bash
cd agente-tradicional
npm install
```

### 2. Configurar base de datos (Neon PostgreSQL)

#### Opción A: Neon (Recomendado)

1. Crear cuenta en [Neon](https://neon.tech)
2. Crear nuevo proyecto PostgreSQL
3. Copiar connection string

#### Opción B: PostgreSQL Local

```bash
createdb agente_tradicional
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# NextAuth.js v5
AUTH_SECRET="tu-secret-aqui"  # Generar con: openssl rand -base64 32
AUTH_URL="http://localhost:3000"

# OpenAI API (Opcional - para features de IA)
OPENAI_API_KEY="sk-..."

# OAuth Google (Opcional)
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
```

### 4. Generar Prisma Client y crear base de datos

```bash
npx prisma generate
npx prisma db push
```

### 5. (Opcional) Seed de datos

```bash
npx prisma db seed
```

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

---

## 🔑 Credenciales por Defecto

Como la app usa NextAuth.js v5, puedes iniciar sesión con:

- **Google OAuth** (si configuraste las credenciales)
- **Credentials**: Deberás crear un usuario manualmente en la BD

### Crear usuario admin manualmente:

```bash
npx prisma studio
```

Luego en la tabla `User`:
- email: `admin@agente.com`
- name: `Admin`
- role: `ADMIN`
- password: (hash bcrypt de tu contraseña)

Para generar hash de contraseña:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('tupassword', 10))"
```

---

## 📱 Características Principales

### ✅ Implementadas

1. **Dashboard Principal**
   - KPIs en tiempo real
   - Actividad reciente
   - Acciones rápidas

2. **Sistema de Rutas**
   - Mapa interactivo con Leaflet
   - Geolocalización en tiempo real
   - Check-in/out por proximidad
   - Navegación a PDV

3. **Levantamiento de Precios con IA**
   - Captura de imágenes con cámara
   - Análisis con OpenAI GPT-4o Vision
   - Detección automática de productos y precios
   - Comparación vs precios objetivo

4. **Compadre Almacenero (Fidelización)**
   - Escaneo de boletas con IA
   - Procesamiento OCR automático
   - Cálculo de puntos
   - Sistema de niveles (Bronze → Diamond)

5. **PWA Features**
   - Service Worker
   - Manifest.json
   - Offline support
   - Instalable en dispositivos móviles

6. **Autenticación**
   - NextAuth.js v5
   - Login con credentials
   - Google OAuth (opcional)
   - Protección de rutas

---

## 🗄️ Base de Datos

### Schema Principal

El schema de Prisma incluye:

- **Autenticación**: Users, Accounts, Sessions
- **Agentes y PDV**: Agents, PDV
- **Rutas**: Routes, Tasks, Visits
- **Precios**: Products, PriceAudits, CompetitorPrices
- **Fidelización**: LoyaltyCustomers, Receipts, Rewards
- **Incidencias**: Incidents, Exhibitions

### Comandos útiles

```bash
# Ver base de datos en GUI
npx prisma studio

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Reset database (⚠️ Borra todos los datos)
npx prisma migrate reset

# Formato del schema
npx prisma format
```

---

## 🤖 Configuración de OpenAI API

### Obtener API Key

1. Ir a [OpenAI Platform](https://platform.openai.com/)
2. Crear cuenta o iniciar sesión
3. Ir a API Keys
4. Crear nueva key
5. Copiar a `OPENAI_API_KEY` en `.env`

### Funciones disponibles

- `analyzePrices(image)` - Detecta productos y precios en góndolas
- `processReceipt(image)` - Extrae datos de boletas/facturas
- `detectExhibition(image)` - Verifica exhibiciones de productos
- `classifyIncident(image)` - Clasifica incidencias automáticamente

Todas usan **GPT-4o** con Vision.

---

## 📱 PWA Features

### Instalación

La app se puede instalar como PWA en:

- **iOS**: Safari > Share > Add to Home Screen
- **Android**: Chrome > Menu > Install App
- **Desktop**: Chrome/Edge > Address bar > Install icon

### Service Worker

El Service Worker está en `/public/sw.js` e implementa:

- Cache-first para assets estáticos
- Network-first para datos dinámicos
- Sincronización en background
- Push notifications (ready)

### Testing PWA

1. Build de producción: `npm run build`
2. Start: `npm start`
3. Abrir Chrome DevTools > Application > Service Workers

---

## 🚀 Deployment

### Vercel (Recomendado)

1. Push a GitHub
2. Importar en [Vercel](https://vercel.com)
3. Configurar variables de entorno
4. Deploy automático

#### Variables de entorno en Vercel:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_URL` (URL de producción)
- `OPENAI_API_KEY`
- `AUTH_GOOGLE_ID` (opcional)
- `AUTH_GOOGLE_SECRET` (opcional)

---

## 🐛 Troubleshooting

### Error: "Cannot find module '@prisma/client'"

```bash
npx prisma generate
```

### Error: "Environment variable not found: DATABASE_URL"

Verifica que el archivo `.env` existe y tiene la variable `DATABASE_URL`.

### La cámara no funciona

- Verifica permisos del navegador
- En iOS, necesitas HTTPS (funciona en localhost sin HTTPS)
- La cámara solo funciona en contextos seguros

### OpenAI API returns error

- Verifica que `OPENAI_API_KEY` está configurado
- Verifica que tienes créditos en tu cuenta OpenAI
- El modelo `gpt-4o` debe estar disponible en tu plan

### Build warnings sobre bcryptjs

Es normal. bcryptjs usa APIs de Node.js que no están disponibles en Edge Runtime, pero funciona correctamente en Serverless Functions.

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js v5 Docs](https://next-auth.js.org/)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 🎯 Próximos Pasos

1. Configurar variables de entorno
2. Ejecutar `npm run dev`
3. Crear usuario admin
4. Explorar el dashboard
5. Configurar OpenAI API para features de IA
6. Personalizar según necesidades

---

**¡Listo para revolucionar el trabajo de campo! 🚀**
