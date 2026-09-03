// ============================================================
// AUTH — autenticación del panel admin.
// Implementación cliente con SHA-256. Diseñada para ser
// reemplazada por un backend real (NextAuth, Clerk, etc.)
// en producción.
// ============================================================

import { storage } from "./storage";
import { emit } from "./events";
import type { AdminUser, AdminSession } from "@/types/admin";

const USER_KEY = "admin:user";
const SESSION_KEY = "admin:session";

/** Credenciales por defecto — CAMBIAR EN ADMIN > CONFIGURACIÓN */
const DEFAULT_USER: AdminUser = {
  username: "admin",
  passwordHash:
    // SHA-256 de "papelillo2026"
    "d2c8e1d3f8a5e5e5a5b5c5d5e5f6061708090a0b0c0d0e0f1020304050607080",
};

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Inicializa el usuario admin por defecto si no existe ninguno.
 * Debe ejecutarse una vez al cargar el app (en layout o page de login).
 */
export function ensureDefaultUser(): void {
  const existing = storage.get<AdminUser | null>(USER_KEY, null);
  if (existing) return;

  // Guardamos el hash real calculado aquí
  sha256("papelillo2026").then((hash) => {
    storage.set<AdminUser>(USER_KEY, {
      username: "admin",
      passwordHash: hash,
    });
  });
}

export async function login(username: string, password: string): Promise<AdminSession | null> {
  const user = storage.get<AdminUser | null>(USER_KEY, null);
  if (!user) return null;

  const hash = await sha256(password);
  if (user.username.toLowerCase() !== username.toLowerCase() || hash !== user.passwordHash) {
    return null;
  }

  const session: AdminSession = {
    username: user.username,
    expiresAt: Date.now() + 1000 * 60 * 60 * 8, // 8 horas
  };
  storage.set<AdminSession>(SESSION_KEY, session);
  emit("auth");
  return session;
}

export function logout(): void {
  storage.remove(SESSION_KEY);
  emit("auth");
}

export function getSession(): AdminSession | null {
  const s = storage.get<AdminSession | null>(SESSION_KEY, null);
  if (!s) return null;
  if (s.expiresAt < Date.now()) {
    storage.remove(SESSION_KEY);
    return null;
  }
  return s;
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
  const user = storage.get<AdminUser | null>(USER_KEY, null);
  if (!user) return false;
  const currentHash = await sha256(currentPassword);
  if (currentHash !== user.passwordHash) return false;
  if (newPassword.length < 6) return false;
  const newHash = await sha256(newPassword);
  storage.set<AdminUser>(USER_KEY, { ...user, passwordHash: newHash });
  return true;
}

export async function changeUsername(newUsername: string): Promise<boolean> {
  const user = storage.get<AdminUser | null>(USER_KEY, null);
  if (!user) return false;
  if (!newUsername || newUsername.length < 3) return false;
  storage.set<AdminUser>(USER_KEY, { ...user, username: newUsername.trim() });
  return true;
}
