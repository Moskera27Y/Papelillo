"use client";

import React, { useState } from "react";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminCard, AdminBadge, EmptyState, Toast } from "@/components/admin/AdminUI";
import { useMessages } from "@/hooks/useDataService";
import { updateMessageStatusAction, deleteMessageAction } from "@/app/actions";
import type { ContactMessage } from "@/types/admin";

function MessagesContent() {
  const { messages, isLoading } = useMessages();
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const openMessage = (m: ContactMessage) => {
    setSelected(m);
    if (m.status === "new") {
      updateMessageStatusAction(m.id, "read");
    }
  };

  const handleDelete = async (m: ContactMessage) => {
    if (!confirm("¿Eliminar este mensaje?")) return;
    await deleteMessageAction(m.id);
    setSelected(null);
    setToast("Mensaje eliminado.");
    setTimeout(() => setToast(null), 2500);
  };


  return (
    <div className="min-h-screen bg-paper-soft">
      <div className="flex flex-col lg:flex-row">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-2">
              Mensajes
            </h1>
            <p className="text-ink-muted">
              Mensajes recibidos desde el formulario de contacto.
            </p>
          </header>

          <div className="grid lg:grid-cols-3 gap-6">
            <AdminCard className="lg:col-span-1">
              {messages.length === 0 ? (
                <EmptyState title="Sin mensajes" />
              ) : (
                <ul className="divide-y divide-ink/10 max-h-[600px] overflow-y-auto">
                  {messages.map((m) => (
                    <li key={m.id}>
                      <button
                        onClick={() => openMessage(m)}
                        className={`w-full text-left py-3 px-2 -mx-2 rounded-xl transition-colors ${
                          selected?.id === m.id
                            ? "bg-ink text-paper"
                            : "hover:bg-paper-soft"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold truncate">
                            {m.name || "Sin nombre"}
                          </p>
                          {m.status === "new" && (
                            <span className="w-2 h-2 rounded-full bg-brand-red shrink-0" />
                          )}
                        </div>
                        <p className="text-sm truncate opacity-80">{m.subject}</p>
                        <p className="text-xs opacity-70 mt-0.5">
                          {new Date(m.createdAt).toLocaleString("es-CO")}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </AdminCard>

            <AdminCard className="lg:col-span-2">
              {!selected ? (
                <EmptyState
                  title="Selecciona un mensaje"
                  description="Elige un mensaje del panel izquierdo para verlo en detalle."
                />
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h2 className="font-display text-2xl font-bold">
                        {selected.subject}
                      </h2>
                      <p className="text-sm text-ink-muted mt-1">
                        De: <strong>{selected.name}</strong>{" "}
                        {selected.email && (
                          <>
                            {" · "}
                            <a
                              href={`mailto:${selected.email}`}
                              className="text-brand-blue underline"
                            >
                              {selected.email}
                            </a>
                          </>
                        )}
                        {selected.phone && ` · ${selected.phone}`}
                      </p>
                      <p className="text-xs text-ink-muted mt-1">
                        {new Date(selected.createdAt).toLocaleString("es-CO")}
                      </p>
                    </div>
                    <AdminBadge
                      className={
                        selected.status === "new"
                          ? "bg-brand-red text-paper"
                          : selected.status === "read"
                          ? "bg-brand-blue text-paper"
                          : "bg-brand-green text-paper"
                      }
                    >
                      {selected.status}
                    </AdminBadge>
                  </div>

                  <div className="bg-paper-soft rounded-2xl border-2 border-ink/10 p-4 whitespace-pre-wrap text-sm">
                    {selected.message}
                  </div>

                  <div className="flex gap-2 mt-6">
                    {selected.email && (
                      <a
                        href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                        className="bg-ink text-paper font-bold rounded-full px-5 py-2.5 border-2 border-ink shadow-sticker-sm"
                      >
                        Responder por email
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(selected)}
                      className="bg-brand-red text-paper font-bold rounded-full px-5 py-2.5 border-2 border-ink"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </AdminCard>
          </div>
        </div>
      </div>
      {toast && <Toast type="success" message={toast} />}
    </div>
  );
}

export default function AdminMessagesPage() {
  return (
    <AuthGuard>
      <MessagesContent />
    </AuthGuard>
  );
}
