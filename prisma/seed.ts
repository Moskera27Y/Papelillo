// prisma/seed.ts
// Seed para poblar la base de datos con productos y configuraciones iniciales de Papelillo

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Crear usuario admin por defecto
  const adminPasswordHash = await bcrypt.hash('papelillo2026', 10)
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminPasswordHash,
    },
  })
  console.log('✅ Admin user created')

  // 2. Crear categorías
  const categories = [
    { name: 'Para colorear', slug: 'para-colorear', color: 'red', order: 1, description: 'Libros y hojas para colorear', image: '/images/categories/colorear.jpg' },
    { name: 'Actividades', slug: 'actividades', color: 'yellow', order: 2, description: 'Trípticos, crucigramas y sopas de letras', image: '/images/categories/actividades.jpg' },
    { name: 'Invitaciones', slug: 'invitaciones', color: 'green', order: 3, description: 'Invitaciones digitales e impresas', image: '/images/categories/invitaciones.jpg' },
    { name: 'Cajas y regalos', slug: 'cajas-regalos', color: 'blue', order: 4, description: 'Cajitas personalizadas y cajas con relieve', image: '/images/categories/cajas.jpg' },
    { name: 'Stickers', slug: 'stickers', color: 'red', order: 5, description: 'Stickers de diferentes diseños', image: '/images/categories/stickers.jpg' },
    { name: 'Juegos', slug: 'juegos', color: 'yellow', order: 6, description: 'Rompecabezas personalizados', image: '/images/categories/juegos.jpg' },
    { name: 'Material creativo', slug: 'material-creativo', color: 'green', order: 7, description: 'Pizarras borrables', image: '/images/categories/material.jpg' },
    { name: 'Personalizados', slug: 'personalizados', color: 'blue', order: 8, description: 'Productos completamente personalizados', image: '/images/categories/personalizados.jpg' },
  ]

  const createdCategories: Record<string, string> = {}
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
    createdCategories[cat.slug] = created.id
  }
  console.log('✅ Categories created')

  // 3. Crear productos
  const products = [
    {
      slug: 'mini-libros',
      name: 'Mini libros',
      shortDescription: 'Pequeños libros llenos de dibujos para colorear y disfrutar.',
      description: 'Mini libros de aproximadamente 10 cm con 6 páginas para colorear. Perfectos para regalos y detalles especiales.',
      price: 1500,
      priceType: 'fixed',
      images: ['/images/products/mini-libros.jpg'],
      categoryId: createdCategories['para-colorear'],
      featured: true,
      isNew: false,
      isPopular: true,
      isActive: true,
      canBuy: true,
      height: 10,
      width: 10,
      depth: 1,
      unit: 'cm',
      features: [
        { text: '6 páginas para colorear', order: 1 },
        { text: 'Aproximadamente 10 cm', order: 2 },
      ],
    },
    {
      slug: 'libros-medianos',
      name: 'Libros medianos',
      shortDescription: 'Libros de 12 páginas para colorear.',
      description: 'Libros medianos de aproximadamente 15 cm con 12 páginas de dibujos para colorear.',
      price: 3000,
      priceType: 'fixed',
      images: ['/images/products/libros-medianos.jpg'],
      categoryId: createdCategories['para-colorear'],
      featured: true,
      isActive: true,
      canBuy: true,
      height: 15,
      width: 15,
      depth: 1,
      unit: 'cm',
      features: [
        { text: '12 páginas', order: 1 },
        { text: 'Aproximadamente 15 cm', order: 2 },
      ],
    },
    {
      slug: 'libros-grandes',
      name: 'Libros grandes',
      shortDescription: 'Libros grandes de 12 páginas.',
      description: 'Libros grandes de aproximadamente 20 cm con 12 páginas de dibujos para colorear.',
      price: 5000,
      priceType: 'fixed',
      images: ['/images/products/libros-grandes.jpg'],
      categoryId: createdCategories['para-colorear'],
      featured: true,
      isActive: true,
      canBuy: true,
      height: 20,
      width: 20,
      depth: 1,
      unit: 'cm',
      features: [
        { text: '12 páginas', order: 1 },
        { text: 'Aproximadamente 20 cm', order: 2 },
      ],
    },
    {
      slug: 'tripticos-para-colorear',
      name: 'Trípticos para colorear',
      shortDescription: 'Trípticos personalizados con actividades.',
      description: 'Trípticos de una hoja doble cara con crucigrama, sopa de letras, triqui y dibujos para colorear. Temática personalizada.',
      price: null,
      priceType: 'quote',
      requiresQuote: true,
      images: ['/images/products/tripticos.jpg'],
      categoryId: createdCategories['actividades'],
      isActive: true,
      canBuy: false,
      features: [
        { text: '1 hoja doble cara', order: 1 },
        { text: 'Crucigrama', order: 2 },
        { text: 'Sopa de letras', order: 3 },
        { text: 'Triqui', order: 4 },
        { text: 'Dibujos para colorear', order: 5 },
        { text: 'Temática personalizada', order: 6 },
      ],
    },
    {
      slug: 'invitaciones-digitales',
      name: 'Invitaciones digitales',
      shortDescription: 'Diseños personalizados para tu evento.',
      description: 'Invitaciones digitales personalizadas con la temática elegida por el cliente.',
      price: 10000,
      priceType: 'from',
      images: ['/images/products/invitaciones-digitales.jpg'],
      categoryId: createdCategories['invitaciones'],
      isCustomizable: true,
      isActive: true,
      canBuy: true,
      features: [
        { text: 'Diseños personalizados', order: 1 },
        { text: 'Temática elegida por el cliente', order: 2 },
        { text: 'Formato digital', order: 3 },
      ],
    },
    {
      slug: 'invitaciones-impresas-sencillas',
      name: 'Invitaciones impresas sencillas',
      shortDescription: 'Invitaciones impresas en papel sencillo.',
      description: 'Invitaciones impresas en papel sencillo con diseños personalizados.',
      price: 2000,
      priceType: 'fixed',
      images: ['/images/products/invitaciones-impresas.jpg'],
      categoryId: createdCategories['invitaciones'],
      isCustomizable: true,
      isActive: true,
      canBuy: true,
      features: [
        { text: 'Impresas en papel sencillo', order: 1 },
        { text: 'Diseños personalizados', order: 2 },
      ],
    },
    {
      slug: 'cajitas-personalizadas-sencillas',
      name: 'Cajitas personalizadas sencillas',
      shortDescription: 'Cajitas personalizadas según la temática.',
      description: 'Cajitas personalizadas con diseños sencillos según la temática que elijas.',
      price: 5000,
      priceType: 'fixed',
      images: ['/images/products/cajitas-sencillas.jpg'],
      categoryId: createdCategories['cajas-regalos'],
      isCustomizable: true,
      isActive: true,
      canBuy: true,
      features: [
        { text: 'Personalizadas según la temática', order: 1 },
        { text: 'Diseños sencillos', order: 2 },
      ],
    },
    {
      slug: 'cajas-personalizadas-con-relieve',
      name: 'Cajas personalizadas con relieve',
      shortDescription: 'Cajas premium con relieve.',
      description: 'Cajas personalizadas con elementos en relieve para un acabado premium.',
      price: 7000,
      priceType: 'fixed',
      images: ['/images/products/cajas-relieve.jpg'],
      categoryId: createdCategories['cajas-regalos'],
      isCustomizable: true,
      featured: true,
      isActive: true,
      canBuy: true,
      features: [
        { text: 'Diseños personalizados', order: 1 },
        { text: 'Elementos con relieve', order: 2 },
      ],
    },
    {
      slug: 'stickers',
      name: 'Stickers',
      shortDescription: 'Stickers de diferentes diseños.',
      description: 'Stickers de variedad de diseños. Precio por unidad.',
      price: 500,
      priceType: 'perUnit',
      images: ['/images/products/stickers.jpg'],
      categoryId: createdCategories['stickers'],
      isActive: true,
      canBuy: true,
      features: [
        { text: 'Variedad de diseños', order: 1 },
        { text: 'Precio por unidad', order: 2 },
      ],
    },
    {
      slug: 'rompe-cabezas',
      name: 'Rompe cabezas',
      shortDescription: 'Rompecabezas personalizado.',
      description: 'Rompecabezas personalizado. Puede utilizarse la imagen que el cliente desee.',
      price: 7000,
      priceType: 'fixed',
      images: ['/images/products/rompecabezas.jpg'],
      categoryId: createdCategories['juegos'],
      isCustomizable: true,
      isActive: true,
      canBuy: true,
      features: [
        { text: 'Personalizado', order: 1 },
        { text: 'Puede utilizarse la imagen que el cliente desee', order: 2 },
      ],
    },
    {
      slug: 'pizarras-borrables',
      name: 'Pizarras borrables',
      shortDescription: 'Pizarras con personaje y marcador.',
      description: 'Pizarras borrables que incluyen personaje deseado y marcador.',
      price: 7000,
      priceType: 'fixed',
      images: ['/images/products/pizarras.jpg'],
      categoryId: createdCategories['material-creativo'],
      isCustomizable: true,
      isActive: true,
      canBuy: true,
      features: [
        { text: 'Incluye personaje deseado', order: 1 },
        { text: 'Incluye marcador', order: 2 },
      ],
    },
    {
      slug: 'etiquetas-botellas-agua',
      name: 'Etiquetas para botellas de agua',
      shortDescription: 'Etiquetas personalizadas.',
      description: 'Etiquetas personalizadas para botellas de agua. Diseño personalizado. Precio por unidad.',
      price: 1000,
      priceType: 'perUnit',
      images: ['/images/products/etiquetas.jpg'],
      categoryId: createdCategories['personalizados'],
      isCustomizable: true,
      isActive: true,
      canBuy: true,
      features: [
        { text: 'Diseño personalizado', order: 1 },
        { text: 'Precio por unidad', order: 2 },
      ],
    },
  ]

  for (const prod of products) {
    const { features, ...productData } = prod
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        ...productData,
        features: {
          create: features || [],
        },
      },
    })
  }
  console.log('✅ Products created')

  // 4. Crear configuración del sitio
  await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      brandName: 'Papelillo',
      tagline: 'Papelería creativa',
      footerDescription: 'Ideas que se convierten en momentos especiales. Papelería creativa, detalles personalizados y pequeños mundos hechos en papel.',
      contactEmail: '',
      contactWhatsapp: '',
      contactWhatsappMsg: 'Hola, estoy interesado en un producto de Papelillo.',
      contactPhone: '',
      contactAddress: '',
      contactCity: '',
      contactHours: '',
      contactText: '',
      seoSiteName: 'Papelillo',
      seoSiteDescription: 'Papelería creativa, detalles personalizados y pequeños mundos hechos en papel.',
      seoSiteUrl: '',
      seoKeywords: ['papelería', 'creativa', 'invitaciones', 'personalizados', 'colombia'],
      logoSrc: '/images/logo.svg',
      faviconSrc: '/favicon.ico',
      wompiEnabled: false,
      wompiEnvironment: 'sandbox',
      socialLinks: {
        create: [
          { name: 'Instagram', url: '', icon: 'instagram', isActive: false, order: 1 },
          { name: 'Facebook', url: '', icon: 'facebook', isActive: false, order: 2 },
          { name: 'TikTok', url: '', icon: 'tiktok', isActive: false, order: 3 },
        ],
      },
    },
  })
  console.log('✅ Site settings created')

  console.log('\n✨ Seed completed successfully!')
  console.log('\n📝 Default credentials:')
  console.log('   Username: admin')
  console.log('   Password: papelillo2026')
  console.log('\n⚠️  Change the default password after first login!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
