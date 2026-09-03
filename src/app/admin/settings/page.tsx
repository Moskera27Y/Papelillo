"use client";

import React, { useEffect, useState } from "react";
import { AuthGuard } from "@/components/admin/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminCard, Input, Textarea, Toast } from "@/components/admin/AdminUI";
import { useSiteSettings, useAuth } from "@/hooks/useDataService";
import { updateSiteSettingsAction } from "@/app/actions";
import { loginAction, logoutAction } from "@/app/actions";
import type { SiteSettings, WompiConfig } from "@/types/admin";

function SettingsContent() {
  const { settings, isLoading: ssLoading } = useSiteSettings();
  const { changePassword, changeUsername, session, isLoading: authLoading } = useAuth();
  const [draft, setDraft] = useState<any>(settings);
  const [toast, setToast] = useState<string | null>(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [newUsername, setNewUsername] = useState(session?.username ?? "");

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  useEffect(() => {
    setNewUsername(session?.username ?? "");
  }, [session]);

  if (ssLoading || authLoading) {
    return (
      <div className="min-h-screen bg-paper-soft flex items-center justify-center">
        <div className="text-ink-muted">Cargando configuración...</div>
      </div>
    );
  }

  const save = async () => {
    if (!draft) return;
    await updateSiteSettingsAction(draft);
    setToast("Configuración guardada ✓");
    setTimeout(() => setToast(null), 2500);
  };

  const handleChangePw = async () => {
    if (newPw !== confirmPw) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    if (newPw.length < 6) {
      alert("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    const ok = await changePassword(currentPw, newPw);
    if (ok) {
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setToast("Contraseña actualizada ✓");
      setTimeout(() => setToast(null), 2500);
    } else {
      alert("Contraseña actual incorrecta.");
    }
  };

  const handleChangeUsername = async () => {
    const ok = await changeUsername(newUsername);
    if (ok) {
      setToast("Usuario actualizado ✓");
      setTimeout(() => setToast(null), 2500);
    } else {
      alert("El nombre de usuario debe tener al menos 3 caracteres.");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("El logo no puede superar 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((prev: any) => ({
        ...prev,
        branding: {
          ...prev.branding,
          logoDataUrl: reader.result as string,
        },
      }));
      setToast("Logo cargado. Recuerda guardar.");
      setTimeout(() => setToast(null), 2500);
    };
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setDraft((prev: any) => ({
      ...prev,
      branding: {
        ...prev.branding,
        logoDataUrl: undefined,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-paper-soft">
      <div className="flex flex-col lg:flex-row">
        <AdminSidebar />
        <div className="flex-1 p-6 lg:p-10">
          <header className="mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-2">
              Configuración
            </h1>
            <p className="text-ink-muted">
              Ajustes generales del sitio, marca, pagos y credenciales de acceso.
            </p>
          </header>

          <div className="space-y-6">
            {/* ---------- BRANDING / LOGO ---------- */}
            <AdminCard title="Marca y logo">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-bold text-ink mb-2">Logo actual</p>
                  <div className="bg-paper rounded-2xl border-2 border-ink/10 p-6 flex items-center justify-center h-32">
                    <img
                      src={
                        draft.branding.logoDataUrl ?? draft.branding.logoSrc
                      }
                      alt="Logo preview"
                      className="max-h-20 max-w-full object-contain"
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    <label className="block">
                      <span className="block text-sm font-bold text-ink mb-1">
                        Subir nuevo logo
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={handleLogoUpload}
                        className="block w-full text-sm text-ink-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-ink file:text-paper file:font-bold file:cursor-pointer"
                      />
                    </label>
                    {draft.branding.logoDataUrl && (
                      <button
                        onClick={clearLogo}
                        className="text-xs text-brand-red font-bold"
                      >
                        Quitar logo subido
                      </button>
                    )}
                    <p className="text-xs text-ink-muted">
                      Formatos: PNG, JPG, WEBP, SVG. Máximo 2MB.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="URL del logo (si no subes archivo)"
                    value={draft.branding.logoSrc}
                    onChange={(e) =>
                      setDraft((prev: any) => ({
                        ...prev,
                        branding: { ...prev.branding, logoSrc: e.target.value },
                      }))
                    }
                    placeholder="/images/logo.svg"
                  />
                  <Input
                    label="Favicon (URL)"
                    value={draft.branding.faviconSrc}
                    onChange={(e) =>
                      setDraft((prev: any) => ({
                        ...prev,
                        branding: {
                          ...prev.branding,
                          faviconSrc: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </AdminCard>

            {/* ---------- WOMPI ---------- */}
            <AdminCard title="Pagos — Wompi">
              <WompiSettings
                config={draft.wompi}
                onChange={(cfg) =>
                  setDraft((prev: any) => ({ ...prev, wompi: cfg }))
                }
              />
            </AdminCard>

            {/* ---------- SEO ---------- */}
            <AdminCard title="SEO">
              <Input
                label="Nombre del sitio"
                value={draft.seo.siteName}
                onChange={(e) =>
                  setDraft((prev: any) => ({
                    ...prev,
                    seo: { ...prev.seo, siteName: e.target.value },
                  }))
                }
              />
              <Textarea
                label="Descripción del sitio"
                value={draft.seo.siteDescription}
                className="mt-4"
                onChange={(e) =>
                  setDraft((prev: any) => ({
                    ...prev,
                    seo: { ...prev.seo, siteDescription: e.target.value },
                  }))
                }
                rows={3}
              />
              <Input
                label="URL del sitio"
                value={draft.seo.siteUrl}
                className="mt-4"
                onChange={(e) =>
                  setDraft((prev: any) => ({
                    ...prev,
                    seo: { ...prev.seo, siteUrl: e.target.value },
                  }))
                }
                placeholder="https://papelillo.com"
              />
              <Input
                label="Imagen OG (opcional)"
                value={draft.seo.ogImage ?? ""}
                className="mt-4"
                onChange={(e) =>
                  setDraft((prev: any) => ({
                    ...prev,
                    seo: { ...prev.seo, ogImage: e.target.value },
                  }))
                }
                placeholder="https://papelillo.com/og.jpg"
              />
            </AdminCard>

            {/* ---------- AUTH ---------- */}
            <AdminCard title="Cambiar usuario">
              <Input
                label="Nuevo nombre de usuario"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="admin"
              />
              <button
                onClick={handleChangeUsername}
                className="mt-4 bg-ink text-paper font-bold rounded-full px-5 py-2.5"
              >
                Actualizar usuario
              </button>
            </AdminCard>

            <AdminCard title="Cambiar contraseña">
              <Input
                label="Contraseña actual"
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
              />
              <Input
                label="Nueva contraseña"
                type="password"
                value={newPw}
                className="mt-4"
                onChange={(e) => setNewPw(e.target.value)}
              />
              <Input
                label="Confirmar nueva contraseña"
                type="password"
                value={confirmPw}
                className="mt-4"
                onChange={(e) => setConfirmPw(e.target.value)}
              />
              <button
                onClick={handleChangePw}
                className="mt-4 bg-ink text-paper font-bold rounded-full px-5 py-2.5"
              >
                Cambiar contraseña
              </button>
            </AdminCard>

            <div className="flex gap-3">
              <button
                onClick={save}
                className="bg-ink text-paper font-bold rounded-full px-6 py-3 shadow-sticker hover:-translate-y-0.5 transition-transform"
              >
                Guardar configuración
              </button>
              <button
                onClick={() => setDraft(settings)}
                className="bg-paper-soft border-2 border-ink/10 font-bold rounded-full px-6 py-3"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      </div>
      {toast && <Toast type="success" message={toast} />}
    </div>
  );
}

// ============================================================
// WOMPI SETTINGS
// ============================================================

function WompiSettings({
  config,
  onChange,
}: {
  config: WompiConfig;
  onChange: (c: WompiConfig) => void;
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const update = (patch: Partial<WompiConfig>) => {
    onChange({ ...config, ...patch });
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const resp = await fetch("/api/wompi/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: "TEST_" + Date.now(),
          amountInCents: 10000,
          currency: "COP",
        }),
      });
      if (resp.ok) {
        setTestResult({
          ok: true,
          msg: "✓ Las credenciales secretas del servidor están configuradas correctamente.",
        });
      } else {
        const data = await resp.json().catch(() => ({}));
        setTestResult({
          ok: false,
          msg: data.error || "Error al contactar el endpoint de firma.",
        });
      }
    } catch (err) {
      setTestResult({
        ok: false,
        msg: "No se pudo conectar al servidor.",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
            className="w-5 h-5 rounded accent-brand-green"
          />
          <span className="font-bold text-ink">Habilitar Wompi</span>
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-sm font-bold text-ink mb-1">Ambiente</span>
          <select
            value={config.environment}
            onChange={(e) =>
              update({
                environment: e.target.value as "sandbox" | "production",
              })
            }
            className="w-full px-4 py-3 rounded-2xl border-2 border-ink/15 bg-paper focus:border-ink focus:outline-none"
          >
            <option value="sandbox">Sandbox (pruebas)</option>
            <option value="production">Producción</option>
          </select>
        </label>

        <Input
          label="Llave pública (Public Key)"
          value={config.publicKey}
          onChange={(e) => update({ publicKey: e.target.value })}
          placeholder="pub_prod_xxxx..."
        />

        <Input
          label="Nombre comercial"
          value={config.merchantName}
          onChange={(e) => update({ merchantName: e.target.value })}
          placeholder="Papelillo"
        />

        <div>
          <span className="block text-sm font-bold text-ink mb-1">
            Estado de credenciales secretas
          </span>
          <div
            className={`px-4 py-3 rounded-2xl border-2 text-sm font-bold ${
              config.hasServerSecrets
                ? "bg-brand-green/20 border-brand-green/50 text-ink"
                : "bg-brand-yellow/20 border-brand-yellow/50 text-ink"
            }`}
          >
            {config.hasServerSecrets
              ? "✓ Configuradas en el servidor (.env)"
              : "⚠ Faltan: revisar .env"}
          </div>
          <p className="text-xs text-ink-muted mt-1">
            Las claves privadas (WOMPI_PRIVATE_KEY, WOMPI_INTEGRITY_KEY,
            WOMPI_EVENTS_SECRET) se configuran exclusivamente en el archivo{" "}
            <code className="bg-ink/10 px-1 rounded">.env.local</code> del
            servidor. Nunca se muestran ni editan desde aquí.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-ink/10">
        <button
          onClick={handleTest}
          disabled={testing}
          className="bg-ink text-paper font-bold rounded-full px-5 py-2.5 text-sm disabled:opacity-50"
        >
          {testing ? "Probando..." : "Probar configuración"}
        </button>
        {testResult && (
          <p
            className={`text-sm ${
              testResult.ok ? "text-brand-green" : "text-brand-red"
            }`}
          >
            {testResult.msg}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}
