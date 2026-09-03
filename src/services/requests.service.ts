// ============================================================
// REQUESTS SERVICE — gestiona las solicitudes de personalización.
// ============================================================

import type {
  CustomRequest,
  RequestStatus,
  AdminNote,
  CustomRequestCustomer,
  CustomRequestConfig,
} from "@/types/admin";
import { storage, attachmentKey } from "./storage";
import { emit } from "./events";
import { uid, nowISO } from "./ids";

const KEY = "requests";

export function getAllRequests(): CustomRequest[] {
  return storage
    .get<CustomRequest[]>(KEY, [])
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getRequestById(id: string): CustomRequest | undefined {
  return getAllRequests().find((r) => r.id === id);
}

function save(list: CustomRequest[]): void {
  storage.set<CustomRequest[]>(KEY, list);
  emit("requests");
}

export interface CreateRequestInput {
  customer: CustomRequestCustomer;
  config: CustomRequestConfig;
  estimatedPrice: number | null;
  estimatedPriceType: "fixed" | "from" | "quote";
  isOutOfCatalog: boolean;
  origin: "configurator" | "contact-form" | "product-page" | "whatsapp";
}

export function createRequest(input: CreateRequestInput): CustomRequest {
  const req: CustomRequest = {
    id: uid("req"),
    status: "new",
    origin: input.origin,
    customer: input.customer,
    config: input.config,
    estimatedPrice: input.estimatedPrice,
    estimatedPriceType: input.estimatedPriceType,
    isOutOfCatalog: input.isOutOfCatalog,
    notes: [],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  // Guardar attachments como data URLs en claves individuales
  if (input.config.attachments && input.config.attachments.length > 0) {
    for (const att of input.config.attachments) {
      if (att.dataUrl) {
        storage.set(attachmentKey(req.id, att.name), {
          name: att.name,
          type: att.type,
          size: att.size,
          dataUrl: att.dataUrl,
        });
      }
    }
  }

  const list = getAllRequests();
  list.unshift(req);
  save(list);
  return req;
}

export function updateRequestStatus(id: string, status: RequestStatus): CustomRequest | null {
  const list = getAllRequests();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], status, updatedAt: nowISO() };
  save(list);
  return list[idx];
}

export function addRequestNote(id: string, text: string): CustomRequest | null {
  const list = getAllRequests();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  const note: AdminNote = { id: uid("note"), text, createdAt: nowISO() };
  list[idx] = {
    ...list[idx],
    notes: [...list[idx].notes, note],
    updatedAt: nowISO(),
  };
  save(list);
  return list[idx];
}

export function deleteRequest(id: string): boolean {
  const list = getAllRequests();
  const next = list.filter((r) => r.id !== id);
  if (next.length === list.length) return false;
  save(next);
  return true;
}

export function getRequestAttachment(requestId: string, fileName: string) {
  return storage.get<{ name: string; type: string; size?: number; dataUrl?: string } | null>(
    attachmentKey(requestId, fileName),
    null
  );
}

export function getStats() {
  const all = getAllRequests();
  return {
    total: all.length,
    new: all.filter((r) => r.status === "new").length,
    review: all.filter((r) => r.status === "review").length,
    contacted: all.filter((r) => r.status === "contacted").length,
    quoted: all.filter((r) => r.status === "quoted").length,
    approved: all.filter((r) => r.status === "approved").length,
    completed: all.filter((r) => r.status === "completed").length,
    cancelled: all.filter((r) => r.status === "cancelled").length,
    outOfCatalog: all.filter((r) => r.isOutOfCatalog).length,
  };
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  new: "Nuevo",
  review: "En revisión",
  contacted: "Contactado",
  quoted: "Cotizado",
  approved: "Aprobado",
  completed: "Completado",
  cancelled: "Cancelado",
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
  new: "bg-brand-blue text-paper",
  review: "bg-brand-yellow text-ink",
  contacted: "bg-brand-green text-ink",
  quoted: "bg-brand-red text-paper",
  approved: "bg-brand-green text-paper",
  completed: "bg-ink text-paper",
  cancelled: "bg-ink/30 text-ink",
};
