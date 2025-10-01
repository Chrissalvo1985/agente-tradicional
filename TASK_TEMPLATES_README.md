# Gestión de Plantillas de Tareas

## Funcionalidades Implementadas

### ✅ CRUD Completo de Plantillas
- **Crear**: Modal completo para crear nuevas plantillas
- **Leer**: Lista todas las plantillas con filtros por tipo
- **Actualizar**: Edición completa de plantillas existentes
- **Eliminar**: Eliminación con validación de tareas asociadas

### ✅ Tipos de Plantillas Soportadas
1. **PRICE_AUDIT_SKU**: Levantamiento de precios por SKU
2. **EXHIBITION_CHECKLIST**: Checklist de exhibiciones

### ✅ Gestión de Estados
- **Activar/Desactivar**: Toggle de estado de plantillas
- **Validación**: No se pueden eliminar plantillas con tareas asociadas

### ✅ Importación Excel para Productos
- **Plantilla descargable**: Archivo Excel con formato correcto
- **Validación de datos**: Verificación de columnas requeridas
- **Procesamiento masivo**: Creación/actualización de productos
- **Integración automática**: Los productos se agregan automáticamente a la plantilla

### ✅ Gestión de Asignaciones
- **Modal dedicado**: Interfaz para gestionar asignaciones
- **Flexibilidad**: Asignar por PDV específico, agente específico, o ambos
- **Estado de asignaciones**: Activar/desactivar asignaciones individuales

## Estructura de Archivos

```
app/api/task-templates/
├── route.ts                    # GET, POST, PUT para plantillas
├── [id]/route.ts              # GET, PUT, DELETE, PATCH por ID
└── import-products/route.ts   # POST para importación Excel

app/api/products/
└── route.ts                   # GET, POST para productos

components/tasks/
├── task-template-modal.tsx    # Modal de creación/edición
└── template-assignments-modal.tsx # Modal de asignaciones

scripts/
├── seed-products.ts           # Script para crear productos de ejemplo
└── generate-excel-template.ts # Genera plantilla Excel
```

## Uso de la Funcionalidad

### 1. Crear Nueva Plantilla
1. Ir a Dashboard → Configuración → Tareas
2. Hacer clic en "Nueva Plantilla"
3. Completar información básica
4. Seleccionar tipo de plantilla
5. Configurar items (productos o checklist)
6. Guardar

### 2. Importar Productos desde Excel
1. Crear/editar plantilla de tipo "Precios por SKU"
2. Hacer clic en "Descargar Plantilla" para obtener formato
3. Llenar el archivo Excel con los productos
4. Hacer clic en "Importar Excel"
5. Seleccionar el archivo
6. Los productos se procesarán automáticamente

### 3. Gestionar Asignaciones
1. En la tabla de plantillas, hacer clic en el ícono de mapa
2. Agregar nuevas asignaciones
3. Configurar PDV y/o agente específico
4. Activar/desactivar asignaciones
5. Guardar cambios

### 4. Activar/Desactivar Plantillas
- Usar el botón de power en la tabla de plantillas
- Las plantillas inactivas no aparecerán en las opciones de tareas

## Formato del Archivo Excel

El archivo debe contener las siguientes columnas:
- `sku`: Código único del producto
- `name`: Nombre del producto
- `category`: Categoría del producto
- `brand`: Marca del producto
- `targetPrice`: Precio objetivo (número)

## APIs Disponibles

### Plantillas
- `GET /api/task-templates` - Listar plantillas
- `POST /api/task-templates` - Crear plantilla
- `GET /api/task-templates/[id]` - Obtener plantilla específica
- `PUT /api/task-templates/[id]` - Actualizar plantilla
- `DELETE /api/task-templates/[id]` - Eliminar plantilla
- `PATCH /api/task-templates/[id]` - Activar/desactivar plantilla

### Productos
- `GET /api/products` - Listar productos activos
- `POST /api/products` - Crear producto

### Importación
- `POST /api/task-templates/import-products` - Importar productos desde Excel

## Base de Datos

### Tablas Principales
- `task_templates`: Plantillas de tareas
- `sku_template_items`: Items de productos en plantillas
- `checklist_template_items`: Items de checklist en plantillas
- `task_assignments`: Asignaciones de plantillas
- `products`: Catálogo de productos

### Relaciones
- Una plantilla puede tener múltiples items (SKU o checklist)
- Una plantilla puede tener múltiples asignaciones
- Los productos se reutilizan entre plantillas
- Las tareas referencian plantillas para obtener configuración

## Próximas Mejoras Sugeridas

1. **Validación avanzada**: Validar que los SKUs no se dupliquen
2. **Historial de cambios**: Auditoría de modificaciones en plantillas
3. **Plantillas por cliente**: Restringir plantillas por cliente específico
4. **Importación masiva**: Permitir importar múltiples plantillas
5. **Exportación**: Exportar plantillas a Excel/PDF
6. **Plantillas predefinidas**: Crear plantillas estándar por industria
