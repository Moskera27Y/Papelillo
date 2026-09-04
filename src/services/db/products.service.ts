// src/services/db/products.service.ts
// Servicio de productos usando Prisma PostgreSQL

import { db } from '@/lib/db'
import type { Product, ProductFeature, ProductOption, ProductOptionValue, CustomField } from '@prisma/client'

export interface ProductWithRelations extends Product {
  features: ProductFeature[]
  options: (ProductOption & { values: ProductOptionValue[] })[]
  customFields: CustomField[]
  category?: { id: string; name: string; slug: string; color: string } | null
}

export interface CreateProductInput {
  slug: string
  name: string
  shortDescription?: string
  description?: string
  price?: number | null
  compareAtPrice?: number | null
  priceType: 'fixed' | 'from' | 'perUnit' | 'quote'
  currency?: string
  images: string[]
  tags?: string[]
  stock?: number | null
  featured?: boolean
  isNew?: boolean
  isPopular?: boolean
  isCustomizable?: boolean
  requiresQuote?: boolean
  isActive?: boolean
  ctaLabel?: string
  canBuy?: boolean
  shippingCost?: number
  weight?: number
  height?: number
  width?: number
  depth?: number
  unit?: string
  approximate?: boolean
  categoryId?: string | null
  features?: Array<{ text: string; order: number }>
  options?: Array<{
    name: string
    label: string
    type: string
    required?: boolean
    order?: number
    isActive?: boolean
    options?: string[]
    allowOther?: boolean
    placeholder?: string
    defaultValue?: string
    min?: number
    max?: number
    accept?: string
    values?: Array<{
      label: string
      value: string
      priceAdjustment?: number
      isAvailable?: boolean
      order?: number
    }>
  }>
  customFields?: Array<{
    label: string
    name: string
    type: string
    required?: boolean
    placeholder?: string
    hint?: string
    options?: string[]
    order?: number
  }>
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: string
  category?: string
  categoryId?: string | null
}

// ============================================================
// GET PRODUCTS
// ============================================================

export async function getProducts(): Promise<ProductWithRelations[]> {
  return db.product.findMany({
    include: {
      features: { orderBy: { order: 'asc' } },
      options: {
        include: { values: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
      customFields: { orderBy: { order: 'asc' } },
      category: { select: { id: true, name: true, slug: true, color: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getActiveProducts(): Promise<ProductWithRelations[]> {
  return db.product.findMany({
    where: { isActive: true },
    include: {
      features: { orderBy: { order: 'asc' } },
      options: {
        include: { values: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
      customFields: { orderBy: { order: 'asc' } },
      category: { select: { id: true, name: true, slug: true, color: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  return db.product.findUnique({
    where: { slug },
    include: {
      features: { orderBy: { order: 'asc' } },
      options: {
        include: { values: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
      customFields: { orderBy: { order: 'asc' } },
      category: { select: { id: true, name: true, slug: true, color: true } },
    },
  })
}

export async function getProductById(id: string): Promise<ProductWithRelations | null> {
  return db.product.findUnique({
    where: { id },
    include: {
      features: { orderBy: { order: 'asc' } },
      options: {
        include: { values: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
      customFields: { orderBy: { order: 'asc' } },
      category: { select: { id: true, name: true, slug: true, color: true } },
    },
  })
}

export async function getFeaturedProducts(): Promise<ProductWithRelations[]> {
  return db.product.findMany({
    where: { isActive: true, featured: true },
    include: {
      features: { orderBy: { order: 'asc' } },
      options: {
        include: { values: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
      customFields: { orderBy: { order: 'asc' } },
      category: { select: { id: true, name: true, slug: true, color: true } },
    },
    take: 8,
  })
}

// 🔁 Normaliza features {name} → {text} para el editor + mantiene name para Prisma
export function normalizeDBProduct(product: ProductWithRelations): ProductWithRelations {
  if (!product) return product;
  return {
    ...product,
    features: (product.features ?? []).map((f: any) => ({
      ...f,
      text: (f as any).name ?? (f as any).text ?? "",
      name: (f as any).name ?? (f as any).text ?? "",
    })),
  };
}

// 🔧 Mapea editor format ({text}) → Prisma format ({name}) antes del update/create
export function normalizeProductForPrisma(data: Partial<UpdateProductInput>): Record<string, any> {
  const { category, categoryName, features, options, customFields, ...rest } = data;
  return {
    ...rest,
    features: Array.isArray(features)
      ? { create: features.map((f: any, i: number) => ({ name: f.name ?? f.text ?? "", order: f.order ?? i })) }
      : undefined,
    options: Array.isArray(options)
      ? { create: options.map((o: any) => ({ ...o, values: o.values ? { create: o.values } : undefined })) }
      : undefined,
    customFields: Array.isArray(customFields) ? { create: customFields } : undefined,
  };
}

export async function getProductsByCategory(categorySlug: string): Promise<ProductWithRelations[]> {
  return db.product.findMany({
    where: {
      isActive: true,
      category: { slug: categorySlug },
    },
    include: {
      features: { orderBy: { order: 'asc' } },
      options: {
        include: { values: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
      customFields: { orderBy: { order: 'asc' } },
      category: { select: { id: true, name: true, slug: true, color: true } },
    },
  })
}

// ============================================================
// CREATE PRODUCT
// ============================================================

export async function createProduct(data: CreateProductInput): Promise<ProductWithRelations> {
  const { features, options, customFields, ...productData } = data

  const product = await db.product.create({
    data: {
      ...productData,
      price: data.price ?? null,
      compareAtPrice: data.compareAtPrice ?? null,
      stock: data.stock ?? null,
      categoryId: data.categoryId ?? null,
      features: {
        create: features || [],
      },
      options: {
        create: options?.map((opt) => ({
          ...opt,
          values: {
            create: opt.values || [],
          },
        })) || [],
      },
      customFields: {
        create: customFields || [],
      },
    },
    include: {
      features: { orderBy: { order: 'asc' } },
      options: {
        include: { values: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
      customFields: { orderBy: { order: 'asc' } },
      category: { select: { id: true, name: true, slug: true, color: true } },
    },
  })

  return product
}

// ============================================================
// UPDATE PRODUCT
// ============================================================

// ============================================================
// UPDATE PRODUCT
// ============================================================

export async function updateProduct(data: UpdateProductInput): Promise<ProductWithRelations> {
  const { id, features, options, customFields, category, categoryName, ...productData } = data;

  // Delete existing relations
  await db.productFeature.deleteMany({ where: { productId: id } });
  await db.productOptionValue.deleteMany({ where: { option: { productId: id } } });
  await db.productOption.deleteMany({ where: { productId: id } });
  await db.customField.deleteMany({ where: { productId: id } });

  // Normaliza features/options/customFields a formato Prisma ({name} no {text})
  const normalized = normalizeProductForPrisma({ ...productData, features, options, customFields });

  const product = await db.product.update({
    where: { id },
    data: {
      ...normalized,
      price: data.price ?? null,
      compareAtPrice: data.compareAtPrice ?? null,
      stock: data.stock ?? null,
      categoryId: data.categoryId ?? null,
      features: normalized.features ?? { create: [] },
      options: normalized.options ?? { create: [] },
      customFields: normalized.customFields ?? { create: [] },
    },
    include: {
      features: { orderBy: { order: 'asc' } },
      options: {
        include: { values: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
      customFields: { orderBy: { order: 'asc' } },
      category: { select: { id: true, name: true, slug: true, color: true } },
    },
  });

  return product;
}

// ============================================================
// DELETE PRODUCT
// ============================================================

export async function deleteProduct(id: string): Promise<void> {
  await db.product.delete({ where: { id } });
}

// ============================================================
// TOGGLE PRODUCT STATUS
// ============================================================

export async function toggleProductActive(id: string): Promise<Product> {
  const product = await db.product.findUnique({ where: { id } })
  if (!product) throw new Error('Product not found')

  return db.product.update({
    where: { id },
    data: { isActive: !product.isActive },
  })
}

export async function duplicateProduct(id: string): Promise<ProductWithRelations> {
  const original = await getProductById(id)
  if (!original) throw new Error('Product not found')

  const newSlug = `${original.slug}-copy-${Date.now()}`

  return createProduct({
    slug: newSlug,
    name: `${original.name} (copia)`,
    shortDescription: original.shortDescription ?? undefined,
    description: original.description ?? undefined,
    price: original.price,
    compareAtPrice: original.compareAtPrice,
    priceType: original.priceType as 'fixed' | 'from' | 'perUnit' | 'quote',
    currency: original.currency,
    images: original.images,
    tags: original.tags,
    stock: original.stock,
    featured: original.featured,
    isNew: original.isNew,
    isPopular: original.isPopular,
    isCustomizable: original.isCustomizable,
    requiresQuote: original.requiresQuote,
    isActive: false,
    ctaLabel: original.ctaLabel ?? undefined,
    canBuy: original.canBuy,
    shippingCost: original.shippingCost ?? undefined,
    weight: original.weight ?? undefined,
    height: original.height ?? undefined,
    width: original.width ?? undefined,
    depth: original.depth ?? undefined,
    unit: original.unit ?? undefined,
    approximate: original.approximate,
    categoryId: original.categoryId,
    features: original.features.map((f) => ({ text: f.text, order: f.order })),
    options: original.options.map((opt) => ({
      name: opt.name,
      label: opt.label,
      type: opt.type,
      required: opt.required,
      order: opt.order,
      isActive: opt.isActive,
      options: opt.options,
      allowOther: opt.allowOther,
      placeholder: opt.placeholder ?? undefined,
      defaultValue: opt.defaultValue ?? undefined,
      min: opt.min ?? undefined,
      max: opt.max ?? undefined,
      accept: opt.accept ?? undefined,
      values: opt.values.map((v) => ({
        label: v.label,
        value: v.value,
        priceAdjustment: v.priceAdjustment ?? undefined,
        isAvailable: v.isAvailable,
        order: v.order,
      })),
    })),
    customFields: original.customFields.map((cf) => ({
      label: cf.label,
      name: cf.name,
      type: cf.type,
      required: cf.required,
      placeholder: cf.placeholder ?? undefined,
      hint: cf.hint ?? undefined,
      options: cf.options,
      order: cf.order,
    })),
  })
}

// ============================================================
// STATISTICS
// ============================================================

export async function getProductStats() {
  const [total, active, outOfStock, customizable] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { isActive: true } }),
    db.product.count({ where: { isActive: true, stock: { lte: 0 } } }),
    db.product.count({ where: { isActive: true, isCustomizable: true } }),
  ])

  return { total, active, outOfStock, customizable }
}
