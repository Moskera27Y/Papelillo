// src/services/db/categories.service.ts
import { db } from '@/lib/db'
import type { Category } from '@prisma/client'

export async function getCategories(): Promise<Category[]> {
  return db.category.findMany({
    orderBy: { order: 'asc' },
  })
}

export async function getActiveCategories(): Promise<Category[]> {
  return db.category.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return db.category.findUnique({ where: { id } })
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return db.category.findUnique({ where: { slug } })
}

export interface CreateCategoryInput {
  name: string
  slug: string
  description?: string
  image?: string
  color?: string
  order?: number
  isActive?: boolean
  metaTitle?: string
  metaDescription?: string
}

export async function createCategory(data: CreateCategoryInput): Promise<Category> {
  return db.category.create({ data })
}

export async function updateCategory(id: string, data: Partial<CreateCategoryInput>): Promise<Category> {
  return db.category.update({ where: { id }, data })
}

export async function deleteCategory(id: string): Promise<void> {
  await db.category.delete({ where: { id } })
}

export async function toggleCategoryActive(id: string): Promise<Category> {
  const category = await db.category.findUnique({ where: { id } })
  if (!category) throw new Error('Category not found')

  return db.category.update({
    where: { id },
    data: { isActive: !category.isActive },
  })
}
