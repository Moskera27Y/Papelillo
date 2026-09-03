"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminCard, AdminBadge, Select, Textarea, Toast } from "@/components/admin/AdminUI";
import { useRequests } from "@/hooks/useDataService";
import { requestsService } from "@/services";
import { STATUS_COLORS, STATUS_LABELS } from "@/services/requests.service";
import { formatCOP } from "@/lib/utils";
import type { CustomRequest, RequestStatus } from "@/types/admin";

const STATUS_OPTIONS: RequestStatus[] = [
  "new",
  "review",
  "contacted",
  "quoted",
  "approved",
  "completed",
  "cancelled",
];

function RequestDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { requests, isLoading } = useRequests();;
  const request = requests.find((r) => r.id === id);
  const [noteText, setNoteText] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  if (!request) {
    return (
      <div className="min-h-screen bg-paper-soft flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-2">Solicitud no encontrada</h2>
          <Link href="/admin/requests" className="text-brand-red underline">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusChange = (status: RequestStatus) => {
    requestsService.updateRequestStatus(request.id, status);
    setToast(`Estado actualizado a "${STATUS_LABELS[status]}".`);
    setTimeout(() => setToast(null), 2500);
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    requestsService.addRequestNote(request.id, noteText.trim());
    setNoteText("");
    setToast("Nota agregada.");
    setTimeout(() => setToast(null), 2500);
  };

  const buildWhatsAppMsg = () => {
    const lines: string[] = [];
    lines.push(`Hola ${request.customer.name || ""}, te escribo de Papelillo 👋`);
    lines.push("");
    lines.push(`Sobre tu solicitud de ${request.config.productName}:`);
    request.config.summary.forEach((s) => lines.push(`• ${s.label}: ${s.value}`));
    lines.push(`Cantidad: ${request.config.quantity}`);
    if (request.estimatedPrice !== null) {
      lines.push(`Precio estimado: ${formatCOP(request.estimatedPrice)} COP`);
    }
    lines.push("");
    lines.push("¿Podemos avanzar con los detalles?");
    return encodeURIComponent(lines.join("\n"));
  };

  const whatsappUrl = request.customer.whatsapp
    ? `https://wa.me/${request.customer.whatsapp.replace(/\D/g, "")}?text=${buildWhatsAppMsg()}`
    : null;

  return (
    <div className="min-h-screen bg-paper-soft">
      <div className="flex flex-col lg:flex-row">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <Link href="/admin/requests" className="text-sm text-ink-muted hover:text-ink mb-2 inline-block">
              ← Volver a solicitudes
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-ink">
                {request.customer.name || "Sin nombre"}
              </h1>
              {request.isOutOfCatalog && (
                <AdminBadge className="bg-brand-yellow text-ink">Fuera de catálogo</AdminBadge>
              )}
              <AdminBadge className={STATUS_COLORS[request.status as RequestStatus]}>
                {STATUS_LABELS[request.status as RequestStatus]}
              </AdminBadge>
            </div>
            <p className="text-ink-muted">
              ID: <code className="bg-paper-soft px-1.5 py-0.5 rounded text-xs">{request.id}</code>
              {" · "}Recibida: {new Date(request.createdAt).toLocaleString("es-CO")}
            </p>
          </header>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AdminCard title="Cliente">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-ink-muted">Nombre</dt>
                    <dd className="font-semibold">{request.customer.name || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">Email</dt>
                    <dd className="font-semibold">
                      {request.customer.email ? (
                        <a href={`mailto:${request.customer.email}`} className="text-brand-blue underline">
                          {request.customer.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">WhatsApp</dt>
                    <dd className="font-semibold">
                      {request.customer.whatsapp || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">Origen</dt>
                    <dd className="font-semibold">{request.origin}</dd>
                  </div>
                </dl>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 bg-brand-green text-ink font-bold rounded-full px-5 py-2.5 border-2 border-ink shadow-sticker-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    Contactar por WhatsApp
                  </a>
                )}
              </AdminCard>

              <AdminCard title="Lo que pidió">
                <div className="bg-paper-soft rounded-2xl border-2 border-ink/10 p-4 mb-4">
                  <p className="font-display text-xl font-bold mb-1">{request.config.productName}</p>
                  <p className="text-sm text-ink-muted">
                    Cantidad: <strong>{request.config.quantity}</strong>
                    {request.config.dueDate && (
                      <>
                        {" · "}Fecha deseada: <strong>{request.config.dueDate}</strong>
                      </>
                    )}
                  </p>
                </div>
                {request.config.summary.length > 0 && (
                  <dl className="divide-y divide-ink/10 text-sm">
                    {request.config.summary.map((s, i) => (
                      <div key={i} className="flex justify-between py-2 gap-4">
                        <dt className="text-ink-muted">{s.label}</dt>
                        <dd className="font-semibold text-right">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {request.estimatedPrice !== null && (
                  <div className="mt-4 bg-brand-yellow rounded-2xl border-2 border-ink p-4">
                    <p className="text-sm font-semibold">Precio estimado</p>
                    <p className="font-display text-2xl font-bold">
                      {formatCOP(request.estimatedPrice)} COP
                      {request.estimatedPriceType === "from" && " (desde)"}
                    </p>
                  </div>
                )}
                {request.estimatedPrice === null && request.estimatedPriceType === "quote" && (
                  <div className="mt-4 bg-paper-soft rounded-2xl border-2 border-ink/10 p-4 text-sm text-ink-muted">
                    Este producto requiere cotización personalizada.
                  </div>
                )}

                {request.config.attachments && request.config.attachments.length > 0 && (
                  <div className="mt-6">
                    <p className="font-semibold mb-2">Archivos adjuntos</p>
                    <ul className="space-y-2">
                      {request.config.attachments.map((att, i) => (
                        <li key={i}>
                          {att.dataUrl ? (
                            <a
                              href={att.dataUrl}
                              download={att.name}
                              className="inline-flex items-center gap-2 text-sm bg-paper-soft rounded-full px-4 py-1.5 border-2 border-ink"
                            >
                              📎 {att.name}
                              {att.size && (
                                <span className="text-ink-muted text-xs">
                                  ({Math.round(att.size / 1024)} KB)
                                </span>
                              )}
                            </a>
                          ) : (
                            <span className="text-sm">📎 {att.name}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </AdminCard>

              <AdminCard title="Notas internas">
                <div className="space-y-3 mb-4">
                  {request.notes.length === 0 && (
                    <p className="text-sm text-ink-muted">Sin notas todavía.</p>
                  )}
                  {request.notes.map((n) => (
                    <div
                      key={n.id}
                      className="bg-paper-soft rounded-2xl border-2 border-ink/10 p-3"
                    >
                      <p className="text-sm">{n.text}</p>
                      <p className="text-xs text-ink-muted mt-1">
                        {new Date(n.createdAt).toLocaleString("es-CO")}
                      </p>
                    </div>
                  ))}
                </div>
                <Textarea
                  placeholder="Agrega una nota sobre esta solicitud…"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={3}
                />
                <button
                  onClick={handleAddNote}
                  className="mt-3 bg-ink text-paper font-bold rounded-full px-5 py-2"
                >
                  Agregar nota
                </button>
              </AdminCard>
            </div>

            <div className="space-y-6">
              <AdminCard title="Cambiar estado">
                <Select
                  label="Nuevo estado"
                  value={request.status}
                  onChange={(e) => handleStatusChange(e.target.value as RequestStatus)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </AdminCard>

              <AdminCard title="Acciones rápidas">
                <div className="space-y-2">
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-brand-green text-ink font-bold rounded-full px-5 py-2.5 border-2 border-ink text-center shadow-sticker-sm"
                    >
                      Contactar por WhatsApp
                    </a>
                  )}
                  {request.customer.email && (
                    <a
                      href={`mailto:${request.customer.email}`}
                      className="block w-full bg-paper-soft text-ink font-bold rounded-full px-5 py-2.5 border-2 border-ink text-center"
                    >
                      Enviar email
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (!confirm("¿Marcar como completada?")) return;
                      handleStatusChange("completed");
                    }}
                    className="block w-full bg-ink text-paper font-bold rounded-full px-5 py-2.5 border-2 border-ink"
                  >
                    Marcar como completada
                  </button>
                </div>
              </AdminCard>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast type="success" message={toast} />}
    </div>
  );
}

export default function AdminRequestDetailPage() {
  return (
    <AuthGuard>
      <RequestDetailContent />
    </AuthGuard>
  );
}
