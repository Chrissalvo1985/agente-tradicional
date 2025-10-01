# 🏗️ Arquitectura del Proyecto

## 📁 Estructura de Carpetas

```
agente-tradicional/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth.js endpoints
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── ai/                   # IA endpoints
│   │       ├── analyze-prices/
│   │       │   └── route.ts
│   │       └── process-receipt/
│   │           └── route.ts
│   ├── dashboard/                # Dashboard pages
│   │   ├── routes/              # Sistema de rutas
│   │   │   └── page.tsx
│   │   ├── prices/              # Levantamiento de precios
│   │   │   └── page.tsx
│   │   ├── loyalty/             # Fidelización
│   │   │   └── page.tsx
│   │   └── page.tsx             # Dashboard principal
│   ├── login/                    # Login page
│   │   └── page.tsx
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home (redirect)
│   └── providers.tsx            # React Query, Session providers
│
├── components/                   # Componentes React
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   └── card.tsx
│   ├── dashboard/               # Dashboard components
│   │   ├── header.tsx
│   │   ├── stats-grid.tsx
│   │   ├── recent-activity.tsx
│   │   └── quick-actions.tsx
│   ├── camera/                  # Componentes de cámara
│   │   └── camera-capture.tsx
│   └── maps/                    # Componentes de mapas
│       └── route-map.tsx
│
├── lib/                         # Utilidades y configuraciones
│   ├── prisma.ts               # Prisma Client singleton
│   ├── openai.ts               # OpenAI client + helpers
│   └── utils.ts                # Funciones auxiliares
│
├── hooks/                       # Custom React Hooks
│   ├── use-geolocation.ts     # Hook de geolocalización
│   └── use-camera.ts          # Hook de cámara
│
├── types/                       # TypeScript type definitions
│   └── next-auth.d.ts         # NextAuth types extension
│
├── prisma/                      # Prisma ORM
│   └── schema.prisma          # Database schema
│
├── public/                      # Static files
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service Worker
│   ├── offline.html           # Offline fallback
│   ├── icon-192.png           # PWA icons (placeholder)
│   └── icon-512.png
│
├── auth.ts                      # NextAuth.js v5 config
├── auth.config.ts              # Auth configuration
├── middleware.ts               # Next.js middleware
├── tailwind.config.ts          # Tailwind configuration
├── next.config.ts              # Next.js configuration
├── components.json             # shadcn/ui config
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
├── .env                        # Environment variables
├── .env.example               # Environment template
├── .gitignore                 # Git ignore
└── README.md                  # Documentación
```

---

## 🔄 Flujo de Datos

### Autenticación

```
User Login
    ↓
NextAuth.js v5 (auth.ts)
    ↓
Credentials/OAuth Provider
    ↓
Prisma (User verification)
    ↓
JWT Session
    ↓
Protected Routes (middleware.ts)
```

### Captura de Imágenes + IA

```
Camera Component (use-camera.ts)
    ↓
Image Capture (base64)
    ↓
API Route (/api/ai/*)
    ↓
OpenAI GPT-4o Vision
    ↓
JSON Response
    ↓
React State Update
    ↓
UI Rendering
```

### Geolocalización

```
Navigator Geolocation API
    ↓
useGeolocation Hook
    ↓
Real-time Position Updates
    ↓
Leaflet Map Component
    ↓
Route Optimization
```

---

## 🎨 Patrones de Diseño

### Server Components vs Client Components

**Server Components** (por defecto en Next.js 15):
- Dashboard layouts
- Data fetching pages
- Authentication checks

**Client Components** (`'use client'`):
- Interactive UI (buttons, forms)
- Hooks (useState, useEffect)
- Browser APIs (Camera, Geolocation)

### State Management

- **React Query**: Server state, caching
- **Zustand**: Global client state (si es necesario)
- **React Context**: Theme, session (via NextAuth)

### Data Fetching

```typescript
// Server Component (preferido)
async function DashboardPage() {
  const data = await fetchData() // Direct DB access
  return <UI data={data} />
}

// Client Component + API
function ClientComponent() {
  const { data } = useQuery({
    queryKey: ['key'],
    queryFn: () => fetch('/api/endpoint')
  })
}
```

---

## 🔐 Seguridad

### Autenticación

- **NextAuth.js v5**: Session management
- **JWT**: Stateless sessions
- **bcrypt**: Password hashing
- **CSRF Protection**: Built-in Next.js

### Autorización

```typescript
// Middleware protection
export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/login', req.url))
  }
})

// Server Component
async function ProtectedPage() {
  const session = await auth()
  if (!session) redirect('/login')
  // ... render page
}

// API Route
export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // ... handle request
}
```

### Database Security

- **Prisma**: SQL injection prevention
- **Environment Variables**: Secrets management
- **Connection Pooling**: Neon serverless
- **SSL**: Required connections

---

## 🚀 Performance

### Optimizaciones Implementadas

1. **Image Optimization**
   - Next.js Image component
   - Automatic WebP conversion
   - Lazy loading

2. **Code Splitting**
   - Dynamic imports
   - Route-based splitting
   - Component lazy loading

3. **Caching**
   - React Query stale-while-revalidate
   - Service Worker cache
   - Edge caching (Vercel)

4. **Database**
   - Prisma connection pooling
   - Efficient queries
   - Indexes en campos clave

### Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

## 📱 PWA Architecture

### Service Worker Strategies

```javascript
// Cache-first (Static assets)
self.addEventListener('fetch', (event) => {
  if (isStaticAsset(event.request)) {
    event.respondWith(cacheFirst(event.request))
  }
})

// Network-first (API calls)
self.addEventListener('fetch', (event) => {
  if (isAPICall(event.request)) {
    event.respondWith(networkFirst(event.request))
  }
})
```

### Offline Support

- **Static Pages**: Cached
- **API Calls**: Background sync
- **Forms**: IndexedDB queue
- **Offline Fallback**: `/offline.html`

---

## 🤖 IA Integration

### OpenAI GPT-4o Vision Pipeline

```typescript
// 1. Image Capture
const imageBase64 = camera.capture()

// 2. API Call
const response = await fetch('/api/ai/analyze-prices', {
  method: 'POST',
  body: JSON.stringify({ imageBase64 })
})

// 3. OpenAI Processing
const prices = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
      { type: 'text', text: 'Analiza precios' }
    ]
  }]
})

// 4. Response Parsing
const data = JSON.parse(prices.choices[0].message.content)
```

### Funciones IA

| Función | Modelo | Input | Output |
|---------|--------|-------|--------|
| `analyzePrices()` | GPT-4o | Imagen góndola | Array de productos + precios |
| `processReceipt()` | GPT-4o | Imagen boleta | Datos estructurados de compra |
| `detectExhibition()` | GPT-4o | Imagen exhibición | Tipo + estado + items |
| `classifyIncident()` | GPT-4o | Imagen incidencia | Tipo + severidad + descripción |

---

## 🗄️ Database Design

### Relaciones Principales

```
User (1) ──→ (1) Agent
Agent (1) ──→ (N) Route
Route (1) ──→ (N) Task
Task (1) ──→ (N) Visit
Visit (1) ──→ (N) PriceAudit
Visit (1) ──→ (N) Incident

PDV (1) ──→ (N) LoyaltyCustomer
LoyaltyCustomer (1) ──→ (N) Receipt
LoyaltyCustomer (1) ──→ (N) Reward

Product (1) ──→ (N) PriceAudit
Product (1) ──→ (N) CompetitorPrice
```

### Indexes Recomendados

```prisma
// Agregar al schema.prisma para mejor performance
@@index([agentId, date])       // Routes
@@index([pdvId, type])          // Tasks
@@index([productId, createdAt]) // PriceAudits
@@index([customerId])           // Receipts
```

---

## 🔄 CI/CD (Recomendado)

### GitHub Actions Workflow

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npx prisma generate
      - run: npx vercel --prod
```

---

## 📊 Monitoring (Futuro)

### Recomendaciones

- **Analytics**: Vercel Analytics
- **Error Tracking**: Sentry
- **Performance**: Web Vitals reporting
- **Logs**: Vercel Logs / Logtail
- **Database**: Neon metrics

---

**Arquitectura escalable, moderna y lista para producción 🚀**
