// ============================================================
// IDS — generador de IDs único sin dependencias externas.
// ============================================================

export function uid(prefix = ""): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? (crypto as Crypto).randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return prefix ? `${prefix}_${rnd}` : rnd;
}

export function nowISO(): string {
  return new Date().toISOString();
}
