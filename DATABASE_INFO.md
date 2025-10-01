# 🗄️ Información de Base de Datos

## ✅ Base de Datos Configurada

Tu base de datos Neon PostgreSQL está **completamente configurada y lista** para usar.

### 📊 Conexión

- **Project ID**: `shiny-glitter-49829966`
- **Branch**: `main`
- **Database**: `neondb`
- **Region**: `us-west-2` (AWS)

**Connection String** (ya configurado en `.env`):
```
postgresql://[USERNAME]:[PASSWORD]@[HOST]/[DATABASE]?channel_binding=require&sslmode=require
```

### 🏗️ Tablas Creadas (17 total)

#### Autenticación
- ✅ `users` - Usuarios del sistema
- ✅ `accounts` - Cuentas OAuth
- ✅ `sessions` - Sesiones activas
- ✅ `verification_tokens` - Tokens de verificación

#### Core Business
- ✅ `agents` - Agentes de campo
- ✅ `pdvs` - Puntos de venta
- ✅ `routes` - Rutas planificadas
- ✅ `tasks` - Tareas asignadas
- ✅ `visits` - Visitas realizadas

#### Productos y Precios
- ✅ `products` - Catálogo de productos
- ✅ `price_audits` - Auditorías de precios
- ✅ `competitor_prices` - Precios de competencia

#### Fidelización
- ✅ `loyalty_customers` - Clientes del programa
- ✅ `receipts` - Boletas procesadas
- ✅ `rewards` - Recompensas otorgadas

#### Operaciones
- ✅ `incidents` - Incidencias reportadas
- ✅ `exhibitions` - Exhibiciones de productos

---

## 👤 Usuario Admin Creado

**Email**: `admin@agente.com`  
**Password**: `[CONFIGURE_IN_ENV]`  
**Role**: `ADMIN`

---

## 📦 Datos de Ejemplo Cargados

### 4 PDV (Puntos de Venta)
1. **Almacén Don Pedro** - GOLD
   - Av. Libertador Bernardo O'Higgins 1234
   - Owner: Pedro Ramírez

2. **Minimarket La Esquina** - SILVER
   - Paseo Ahumada 567
   - Owner: María González

3. **Almacén El Sol** - PLATINUM
   - San Antonio 890
   - Owner: Juan Pérez

4. **Kiosco Central** - BRONZE
   - Estado 234
   - Owner: Ana Silva

### 5 Productos
1. Coca Cola 500ml - $1,200
2. Sprite 500ml - $1,150
3. Fanta 500ml - $1,100
4. Pepsi 500ml - $1,180
5. Agua Mineral 1L - $800

### 1 Ruta Activa
- Estado: IN_PROGRESS
- 3 tareas asignadas
- Distancia total: 8.4 km

### 3 Clientes Fidelizados
1. **Don Pedro** - GOLD (6,420 puntos)
2. **María González** - PLATINUM (12,350 puntos)
3. **Juan Pérez** - SILVER (2,180 puntos)

---

## 🚀 Próximos Pasos

1. **Iniciar la aplicación**:
   ```bash
   npm run dev
   ```

2. **Login**:
   - Ve a [http://localhost:3000](http://localhost:3000)
   - Email: `admin@agente.com`
   - Password: `[CONFIGURE_IN_ENV]`

3. **Explorar funcionalidades**:
   - ✅ Dashboard con datos reales
   - ✅ Rutas con PDV en mapa
   - ✅ Levantamiento de precios
   - ✅ Programa de fidelización

---

## 🔍 Consultas Útiles

### Ver todos los usuarios
```sql
SELECT id, name, email, role FROM users;
```

### Ver PDV con sus niveles
```sql
SELECT name, address, level, "ownerName" FROM pdvs ORDER BY level DESC;
```

### Ver productos y precios objetivo
```sql
SELECT name, brand, "targetPrice" FROM products ORDER BY brand;
```

### Ver rutas activas con tareas
```sql
SELECT 
  r.id as ruta,
  r.status,
  COUNT(t.id) as total_tareas,
  r."totalDistance" as distancia_km
FROM routes r
LEFT JOIN tasks t ON r.id = t."routeId"
GROUP BY r.id;
```

### Ver clientes por nivel de fidelización
```sql
SELECT 
  name,
  level,
  points,
  "totalSpent"
FROM loyalty_customers
ORDER BY points DESC;
```

---

## 🛠️ Herramientas de Gestión

### Prisma Studio (GUI)
```bash
npx prisma studio
```
Abre en [http://localhost:5555](http://localhost:5555)

### Consultas directas con MCP
Ya configurado para ejecutar SQL directamente desde la terminal.

---

## 🔐 Seguridad

- ✅ Connection string con SSL requerido
- ✅ Passwords hasheados con bcrypt
- ✅ JWT sessions para autenticación
- ✅ CORS configurado
- ✅ Environment variables protegidas

---

## 📊 Dashboard de Neon

Gestiona tu base de datos en:
[https://console.neon.tech/app/projects/shiny-glitter-49829966](https://console.neon.tech/app/projects/shiny-glitter-49829966)

Desde ahí puedes:
- Ver métricas de uso
- Gestionar branches
- Configurar backups
- Ver logs de queries
- Escalar recursos

---

**¡Base de datos lista para producción! 🎉**
