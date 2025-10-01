import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleProducts = [
  {
    sku: 'COCA500',
    name: 'Coca Cola 500ml',
    category: 'Bebidas',
    brand: 'Coca Cola',
    targetPrice: 2.50
  },
  {
    sku: 'PEPSI500',
    name: 'Pepsi 500ml',
    category: 'Bebidas',
    brand: 'Pepsi',
    targetPrice: 2.30
  },
  {
    sku: 'BIMBO001',
    name: 'Pan Integral Bimbo',
    category: 'Panadería',
    brand: 'Bimbo',
    targetPrice: 1.80
  },
  {
    sku: 'ALQUERIA1L',
    name: 'Leche Entera 1L',
    category: 'Lácteos',
    brand: 'Alquería',
    targetPrice: 3.20
  },
  {
    sku: 'NESTLE1L',
    name: 'Leche Deslactosada 1L',
    category: 'Lácteos',
    brand: 'Nestlé',
    targetPrice: 3.50
  },
  {
    sku: 'DORITOS150',
    name: 'Doritos 150g',
    category: 'Snacks',
    brand: 'Frito Lay',
    targetPrice: 2.80
  },
  {
    sku: 'CHIPS150',
    name: 'Chips Ahoy 150g',
    category: 'Snacks',
    brand: 'Nabisco',
    targetPrice: 2.60
  },
  {
    sku: 'ARROZ1KG',
    name: 'Arroz Blanco 1kg',
    category: 'Granos',
    brand: 'Diana',
    targetPrice: 2.20
  },
  {
    sku: 'ACEITE500',
    name: 'Aceite de Girasol 500ml',
    category: 'Aceites',
    brand: 'Gourmet',
    targetPrice: 4.50
  },
  {
    sku: 'AZUCAR1KG',
    name: 'Azúcar Blanca 1kg',
    category: 'Endulzantes',
    brand: 'Manuelita',
    targetPrice: 1.90
  }
]

async function main() {
  console.log('🌱 Seeding products...')

  for (const product of sampleProducts) {
    try {
      await prisma.product.upsert({
        where: { sku: product.sku },
        update: product,
        create: product
      })
      console.log(`✅ Product ${product.sku} created/updated`)
    } catch (error) {
      console.error(`❌ Error with product ${product.sku}:`, error)
    }
  }

  console.log('🎉 Products seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
