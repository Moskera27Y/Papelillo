// ============================================================
// WOMPI SERVICE — Cliente para la pasarela de pagos Wompi.
// Utiliza el Widget Web oficial (carga dinámica del script).
// NO expone secretos en el frontend.
// ============================================================

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

// ============================================================
// IMPLEMENTATION
// ============================================================

const WOMPI_SCRIPT_ID = "wompi-widget-script";

/**
 * Carga el script del Widget de Wompi de forma dinámica e idempotente.
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
 * Indica si Wompi está listo recibiendo la config como parámetro (no cache global).
 */
export function isWompiReady(cfg?: WompiConfig): { ready: boolean; reasons: string[] } {
  if (!cfg) {
    return { ready: false, reasons: ["No se recibió configuración de Wompi"] };
  }
  const reasons: string[] = [];
  if (!cfg.enabled) reasons.push("Wompi está deshabilitado");
  if (!cfg.publicKey) reasons.push("Falta la llave pública");
  return { ready: reasons.length === 0, reasons };
}

/**
 * Abre el widget de Wompi con los parámetros dados.
 * Recibe publicKey/environment/integrityKey como parte de opts (no desde cache global).
 */
export function openWompiWidget(
  opts: Omit<WompiWidgetOptions, "publicKey"> & {
    config: Pick<WompiConfig, "enabled" | "publicKey" | "environment" | "integrityKey">;
  }
): Promise<WompiTransactionEvent> {
  const cfg = opts.config;
  if (!cfg.enabled || !cfg.publicKey) {
    return Promise.reject(new Error("Wompi no está configurado correctamente"));
  }

  const { config: _cfg, ...rest } = opts;
  void _cfg; // publicKey se pasa explícitamente desde checkout, no expuesto en logs

  return new Promise(async (resolve, reject) => {
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
      ...rest,
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

/** Formatea COP */
export function toCents(amountInCOP: number): number {
  return Math.round(amountInCOP * 100);
}
export function fromCents(cents: number): number {
  return cents / 100;
}
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}