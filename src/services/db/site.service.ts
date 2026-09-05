// src/services/db/site.service.ts — browser-safe (no Prisma in client bundle)
// 🔐 Wompi config type (browser-safe, no Prisma dependency)
export interface WompiConfig {
  enabled: boolean
  publicKey: string
  environment: 'sandbox' | 'production'
  integrityKey?: string
  merchantName?: string
  webhookUrl?: string
}

export interface SiteSettingsClient {
  id: string
  brandName: string
  tagline: string
  socialLinks?: Array<{ name: string; url: string; icon: string; isActive: boolean; order: number }>
  wompi?: WompiConfig
  branding?: { logoSrc?: string; logoDataUrl?: string | null; faviconSrc?: string }
}

// ============================================================
// CLIENTE-SAFE SYNC — used by wompi.service.ts in browser
// ✅ NO Prisma/Neón imports here (browser bundle can't load @prisma/client Edge runtime)
// ============================================================
export function getSiteSettingsSync(): SiteSettingsClient {
  // 1. Cache de sessionStorage (SSR-safe — only reads in client)
  if (typeof window !== 'undefined') {
    const cached = window.sessionStorage.getItem('papelillo_wompi_config');
    if (cached) {
      try { return JSON.parse(cached) as SiteSettingsClient; } catch {}
    }
  }
  // 2. Fallback cliente-safe (NO process.env — Vercel Edge no polyfill cliente)
  return {
    id: 'main',
    brandName: 'Papelillo',
    tagline: 'Papelería creativa',
    socialLinks: [],
    wompi: {
      enabled: true,
      publicKey: '',
      environment: 'production' as 'sandbox' | 'production',
      integrityKey: '',
    },
  };
}

// ============================================================
// SERVER-ONLY — importa Prisma DENTRO (no en module scope cliente)
// Usar getSiteSettingsServer() dentro de server actions / API routes
// ============================================================
export async function getSiteSettingsServer(): Promise<SiteSettingsClient> {
  const { db } = await import('@/lib/db');
  const settings = await db.siteSettings.findFirst({
    include: { socialLinks: { orderBy: { order: 'asc' } } },
  });
  if (!settings) {
    return {
      id: 'main',
      brandName: 'Papelillo',
      tagline: 'Papelería creativa',
      socialLinks: [],
      wompi: { enabled: false, publicKey: '', environment: 'production', integrityKey: '' },
    };
  }
  // Safely map Prisma fields (some may be null/undefined in DB)
  const safeSettings = settings as any;
  return {
    id: safeSettings.id,
    brandName: safeSettings.brandName ?? 'Papelillo',
    tagline: safeSettings.tagline ?? 'Papelería creativa',
    socialLinks: safeSettings.socialLinks ?? [],
    wompi: {
      enabled: safeSettings.wompiEnabled ?? false,
      publicKey: safeSettings.wompiPublicKey ?? '',
      environment: (safeSettings.wompiEnvironment ?? 'production') as 'sandbox' | 'production',
      integrityKey: safeSettings.wompiIntegrityKey ?? '',
      merchantName: safeSettings.wompiMerchantName ?? undefined,
      webhookUrl: safeSettings.wompiWebhookUrl ?? undefined,
    },
    branding: {
      logoSrc: safeSettings.logoSrc ?? undefined,
      logoDataUrl: safeSettings.logoDataUrl ?? null,
      faviconSrc: safeSettings.faviconSrc ?? undefined,
    },
  } as SiteSettingsClient;
}

// Backward-compat alias for server actions that still call getSiteSettings()
export async function getSiteSettings() {
  return getSiteSettingsServer();
}

// SERVER-ONLY update functions (lazy-import Prisma inside body)
export async function updateSiteSettings(data: Record<string, any>) {
  const { db } = await import('@/lib/db');
  const settings = await db.siteSettings.findFirst();
  if (!settings) return db.siteSettings.create({ data: { id: 'main', ...data } });
  return db.siteSettings.update({ where: { id: settings.id }, data });
}

export async function updateSiteContent(data: Record<string, any>) {
  const { db } = await import('@/lib/db');
  const existing = await db.siteContent.findFirst();
  if (!existing) return db.siteContent.create({ data: data as any });
  return db.siteContent.update({ where: { id: existing.id }, data: data as any });
}

export async function getSiteContent() {
  const { db } = await import('@/lib/db');
  return db.siteContent.findFirst();
}

// Re-export for legacy callers
export async function updateSocialLinks(links: Array<{ name: string; url: string; icon: string; isActive: boolean; order: number }>) {
  const { db } = await import('@/lib/db');
  const settings = await db.siteSettings.findFirst();
  if (!settings) {
    return db.siteSettings.create({ data: { id: 'main', socialLinks: { create: links } } });
  }
  await db.socialLink.deleteMany({ where: { settingsId: settings.id } });
  await db.socialLink.createMany({ data: links.map(l => ({ settingsId: settings.id, ...l })) });
  return getSiteSettingsServer();
}

export async function updateBranding(data: { logoSrc?: string; logoDataUrl?: string; faviconSrc?: string }) {
  return updateSiteSettings(data);
}

export async function updateWompiConfig(data: { enabled?: boolean; environment?: 'sandbox' | 'production'; publicKey?: string; merchantName?: string; webhookUrl?: string }) {
  return updateSiteSettings({
    wompiEnabled: data.enabled,
    wompiEnvironment: data.environment,
    wompiPublicKey: data.publicKey,
    wompiMerchantName: data.merchantName,
    wompiWebhookUrl: data.webhookUrl,
  });
}
