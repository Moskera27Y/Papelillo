// src/services/db/messages.service.ts
import { db } from '@/lib/db'
import type { ContactMessage } from '@prisma/client'

export interface CreateMessageInput {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export async function createMessage(data: CreateMessageInput): Promise<ContactMessage> {
  return db.contactMessage.create({ data })
}

export async function getMessages(): Promise<ContactMessage[]> {
  return db.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export async function getMessageById(id: string): Promise<ContactMessage | null> {
  return db.contactMessage.findUnique({ where: { id } })
}

export async function updateMessageStatus(id: string, status: string): Promise<ContactMessage> {
  return db.contactMessage.update({
    where: { id },
    data: { status },
  })
}

export async function deleteMessage(id: string): Promise<void> {
  await db.contactMessage.delete({ where: { id } })
}

export async function getMessageStats() {
  const [total, unread] = await Promise.all([
    db.contactMessage.count(),
    db.contactMessage.count({ where: { status: 'new' } }),
  ])

  return { total, unread }
}
