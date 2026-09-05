// ============================================================
// WOMPI SERVICE — Cliente para la pasarela de pagos Wompi.
// Utiliza el Widget Web oficial (carga dinámica del script).
// NO expone secretos en el frontend.
// ============================================================

import { getSiteSettingsSync } from "@/services/db/site.service";
import type { WompiConfig } from "@/services/db/site.service";

// ============================================================
// TYPES
// ============================================================

export interface WompiWidgetOptions {
  currency: "COP";
  amountInCents: number;
  reference: string;
  customerEmail: string;
  publicKey: string;
  redirectUrl?: string;
  signature?: {
    integrityKey: string;
  };
  /** Datos opcionales del cliente */
  customerData?: {
    phoneNumber?: string;
    phoneNumberCountryCode?: string;
    fullName?: string;
  };
  /** Datos del producto (opcional) */
  paymentMethod?: {
    type?: string;
    installments?: number;
  };
}

export interface WompiWidget {
  open(): void;
  close(): void;
  on(event: "open" | "closed" | "transaction" | "error", cb: (data: unknown) => void): void;
}

export interface WompiTransactionEvent {
  event: "transaction.processed" | string;
  data: {
    transaction: {
      id: string;
      status: "APPROVED" | "DECLINED" | "PENDING" | "ERROR" | "EXPIRED" | "VOIDED";
      reference: string;
      amount_in_cents: number;
      currency_code: string;
      payment_method_type: string;
      status_message?: string;
      customer_email?: string;
    };
  };
}

// ============================================================
// GLOBAL WINDOW EXTENSION
// ============================================================

declare global {
  interface Window {
    WidgetCheckout?: new (opts: WompiWidgetOptions) => WompiWidget;
    Wompi?: unknown;
  }
}

// ============================================================
// IMPLEMENTATION
// ============================================================

const WOMPI_SCRIPT_ID = "wompi-widget-script";

// 🔐 Cache de configuración Wompi (evita promesas en widget de checkout)
let _wompiConfig: WompiConfig | null = null;

/**
 * Obtiene la configuración pública de Wompi desde los settings.
 * Versión SYNC: usa getSiteSettingsSync() con fallback a env vars.
 */
export function getWompiConfig(): WompiConfig {
  if (_wompiConfig) return _wompiConfig;
  const settings = getSiteSettingsSync();
  // Cliente-safe env access (Vercel Edge: process.env puede no estar en runtime)
  if (typeof window !== "undefined") {
    const injected = (window as any).__PAPELILLO_WOMPI_CONFIG__;
    if (injected && injected.publicKey) {
      _wompiConfig = { enabled: true, publicKey: injected.publicKey, environment: injected.environment || "production", integrityKey: injected.integrityKey || "" };
      return _wompiConfig;
    }
  }
  _wompiConfig = settings.wompi ?? {
    enabled: true,
    publicKey: "",
    environment: "production",
    integrityKey: "",
  };
  return _wompiConfig;
}

/**
 * 🔁 Invalidate cache en servidor (después de mutations)
 */
export function clearWompiConfigCache(): void {
  _wompiConfig = null;
}

/**
 * Carga el script del Widget de Wompi de forma dinámica e idempotente.
 * Se elige el script de Sandbox o Producción según la configuración actual.
 */
export function loadWompiScript(environment: "sandbox" | "production"): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("window is not available"));
      return;
    }
    const existing = document.getElementById(WOMPI_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing && existing.dataset.env === environment) {
      resolve();
      return;
    }
    if (existing) {
      // Reemplazar si el entorno cambió
      existing.remove();
    }
    const script = document.createElement("script");
    script.id = WOMPI_SCRIPT_ID;
    script.dataset.env = environment;
    script.src =
      environment === "production"
        ? "https://checkout.wompi.co/widget.js"
        : "https://checkout.sandbox.wompi.co/widget.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Wompi"));
    document.body.appendChild(script);
  });
}

/**
 * Indica si Wompi está listo para usarse:
 * - Habilitado
 * - Llave pública configurada
 */
export function isWompiReady(): { ready: boolean; reasons: string[] } {
  const cfg = getWompiConfig();
  const reasons: string[] = [];
  if (!cfg.enabled) reasons.push("Wompi está deshabilitado");
  if (!cfg.publicKey) reasons.push("Falta la llave pública");
  return { ready: reasons.length === 0, reasons };
}

/**
 * Abre el widget de Wompi con los parámetros dados.
 * Devuelve una promesa que resuelve al evento de transacción.
 */
export function openWompiWidget(
  opts: Omit<WompiWidgetOptions, "publicKey">
): Promise<WompiTransactionEvent> {
  return new Promise(async (resolve, reject) => {
    const cfg = getWompiConfig();
    if (!cfg.enabled || !cfg.publicKey) {
      reject(new Error("Wompi no está configurado correctamente"));
      return;
    }

    try {
      await loadWompiScript(cfg.environment);
    } catch (err) {
      reject(err);
      return;
    }

    if (!window.WidgetCheckout) {
      reject(new Error("Wompi Widget no se cargó correctamente"));
      return;
    }

    const widget = new window.WidgetCheckout({
      ...opts,
      publicKey: cfg.publicKey,
      currency: "COP",
    });

    widget.on("transaction", (data) => {
      resolve(data as WompiTransactionEvent);
    });

    widget.on("error", (err) => {
      reject(err);
    });

    widget.on("closed", () => {
      reject(new Error("El usuario cerró el widget de Wompi"));
    });

    widget.open();
  });
}

/**
 * Formatea un valor COP a string sin decimales (Wompi requiere cents).
 */
export function toCents(amountInCOP: number): number {
  return Math.round(amountInCOP * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Formatea COP para mostrar (sin decimales, con punto como separador de miles).
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}