# ⚡ Inicio Rápido - 5 Minutos

## 1️⃣ Instalar Dependencias (1 min)

```bash
cd agente-tradicional
npm install
```

## 2️⃣ Configurar Base de Datos (2 min)

### Opción A: Neon (Recomendado - Gratis)

1. Ve a [console.neon.tech](https://console.neon.tech)
2. Crea cuenta (con GitHub es 1 click)
3. Crea proyecto nuevo
4. Copia el connection string

### Opción B: PostgreSQL Local

```bash
# Si tienes PostgreSQL instalado
createdb agente_tradicional
```

## 3️⃣ Crear archivo `.env` (30 seg)

```bash
# Copia el template
cp .env.example .env
```

Edita `.env`:

```env
# Pega tu connection string aquí
DATABASE_URL="postgresql://..."

# Genera un secret (copia el output del comando):
AUTH_SECRET="ejecuta: openssl rand -base64 32"

AUTH_URL="http://localhost:3000"

# Opcional (para features de IA):
OPENAI_API_KEY=""
```

## 4️⃣ Generar Base de Datos (30 seg)

```bash
npx prisma generate
npx prisma db push
```

## 5️⃣ Crear Usuario Admin (1 min)

```bash
# Abre Prisma Studio
npx prisma studio
```

En el navegador (http://localhost:5555):

1. Click en modelo **User**
2. Click **Add record**
3. Completa:
   - **email**: `admin@test.com`
   - **name**: `Admin`
   - **role**: `ADMIN`
   - **password**: Ejecuta en terminal:
     ```bash
     node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"
     ```
     Copia el hash generado
4. Click **Save 1 change**

## 6️⃣ Iniciar App (10 seg)

```bash
npm run dev
```

## 7️⃣ Login

1. Abre [http://localhost:3000](http://localhost:3000)
2. Login con:
   - **Email**: `admin@test.com`
   - **Password**: `admin123`

---

## ✅ ¡Listo!

Ahora puedes:

- ✨ Ver el dashboard principal
- 🗺️ Explorar rutas con mapa interactivo
- 📸 Probar captura de cámara (sin IA por ahora)
- 🎯 Navegar todas las secciones

---

## 🤖 (Opcional) Habilitar Features de IA

Para usar **análisis de precios** y **OCR de boletas**:

1. Crea cuenta en [platform.openai.com](https://platform.openai.com)
2. Crea API Key
3. Agrégala al `.env`:
   ```env
   OPENAI_API_KEY="sk-..."
   ```
4. Reinicia el servidor (`npm run dev`)

Ahora las funciones de IA funcionarán:
- 📊 Análisis de precios en góndolas
- 🧾 OCR de boletas para fidelización

---

## 🚨 Troubleshooting Rápido

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### "Environment variable not found: DATABASE_URL"
Verifica que `.env` existe y tiene `DATABASE_URL`

### La cámara no funciona
- Dale permisos al navegador
- En iOS: Safari > Ajustes del Sitio > Cámara
- En Android: Chrome > Ajustes del Sitio > Cámara

### No puedo hacer login
- Verifica que creaste el usuario en Prisma Studio
- Verifica que el hash de password es correcto
- Revisa la consola del navegador (F12)

---

## 📚 Siguiente Paso

Lee `SETUP.md` para configuración completa y `ARQUITECTURA.md` para entender la estructura.

---

**¡Disfruta construyendo! 🚀**
