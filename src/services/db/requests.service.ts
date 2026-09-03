// src/services/db/requests.service.ts
import { db } from '@/lib/db'
import type { CustomRequest, AdminNote } from '@prisma/client'

export interface RequestWithNotes extends CustomRequest {
  notes: AdminNote[]
}

export interface CreateRequestInput {
  status?: string
  origin?: string
  customer: {
    name: string
    email: string
    whatsapp: string
  }
  productId?: string
  productName: string
  config: any
  estimatedPrice?: number | null
  estimatedPriceType?: string
  isOutOfCatalog?: boolean
  quantity?: number
  dueDate?: string
  attachments?: any
}

export async function createRequest(data: CreateRequestInput): Promise<RequestWithNotes> {
  return db.customRequest.create({
    data: {
      status: data.status || 'new',
      origin: data.origin || 'configurator',
      customerName: data.customer.name,
      customerEmail: data.customer.email,
      customerWhatsapp: data.customer.whatsapp,
      productId: data.productId,
      productName: data.productName,
      config: data.config,
      estimatedPrice: data.estimatedPrice,
      estimatedPriceType: data.estimatedPriceType || 'quote',
      isOutOfCatalog: data.isOutOfCatalog || false,
      quantity: data.quantity || 1,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      attachments: data.attachments,
    },
    include: {
      notes: { orderBy: { createdAt: 'desc' } },
    },
  })
}

export async function getRequests(): Promise<RequestWithNotes[]> {
  return db.customRequest.findMany({
    include: {
      notes: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getRequestById(id: string): Promise<RequestWithNotes | null> {
  return db.customRequest.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: 'desc' } },
    },
  })
}

export async function updateRequestStatus(id: string, status: string): Promise<CustomRequest> {
  return db.customRequest.update({
    where: { id },
    data: { status },
  })
}

export async function addRequestNote(requestId: string, text: string): Promise<AdminNote> {
  return db.adminNote.create({
    data: {
      requestId,
      text,
    },
  })
}

export async function deleteRequest(id: string): Promise<void> {
  await db.customRequest.delete({ where: { id } })
}

export async function getRequestStats() {
  const [total, newRequests, review, contacted, quoted] = await Promise.all([
    db.customRequest.count(),
    db.customRequest.count({ where: { status: 'new' } }),
    db.customRequest.count({ where: { status: 'review' } }),
    db.customRequest.count({ where: { status: 'contacted' } }),
    db.customRequest.count({ where: { status: 'quoted' } }),
  ])

  return { total, newRequests, review, contacted, quoted }
}
