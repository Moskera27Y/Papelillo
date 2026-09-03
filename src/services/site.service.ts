// ============================================================
// SITE SERVICE — contenido editable y configuración del sitio.
// ============================================================

import type { SiteContentEditable, SiteSettings, SocialLink } from "@/types/admin";
import { storage } from "./storage";
import { emit } from "./events";
import { uid } from "./ids";
import { siteContent as seedContent } from "@/data/site-content";
import { siteConfig } from "@/lib/config";

const CONTENT_KEY = "site-content";
const SETTINGS_KEY = "site-settings";

function seedSiteContent(): SiteContentEditable {
  return {
    brandName: seedContent.brandName,
    tagline: seedContent.tagline,
    hero: { ...seedContent.hero },
    customHighlight: { ...seedContent.customHighlight },
    about: { ...seedContent.about },
    personalized: { ...seedContent.personalized },
    ctaFinal: { ...seedContent.ctaFinal },
    footerDescription: seedContent.footerDescription,
  };
}

function seedSiteSettings(): SiteSettings {
  const social: SocialLink[] = [
    { id: uid("soc"), name: "WhatsApp", url: siteConfig.whatsappNumber, icon: "whatsapp", isActive: !!siteConfig.whatsappNumber, order: 1 },
    { id: uid("soc"), name: "Instagram", url: siteConfig.instagramUrl, icon: "instagram", isActive: !!siteConfig.instagramUrl, order: 2 },
    { id: uid("soc"), name: "Facebook", url: siteConfig.facebookUrl, icon: "facebook", isActive: !!siteConfig.facebookUrl, order: 3 },
    { id: uid("soc"), name: "TikTok", url: siteConfig.tiktokUrl, icon: "tiktok", isActive: !!siteConfig.tiktokUrl, order: 4 },
  ];

  return {
    contact: {
      email: siteConfig.email,
      whatsapp: siteConfig.whatsappNumber,
      whatsappDefaultMessage: siteConfig.whatsappDefaultMessage,
      address: siteConfig.address,
      hours: siteConfig.hours,
    },
    social,
    seo: {
      siteName: siteConfig.siteName,
      siteDescription: siteConfig.siteDescription,
      siteUrl: siteConfig.siteUrl,
    },
    branding: {
      logoSrc: siteConfig.logoSrc,
      faviconSrc: siteConfig.faviconSrc,
    },
    wompi: {
      enabled: false,
      environment: (process.env.NEXT_PUBLIC_WOMPI_ENVIRONMENT as "sandbox" | "production") || "sandbox",
      publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "",
      merchantName: "Papelillo",
      currency: "COP",
      hasServerSecrets:
        !!process.env.WOMPI_PRIVATE_KEY &&
        !!process.env.WOMPI_INTEGRITY_KEY &&
        !!process.env.WOMPI_EVENTS_SECRET,
    },
  };
}

// ---------- CONTENIDO ----------

export function loadSiteContent(): SiteContentEditable {
  const existing = storage.get<SiteContentEditable | null>(CONTENT_KEY, null);
  if (existing) return existing;
  const seed = seedSiteContent();
  storage.set<SiteContentEditable>(CONTENT_KEY, seed);
  return seed;
}

export function getSiteContent(): SiteContentEditable {
  return loadSiteContent();
}

export function updateSiteContent(patch: Partial<SiteContentEditable>): SiteContentEditable {
  const current = getSiteContent();
  const merged: SiteContentEditable = {
    ...current,
    ...patch,
    hero: { ...current.hero, ...(patch.hero || {}) },
    customHighlight: { ...current.customHighlight, ...(patch.customHighlight || {}) },
    about: { ...current.about, ...(patch.about || {}), values: patch.about?.values ?? current.about.values },
    personalized: { ...current.personalized, ...(patch.personalized || {}) },
    ctaFinal: { ...current.ctaFinal, ...(patch.ctaFinal || {}) },
  };
  storage.set<SiteContentEditable>(CONTENT_KEY, merged);
  emit("site-content");
  return merged;
}

// ---------- SETTINGS ----------

export function loadSiteSettings(): SiteSettings {
  const existing = storage.get<SiteSettings | null>(SETTINGS_KEY, null);
  if (existing) return existing;
  const seed = seedSiteSettings();
  storage.set<SiteSettings>(SETTINGS_KEY, seed);
  return seed;
}

export function getSiteSettings(): SiteSettings {
  return loadSiteSettings();
}

export function updateSiteSettings(patch: Partial<SiteSettings>): SiteSettings {
  const current = getSiteSettings();
  const merged: SiteSettings = {
    ...current,
    contact: { ...current.contact, ...(patch.contact || {}) },
    social: patch.social ?? current.social,
    seo: { ...current.seo, ...(patch.seo || {}) },
    branding: { ...current.branding, ...(patch.branding || {}) },
  };
  storage.set<SiteSettings>(SETTINGS_KEY, merged);
  emit("settings");
  return merged;
}

// ---------- SOCIAL HELPERS ----------

export function addSocialLink(link: Omit<SocialLink, "id">): SocialLink {
  const s = getSiteSettings();
  const newLink: SocialLink = { ...link, id: uid("soc") };
  const next = [...s.social, newLink].sort((a, b) => a.order - b.order);
  updateSiteSettings({ social: next });
  return newLink;
}

export function updateSocialLink(id: string, patch: Partial<SocialLink>): void {
  const s = getSiteSettings();
  const next = s.social.map((l) => (l.id === id ? { ...l, ...patch } : l));
  updateSiteSettings({ social: next });
}

export function deleteSocialLink(id: string): void {
  const s = getSiteSettings();
  updateSiteSettings({ social: s.social.filter((l) => l.id !== id) });
}

export function getActiveSocialLinks(): SocialLink[] {
  return getSiteSettings().social.filter((l) => l.isActive && l.url);
}

// ---------- ABOUT VALUES HELPERS ----------

export function addAboutValue(value: Omit<SiteContentEditable["about"]["values"][number], "id">): void {
  const content = getSiteContent();
  updateSiteContent({
    about: {
      ...content.about,
      values: [...content.about.values, { ...value, id: uid("val") }],
    },
  });
}

export function removeAboutValue(index: number): void {
  const content = getSiteContent();
  const values = [...content.about.values];
  values.splice(index, 1);
  updateSiteContent({ about: { ...content.about, values } });
}
