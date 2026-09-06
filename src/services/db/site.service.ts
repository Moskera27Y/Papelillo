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
  footerDescription?: string | null
  socialLinks?: Array<{ name: string; url: string; icon: string; isActive: boolean; order: number }>
  wompi?: WompiConfig
  branding?: { logoSrc?: string | null; logoDataUrl?: string | null; faviconSrc?: string }
  contact?: { email?: string | null; whatsapp?: string | null; phone?: string | null; address?: string | null; city?: string | null; hours?: string | null; text?: string | null }
  seo?: {
    siteName: string
    siteDescription: string | null
    siteUrl: string | null
    ogImage: string | null
    keywords: string[]
  }
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
  const fallbackBrand = 'Papelillo';
  // 2. Fallback cliente-safe (NO process.env — Vercel Edge no polyfill cliente)
  return {
    id: 'main',
    brandName: fallbackBrand,
    tagline: 'Papelería creativa',
    footerDescription: 'Creaciones únicas hechas a mano.',
    socialLinks: [],
    wompi: {
      enabled: true,
      publicKey: '',
      environment: 'production' as 'sandbox' | 'production',
      integrityKey: '',
    },
    branding: { logoSrc: '/images/logo.svg', logoDataUrl: null, faviconSrc: '/favicon.ico' },
    contact: {},
    seo: {
      siteName: fallbackBrand,
      siteDescription: 'Papelería creativa — productos únicos hechos a mano.',
      siteUrl: '',
      ogImage: '',
      keywords: [],
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
      footerDescription: 'Creaciones únicas hechas a mano.',
      socialLinks: [],
      wompi: { enabled: false, publicKey: '', environment: 'production', integrityKey: '' },
      branding: { logoSrc: '/images/logo.svg', logoDataUrl: null, faviconSrc: '/favicon.ico' },
      contact: {},
      seo: { siteName: 'Papelillo', siteDescription: 'Papelería creativa — productos únicos hechos a mano.', siteUrl: '', ogImage: '', keywords: [] },
    };
  }
  // Safely map Prisma fields (some may be null/undefined in DB)
  const safeSettings = settings as any;
  return {
    id: safeSettings.id,
    brandName: safeSettings.brandName ?? 'Papelillo',
    tagline: safeSettings.tagline ?? 'Papelería creativa',
    footerDescription: safeSettings.footerDescription,
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
      logoSrc: safeSettings.logoSrc ?? '/images/logo.svg',
      logoDataUrl: safeSettings.logoDataUrl ?? null,
      faviconSrc: safeSettings.faviconSrc ?? '/favicon.ico',
    },
    contact: {
      email: safeSettings.contactEmail,
      whatsapp: safeSettings.contactWhatsapp,
      phone: safeSettings.contactPhone,
      address: safeSettings.contactAddress,
      city: safeSettings.contactCity,
      hours: safeSettings.contactHours,
      text: safeSettings.contactText,
    },
    seo: {
      siteName: safeSettings.seoSiteName ?? safeSettings.brandName ?? 'Papelillo',
      siteDescription: safeSettings.seoSiteDescription,
      siteUrl: safeSettings.seoSiteUrl,
      ogImage: safeSettings.seoOgImage,
      keywords: safeSettings.seoKeywords ?? [],
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
