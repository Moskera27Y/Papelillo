// ============================================================
// MESSAGES SERVICE — mensajes del formulario de contacto.
// ============================================================

import type { ContactMessage } from "@/types/admin";
import { storage } from "./storage";
import { emit } from "./events";
import { uid, nowISO } from "./ids";

const KEY = "contact-messages";

export function getAllMessages(): ContactMessage[] {
  return storage
    .get<ContactMessage[]>(KEY, [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function save(list: ContactMessage[]): void {
  storage.set<ContactMessage[]>(KEY, list);
  emit("messages");
}

export function createMessage(
  data: Omit<ContactMessage, "id" | "status" | "createdAt">
): ContactMessage {
  const msg: ContactMessage = {
    ...data,
    id: uid("msg"),
    status: "new",
    createdAt: nowISO(),
  };
  const list = getAllMessages();
  list.unshift(msg);
  save(list);
  return msg;
}

export function markAsRead(id: string): ContactMessage | null {
  const list = getAllMessages();
  const idx = list.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], status: "read" };
  save(list);
  return list[idx];
}

export function deleteMessage(id: string): boolean {
  const list = getAllMessages();
  const next = list.filter((m) => m.id !== id);
  if (next.length === list.length) return false;
  save(next);
  return true;
}
