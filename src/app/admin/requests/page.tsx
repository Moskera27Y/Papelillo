"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminCard, AdminBadge, Select, EmptyState, Toast } from "@/components/admin/AdminUI";
import { useRequests } from "@/hooks/useDataService";
import { requestsService } from "@/services";
import { STATUS_COLORS, STATUS_LABELS } from "@/services/requests.service";
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

function RequestsContent() {
  const { requests, isLoading } = useRequests();;
  const [filter, setFilter] = useState<RequestStatus | "all">("all");
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return requests;
    return requests.filter((r) => r.status === filter);
  }, [requests, filter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: requests.length };
    STATUS_OPTIONS.forEach((s) => {
      map[s] = requests.filter((r) => r.status === s).length;
    });
    return map;
  }, [requests]);

  const handleDelete = (r: CustomRequest) => {
    if (!confirm(`¿Eliminar la solicitud de ${r.customer.name || "este cliente"}?`)) return;
    requestsService.deleteRequest(r.id);
    setToast("Solicitud eliminada.");
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="min-h-screen bg-paper-soft">
      <div className="flex flex-col lg:flex-row">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-2">
              Solicitudes
            </h1>
            <p className="text-ink-muted">
              Todas las ideas personalizadas que han llegado desde el configurador.
            </p>
          </header>

          <AdminCard>
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilter("all")}
                className={`text-sm font-bold rounded-full px-4 py-1.5 border-2 border-ink transition-colors ${
                  filter === "all" ? "bg-ink text-paper" : "bg-paper hover:bg-paper-soft"
                }`}
              >
                Todas ({counts.all})
              </button>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`text-sm font-bold rounded-full px-4 py-1.5 border-2 border-ink transition-colors ${
                    filter === s ? STATUS_COLORS[s] : "bg-paper hover:bg-paper-soft"
                  }`}
                >
                  {STATUS_LABELS[s]} ({counts[s]})
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title="Sin solicitudes"
                description="Aún no has recibido solicitudes para este filtro."
              />
            ) : (
              <ul className="divide-y divide-ink/10">
                {filtered.map((r) => (
                  <li
                    key={r.id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col lg:flex-row lg:items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display text-lg font-bold text-ink">
                          {r.customer.name || "Sin nombre"}
                        </p>
                        {r.isOutOfCatalog && (
                          <AdminBadge className="bg-brand-yellow text-ink">
                            Fuera de catálogo
                          </AdminBadge>
                        )}
                        <AdminBadge className={STATUS_COLORS[r.status as RequestStatus]}>
                          {STATUS_LABELS[r.status as RequestStatus]}
                        </AdminBadge>
                      </div>
                      <p className="text-sm text-ink-muted mt-1">
                        <strong>{r.config.productName}</strong> · {r.config.quantity}{" "}
                        {r.config.quantity === 1 ? "unidad" : "unidades"}
                        {r.config.dueDate && ` · Para ${r.config.dueDate}`}
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {new Date(r.createdAt).toLocaleString("es-CO")} · {r.customer.whatsapp || r.customer.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/requests/${r.id}`}
                        className="text-xs font-bold bg-ink text-paper rounded-full px-4 py-1.5"
                      >
                        Ver detalle
                      </Link>
                      <button
                        onClick={() => handleDelete(r)}
                        className="text-xs font-bold bg-brand-red text-paper rounded-full px-3 py-1.5"
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>
      </div>
      {toast && <Toast type="success" message={toast} />}
    </div>
  );
}

export default function AdminRequestsPage() {
  return (
    <AuthGuard>
      <RequestsContent />
    </AuthGuard>
  );
}
