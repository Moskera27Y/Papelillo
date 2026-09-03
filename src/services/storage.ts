// ============================================================
// STORAGE — capa de abstracción sobre localStorage, SSR-safe.
// ============================================================

const PREFIX = "papelillo-v2:";

export const storage = {
  isAvailable(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const k = "__probe__";
      window.localStorage.setItem(k, "1");
      window.localStorage.removeItem(k);
      return true;
    } catch {
      return false;
    }
  },

  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // ignore (cuota, etc.)
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch {
      // ignore
    }
  },
};

/**
 * Clave única para archivos binarios (imágenes de referencia).
 * Los guardamos como data URLs en localStorage bajo este sufijo.
 */
export function attachmentKey(requestId: string, fileName: string): string {
  return `att:${requestId}:${fileName}`;
}
