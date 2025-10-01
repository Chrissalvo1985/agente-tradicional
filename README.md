# 🚀 Agente de Tradicional - PWA Mobile First

Progressive Web App de nueva generación para agentes comerciales en retail tradicional.

## 📦 Stack Tecnológico

- **Frontend**: Next.js 15 + TypeScript 5.5+
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Neon PostgreSQL (Serverless)
- **ORM**: Prisma 5.8
- **Auth**: NextAuth.js v5
- **IA**: OpenAI GPT-4o + Vision
- **State**: Zustand 4.5 + TanStack Query v5
- **PWA**: Service Worker + Web App Manifest

## 🛠️ Setup Inicial

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd agente-tradicional
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# NextAuth.js v5
AUTH_SECRET="generate-with: openssl rand -base64 32"
AUTH_URL="http://localhost:3000"

# OAuth Providers (Opcional)
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# OpenAI API
OPENAI_API_KEY="sk-..."
```

### 3. Setup de Base de Datos

#### Opción A: Usar Neon (Recomendado para producción)

1. Crear cuenta en [Neon](https://neon.tech)
2. Crear nuevo proyecto PostgreSQL
3. Copiar connection string a `DATABASE_URL`
4. Ejecutar migraciones:

```bash
npx prisma generate
npx prisma db push
```

#### Opción B: PostgreSQL local (Desarrollo)

```bash
# Asegúrate de tener PostgreSQL instalado y corriendo
createdb agente_tradicional

# Actualiza DATABASE_URL en .env
DATABASE_URL="postgresql://localhost:5432/agente_tradicional"

# Ejecutar migraciones
npx prisma generate
npx prisma db push
```

### 4. Generar AUTH_SECRET

```bash
openssl rand -base64 32
```

Copia el resultado a `AUTH_SECRET` en `.env`

### 5. (Opcional) Configurar Google OAuth

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto
3. Habilitar Google+ API
4. Crear credenciales OAuth 2.0
5. Agregar authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://tu-dominio.com/api/auth/callback/google`
6. Copiar Client ID y Client Secret a `.env`

### 6. (Opcional) Configurar OpenAI API

1. Crear cuenta en [OpenAI](https://platform.openai.com/)
2. Generar API Key
3. Copiar a `OPENAI_API_KEY` en `.env`

### 7. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📱 PWA Features

### Instalación

La app se puede instalar como PWA en:

- **iOS**: Safari > Share > Add to Home Screen
- **Android**: Chrome > Menu > Install App
- **Desktop**: Chrome/Edge > Address bar > Install icon

### Offline Support

- Caching de assets estáticos
- Sincronización en background
- Funcionamiento sin conexión para funciones core

### Push Notifications

Implementadas para:
- Recordatorios de tareas
- Actualizaciones de ruta
- Alertas de incidencias

## 🗄️ Base de Datos

### Schema Principal

```prisma
- Users & Auth (NextAuth.js v5)
- Agents & PDV
- Routes & Tasks
- Visits & Geolocation
- Products & Price Audits
- Loyalty Customers & Receipts
- Incidents & Exhibitions
```

### Migraciones

```bash
# Generar nueva migración
npx prisma migrate dev --name migration_name

# Reset database (desarrollo)
npx prisma migrate reset

# Ver base de datos
npx prisma studio
```

## 🤖 IA Features

### Procesamiento de Imágenes

- **OCR de Boletas**: Extracción automática de datos
- **Análisis de Precios**: Detección visual en góndolas
- **Clasificación de Exhibiciones**: Verificación de material POP
- **Detección de Incidencias**: Análisis automático

### Configuración

Todas las funciones de IA están en `lib/openai.ts` usando GPT-4o + Vision.

## 🚀 Deployment

### Vercel (Recomendado)

1. Push a GitHub
2. Importar en [Vercel](https://vercel.com)
3. Configurar variables de entorno
4. Deploy automático

```bash
# O usar Vercel CLI
npm i -g vercel
vercel login
vercel
```

### Variables de Entorno en Vercel

Agregar todas las variables del archivo `.env` en:
Settings > Environment Variables

## 📊 Scripts Disponibles

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Start producción
npm run lint         # Linter
npx prisma studio    # DB GUI
npx prisma generate  # Generar cliente
npx prisma db push   # Push schema
```

## 🔒 Seguridad

- Autenticación con NextAuth.js v5
- Encriptación de contraseñas con bcrypt
- JWT sessions
- CORS configurado
- Rate limiting (producción)
- Row Level Security en Neon

## 📱 Mobile-First

- Touch-optimized UI
- Gesture navigation
- Haptic feedback
- Safe area support
- Responsive desde 320px

## 🎨 Componentes UI

Basados en shadcn/ui + Radix UI:

- Fully accessible (WCAG 2.1)
- Dark mode support
- Customizable con Tailwind
- TypeScript strict

## 📄 Licencia

MIT

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

---

**Desarrollado con ❤️ para revolucionar el trabajo de campo**