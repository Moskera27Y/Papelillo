// src/services/db/auth.service.ts
import { db } from '@/lib/db'
import * as bcrypt from 'bcryptjs'
import type { AdminUser } from '@prisma/client'

export async function verifyCredentials(username: string, password: string): Promise<AdminUser | null> {
  const user = await db.adminUser.findUnique({ where: { username } })
  if (!user) return null

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) return null

  return user
}

export async function changePassword(userId: string, newPassword: string): Promise<AdminUser> {
  const passwordHash = await bcrypt.hash(newPassword, 10)
  return db.adminUser.update({
    where: { id: userId },
    data: { passwordHash },
  })
}

export async function changeUsername(userId: string, newUsername: string): Promise<AdminUser> {
  return db.adminUser.update({
    where: { id: userId },
    data: { username: newUsername },
  })
}

export async function getAdminUser(): Promise<AdminUser | null> {
  return db.adminUser.findFirst()
}
