import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'

const data = [
  ['sku', 'name', 'category', 'brand', 'targetPrice'],
  ['PROD001', 'Producto Ejemplo 1', 'Categoría A', 'Marca X', 10.50],
  ['PROD002', 'Producto Ejemplo 2', 'Categoría B', 'Marca Y', 15.75],
  ['PROD003', 'Producto Ejemplo 3', 'Categoría C', 'Marca Z', 8.25],
  ['PROD004', 'Producto Ejemplo 4', 'Categoría D', 'Marca W', 12.00],
  ['PROD005', 'Producto Ejemplo 5', 'Categoría E', 'Marca V', 6.80]
]

const worksheet = XLSX.utils.aoa_to_sheet(data)

// Ajustar el ancho de las columnas
const columnWidths = [
  { wch: 12 }, // sku
  { wch: 25 }, // name
  { wch: 15 }, // category
  { wch: 15 }, // brand
  { wch: 12 }  // targetPrice
]
worksheet['!cols'] = columnWidths

const workbook = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos')

// Crear el directorio public si no existe
const publicDir = path.join(process.cwd(), 'public')
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

// Escribir el archivo
const filePath = path.join(publicDir, 'plantilla-productos.xlsx')
XLSX.writeFile(workbook, filePath)

console.log('✅ Archivo Excel generado en:', filePath)
