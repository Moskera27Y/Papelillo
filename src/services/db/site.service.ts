// src/services/db/site.service.ts
import { db } from '@/lib/db'
import type { SiteSettings, SocialLink } from '@prisma/client'

// 🔐 Tipo Wompi config (cliente-safe)
export interface WompiConfig {
  enabled: boolean
  publicKey: string
  environment: 'sandbox' | 'production'
  integrityKey?: string
  merchantName?: string
  webhookUrl?: string
}

export interface SiteSettingsWithSocial extends SiteSettings {
  socialLinks: SocialLink[]
  wompi?: WompiConfig
}

export async function getSiteSettings(): Promise<SiteSettingsWithSocial> {
  const settings = await db.siteSettings.findFirst({
    include: {
      socialLinks: { orderBy: { order: 'asc' } },
    },
  })

  if (!settings) {
    // Create default settings if none exist
    return db.siteSettings.create({
      data: {
        id: 'main',
        brandName: 'Papelillo',
        tagline: 'Papelería creativa',
      },
      include: {
        socialLinks: { orderBy: { order: 'asc' } },
      },
    })
  }

  return settings
}

/**
 * Sync fallback para cliente — usa localStorage o env vars (Vercel).
 * Evita promises en el render del widget Wompi.
 */
export function getSiteSettingsSync(): SiteSettingsWithSocial {
  // 1. Cache de sessionStorage (SSR-safe)
  if (typeof window !== 'undefined') {
    const cached = window.sessionStorage.getItem('papelillo_wompi_config');
    if (cached) {
      try { return JSON.parse(cached) as SiteSettingsWithSocial; } catch {}
    }
  }
  // 2. Fallback a env vars públicas (Vercel NEXT_PUBLIC_*)
  //    ⚠️ Solo publicKey/integrityKey en cliente, REST en server
  return {
    id: 'main',
    brandName: 'Papelillo',
    tagline: 'Papelería creativa',
    socialLinks: [],
    wompi: {
      enabled: true,
      publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || '',
      environment: (process.env.NEXT_PUBLIC_WOMPI_ENV || 'production') as 'sandbox' | 'production',
      integrityKey: process.env.NEXT_PUBLIC_WOMPI_INTEGRITY_KEY || '',
    },
  };
}

export async function updateSiteSettings(
  data: Partial<Omit<SiteSettings, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<SiteSettingsWithSocial> {
  const settings = await getSiteSettings()

  return db.siteSettings.update({
    where: { id: settings.id },
    data,
    include: {
      socialLinks: { orderBy: { order: 'asc' } },
    },
  })
}

export async function updateSocialLinks(
  links: Array<{
    id?: string
    name: string
    url: string
    icon: string
    isActive: boolean
    order: number
  }>
): Promise<SiteSettingsWithSocial> {
  const settings = await getSiteSettings()

  // Delete all existing social links
  await db.socialLink.deleteMany({ where: { settingsId: settings.id } })

  // Create new links
  await db.socialLink.createMany({
    data: links.map((link) => ({
      settingsId: settings.id,
      name: link.name,
      url: link.url,
      icon: link.icon,
      isActive: link.isActive,
      order: link.order,
    })),
  })

  return getSiteSettings()
}

export async function updateBranding(data: {
  logoSrc?: string
  logoDataUrl?: string
  faviconSrc?: string
}): Promise<SiteSettingsWithSocial> {
  return updateSiteSettings(data)
}

export async function updateWompiConfig(data: {
  enabled?: boolean
  environment?: 'sandbox' | 'production'
  publicKey?: string
  merchantName?: string
  webhookUrl?: string
}): Promise<SiteSettingsWithSocial> {
  return updateSiteSettings({
    wompiEnabled: data.enabled,
    wompiEnvironment: data.environment,
    wompiPublicKey: data.publicKey,
    wompiMerchantName: data.merchantName,
    wompiWebhookUrl: data.webhookUrl,
  })
}

// ============================================================
// EDITABLE CONTENT (Hero, About, etc.)
// ============================================================
export async function getSiteContent() {
  const content = await db.siteContent.findFirst()
  return content
}

export async function updateSiteContent(data: Record<string, any>) {
  const existing = await db.siteContent.findFirst()
  if (!existing) {
    return db.siteContent.create({ data: data as any })
  }
  return db.siteContent.update({
    where: { id: existing.id },
    data: data as any,
  })
}
