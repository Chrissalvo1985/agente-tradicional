# 🚀 Agente Tradicional - Sistema de Gestión de Tareas

Sistema completo de gestión de tareas para agentes de ventas tradicionales con funcionalidades avanzadas de levantamiento de precios, checklists de exhibición, fidelización de clientes y análisis con IA.

## ✨ Características Principales

### 🎯 **Gestión de Tareas**
- ✅ **Plantillas de Tareas**: Creación, edición, eliminación e inactivación
- ✅ **Tipos de Tareas**: Levantamiento de precios por SKU y checklists de exhibición
- ✅ **Importación Excel**: Carga masiva de productos desde archivos Excel
- ✅ **Asignaciones**: Gestión de asignaciones por PDV y agente específico

### 🏢 **Sistema Multi-Tenant**
- ✅ **Clientes**: Gestión completa de clientes con códigos únicos
- ✅ **PDVs**: Maestra global de puntos de venta con geolocalización
- ✅ **Agentes**: Sistema de agentes con territorios y supervisores
- ✅ **Rutas**: Planificación y optimización de rutas de visitas

### 🔐 **Autenticación y Roles**
- ✅ **NextAuth.js**: Autenticación segura con múltiples proveedores
- ✅ **Roles de Usuario**: SUPER_ADMIN, ADMIN, STORE_KEEPER, AGENT
- ✅ **Permisos**: Control granular de acceso por funcionalidad
- ✅ **Middleware**: Protección de rutas automática

### 📊 **Dashboard y Analytics**
- ✅ **Dashboard Principal**: Estadísticas y métricas en tiempo real
- ✅ **Configuración**: Gestión completa de clientes, PDVs, rutas y usuarios
- ✅ **Reportes**: Visualización de datos con gráficos interactivos
- ✅ **Actividad Reciente**: Seguimiento de acciones del sistema

### 🤖 **Inteligencia Artificial**
- ✅ **Análisis de Precios**: Procesamiento automático de imágenes de precios
- ✅ **Procesamiento de Recibos**: Extracción de datos de recibos con IA
- ✅ **OpenAI Integration**: GPT-4 Mini para análisis inteligente
- ✅ **Confianza de IA**: Métricas de confianza en las predicciones

### 📱 **Progressive Web App (PWA)**
- ✅ **Offline Support**: Funcionalidad sin conexión a internet
- ✅ **Service Worker**: Cache inteligente de recursos
- ✅ **Manifest**: Instalación como app nativa
- ✅ **Responsive**: Diseño adaptativo para todos los dispositivos

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático para mayor robustez
- **Tailwind CSS** - Framework de estilos utilitarios
- **shadcn/ui** - Componentes de UI modernos y accesibles
- **Lucide React** - Iconografía consistente
- **Framer Motion** - Animaciones fluidas

### **Backend**
- **Next.js API Routes** - API REST integrada
- **Prisma ORM** - Base de datos type-safe
- **PostgreSQL** - Base de datos relacional robusta
- **NextAuth.js** - Autenticación completa
- **XLSX** - Procesamiento de archivos Excel

### **Base de Datos**
- **PostgreSQL** - Base de datos principal
- **Prisma Schema** - Modelado de datos con relaciones complejas
- **Migraciones** - Control de versiones de esquema
- **Seeding** - Datos de ejemplo para desarrollo

### **IA y Análisis**
- **OpenAI GPT-4 Mini** - Análisis inteligente de datos
- **Computer Vision** - Procesamiento de imágenes
- **OCR** - Reconocimiento óptico de caracteres

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/Chrissalvo1985/agente-tradicional.git
cd agente-tradicional
```

### **2. Instalar Dependencias**
```bash
npm install
```

### **3. Configurar Variables de Entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local` con tus configuraciones:
```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/agente_tradicional"

# NextAuth.js
NEXTAUTH_SECRET="tu-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="tu-openai-api-key"
```

### **4. Configurar Base de Datos**
```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Cargar datos de ejemplo
npx tsx scripts/seed-products.ts
```

### **5. Ejecutar en Desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
agente-tradicional/
├── app/                          # App Router de Next.js
│   ├── api/                     # API Routes
│   │   ├── auth/               # Autenticación
│   │   ├── clients/            # Gestión de clientes
│   │   ├── task-templates/     # Plantillas de tareas
│   │   └── ai/                 # Endpoints de IA
│   ├── dashboard/              # Dashboard principal
│   └── login/                  # Página de login
├── components/                  # Componentes React
│   ├── dashboard/              # Componentes del dashboard
│   ├── tasks/                  # Componentes de tareas
│   └── ui/                     # Componentes base
├── lib/                        # Utilidades y configuraciones
├── prisma/                     # Esquema y migraciones
├── scripts/                    # Scripts de utilidad
└── types/                      # Definiciones de tipos
```

## 🎯 Funcionalidades Detalladas

### **Gestión de Plantillas de Tareas**
- Crear plantillas de levantamiento de precios por SKU
- Crear plantillas de checklist de exhibiciones
- Importar productos desde archivos Excel
- Gestionar asignaciones por PDV y agente
- Activar/desactivar plantillas

### **Sistema Multi-Tenant**
- Gestión de múltiples clientes
- Asignación de usuarios por cliente
- Configuración de PDVs por cliente
- Control de acceso granular

### **Dashboard Inteligente**
- Estadísticas en tiempo real
- Métricas de rendimiento
- Actividad reciente
- Configuración centralizada

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción

# Base de datos
npx prisma studio    # Interfaz visual de la BD
npx prisma migrate   # Ejecutar migraciones
npx prisma generate  # Generar cliente

# Utilidades
npx tsx scripts/seed-products.ts           # Cargar productos de ejemplo
npx tsx scripts/generate-excel-template.ts # Generar plantilla Excel
```

## 📊 Base de Datos

### **Entidades Principales**
- **Clientes**: Información de empresas cliente
- **Usuarios**: Sistema de usuarios con roles
- **PDVs**: Puntos de venta con geolocalización
- **Agentes**: Agentes de ventas con territorios
- **Plantillas**: Plantillas de tareas configurables
- **Tareas**: Instancias de tareas ejecutables
- **Productos**: Catálogo de productos por plantilla

### **Relaciones**
- Cliente → Usuarios (1:N)
- Cliente → PDVs (1:N)
- Agente → Rutas (1:N)
- Plantilla → Tareas (1:N)
- Producto → Plantilla (N:N)

## 🚀 Despliegue

### **Vercel (Recomendado)**
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Desplegar automáticamente

### **Docker**
```bash
docker build -t agente-tradicional .
docker run -p 3000:3000 agente-tradicional
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores

- **Chris Salvo** - *Desarrollo completo* - [Chrissalvo1985](https://github.com/Chrissalvo1985)

## 🙏 Agradecimientos

- Next.js team por el excelente framework
- shadcn/ui por los componentes de UI
- Prisma team por el ORM type-safe
- OpenAI por las capacidades de IA

---

⭐ **¡Dale una estrella al proyecto si te gusta!** ⭐