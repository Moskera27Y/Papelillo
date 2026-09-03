// src/services/db/site.service.ts
import { db } from '@/lib/db'
import type { SiteSettings, SocialLink } from '@prisma/client'

export interface SiteSettingsWithSocial extends SiteSettings {
  socialLinks: SocialLink[]
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
