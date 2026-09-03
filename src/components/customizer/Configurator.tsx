"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useActiveProducts, useSiteSettings } from "@/hooks/useDataService";
import { requestsService } from "@/services";
import { DynamicField } from "./DynamicField";
import { buildWhatsAppMessage } from "./whatsapp-builder";
import type { AdminProduct, ProductOption } from "@/types/admin";
import { formatCOP } from "@/lib/utils";

type Step = "select-product" | "configure" | "summary";

export function Configurator() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const products = useActiveProducts();
  const settings = useSiteSettings();

  const customizableProducts = useMemo(
    () => products.filter((p) => p.isCustomizable),
    [products]
  );

  const [step, setStep] = useState<Step>("select-product");
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);

  // Auto-seleccionar producto desde query parameter (?producto=slug)
  useEffect(() => {
    const slug = searchParams.get("producto");
    if (slug && customizableProducts.length > 0) {
      const product = customizableProducts.find((p) => p.slug === slug);
      if (product) {
        setSelectedProduct(product);
        setValues({});
        setQuantity(product.minQuantity ?? 1);
        setStep("configure");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, customizableProducts.length]);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [quantity, setQuantity] = useState(1);
  const [dueDate, setDueDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const whatsappNumber = settings.contact.whatsapp;

  const activeOptions = useMemo(() => {
    if (!selectedProduct) return [];
    return (selectedProduct.options ?? []).filter((o) => o.isActive);
  }, [selectedProduct]);

  const estimatedPrice = useMemo(() => {
    if (!selectedProduct) return null;
    if (selectedProduct.requiresQuote) return null;
    if (selectedProduct.price === null) return null;

    let base = selectedProduct.price;
    if (selectedProduct.priceType === "perUnit") {
      base = base * Math.max(1, quantity);
    }

    // Agregar ajustes de precio de las opciones
    activeOptions.forEach((opt) => {
      const val = values[opt.name];
      if (typeof val === "string" && opt.options) {
        // Buscar si hay un ajuste de precio para esta opción
        // (por ahora no implementamos priceAdjustment en la UI, pero lo dejamos preparado)
      }
    });

    return base;
  }, [selectedProduct, quantity, values, activeOptions]);

  const isOutOfCatalog = useMemo(() => {
    // Detectar si alguna opción eligió "Otro"
    for (const opt of activeOptions) {
      const val = values[opt.name];
      if (typeof val === "object" && val !== null && !Array.isArray(val) && "value" in val) {
        const obj = val as { value: string; otherText?: string };
        if (obj.value === "__other__") return true;
      }
    }
    return false;
  }, [values, activeOptions]);

  const handleSelectProduct = (p: AdminProduct) => {
    setSelectedProduct(p);
    setValues({});
    setQuantity(p.minQuantity ?? 1);
    setStep("configure");
  };

  const handleBack = () => {
    if (step === "configure") {
      setStep("select-product");
      setSelectedProduct(null);
    } else if (step === "summary") {
      setStep("configure");
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    activeOptions.forEach((opt) => {
      if (opt.required) {
        const val = values[opt.name];
        if (val === undefined || val === null || val === "") {
          errs[opt.name] = "Este campo es obligatorio.";
        } else if (Array.isArray(val) && val.length === 0) {
          errs[opt.name] = "Selecciona al menos una opción.";
        } else if (typeof val === "object" && val !== null && !Array.isArray(val) && "value" in val) {
          const obj = val as { value: string; otherText?: string };
          if (obj.value === "__other__" && !obj.otherText?.trim()) {
            errs[opt.name] = "Especifica tu opción personalizada.";
          }
        }
      }
    });
    if (quantity < (selectedProduct?.minQuantity ?? 1)) {
      errs.quantity = `La cantidad mínima es ${selectedProduct?.minQuantity ?? 1}.`;
    }
    if (quantity > (selectedProduct?.maxQuantity ?? 100)) {
      errs.quantity = `La cantidad máxima es ${selectedProduct?.maxQuantity ?? 100}.`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    setStep("summary");
  };

  const handleSubmit = () => {
    if (!selectedProduct) return;

    // Construir resumen legible
    const summary: Array<{ label: string; value: string }> = [];
    activeOptions.forEach((opt) => {
      const val = values[opt.name];
      if (val === undefined || val === null || val === "") return;
      let display = "";
      if (typeof val === "string") display = val;
      else if (typeof val === "number") display = String(val);
      else if (typeof val === "boolean") display = val ? "Sí" : "No";
      else if (Array.isArray(val)) display = val.join(", ");
      else if (typeof val === "object" && val !== null && "value" in val) {
        const obj = val as { value: string; otherText?: string };
        display = obj.value === "__other__" && obj.otherText ? `Otro: ${obj.otherText}` : obj.value;
      }
      if (display) summary.push({ label: opt.label, value: display });
    });

    // Crear la solicitud en el sistema
    requestsService.createRequest({
      customer: {
        name: customerName,
        email: customerEmail,
        whatsapp: customerWhatsapp,
      },
      config: {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        values: values as Record<string, string | number | boolean | string[] | { value: string; otherText?: string }>,
        quantity,
        dueDate,
        summary,
        attachments: [],
      },
      estimatedPrice,
      estimatedPriceType: selectedProduct.requiresQuote ? "quote" : selectedProduct.priceType === "from" ? "from" : "fixed",
      isOutOfCatalog,
      origin: "configurator",
    });

    // Construir mensaje de WhatsApp
    const msg = buildWhatsAppMessage({
      customer: { name: customerName, email: customerEmail, whatsapp: customerWhatsapp },
      product: selectedProduct,
      values,
      quantity,
      dueDate,
      estimatedPrice,
      isOutOfCatalog,
    });

    if (whatsappNumber) {
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
      window.open(url, "_blank");
    } else {
      alert("Tu solicitud ha sido registrada. Te contactaremos pronto.");
    }

    router.push("/");
  };

  if (step === "select-product") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-display text-5xl md:text-6xl font-bold text-ink text-center mb-4">
          ¿QUÉ VAMOS A CREAR?
        </h1>
        <p className="text-xl text-ink-muted text-center mb-12 max-w-2xl mx-auto">
          Elige el producto que quieres personalizar y te guiaremos paso a paso.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {customizableProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectProduct(p)}
              className="bg-paper rounded-3xl border-2 border-ink shadow-sticker hover:shadow-sticker-lg hover:-translate-y-1 transition-all p-6 text-left group"
            >
              <h3 className="font-display text-2xl font-bold text-ink mb-2 group-hover:text-brand-red transition-colors">
                {p.name}
              </h3>
              <p className="text-sm text-ink-muted mb-4 line-clamp-2">
                {p.shortDescription}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">
                  {p.priceType === "quote"
                    ? "Cotizar"
                    : p.priceType === "from"
                    ? `Desde ${formatCOP(p.price ?? 0)}`
                    : formatCOP(p.price ?? 0)}
                </span>
                <span className="text-brand-red font-bold text-sm">
                  Personalizar →
                </span>
              </div>
            </button>
          ))}
        </div>

        {customizableProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-ink-muted">
              Aún no hay productos personalizables disponibles.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (step === "configure" && selectedProduct) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={handleBack}
          className="text-sm text-ink-muted hover:text-ink mb-6 inline-block"
        >
          ← Cambiar de producto
        </button>

        <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-2">
          {selectedProduct.name}
        </h1>
        <p className="text-ink-muted mb-8">{selectedProduct.shortDescription}</p>

        <div className="space-y-6">
          {activeOptions.map((opt) => (
            <DynamicField
              key={opt.id}
              option={opt}
              value={values[opt.name]}
              onChange={(v) => setValues((prev) => ({ ...prev, [opt.name]: v }))}
              error={errors[opt.name]}
            />
          ))}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Cantidad <span className="text-brand-red">*</span>
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                min={selectedProduct.minQuantity ?? 1}
                max={selectedProduct.maxQuantity ?? 100}
                className="w-full px-4 py-2.5 border-2 border-ink rounded-full bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
              {errors.quantity && (
                <p className="text-xs text-brand-red mt-1 font-semibold">{errors.quantity}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Fecha deseada (opcional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-ink rounded-full bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          {estimatedPrice !== null && (
            <div className="bg-brand-yellow rounded-2xl border-2 border-ink p-4">
              <p className="text-sm font-semibold">Precio estimado</p>
              <p className="font-display text-2xl font-bold">
                {formatCOP(estimatedPrice)} COP
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleNext}
              className="flex-1 bg-ink text-paper font-bold rounded-full px-6 py-3 shadow-sticker hover:-translate-y-0.5 transition-transform"
            >
              Continuar →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "summary" && selectedProduct) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={handleBack}
          className="text-sm text-ink-muted hover:text-ink mb-6 inline-block"
        >
          ← Modificar
        </button>

        <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-2">
          ESTO ES LO QUE QUIERES CREAR
        </h1>
        <p className="text-ink-muted mb-8">
          Revisa los detalles antes de enviar tu solicitud.
        </p>

        <div className="bg-paper rounded-3xl border-2 border-ink shadow-sticker p-6 space-y-4">
          <div>
            <p className="text-sm text-ink-muted">Producto</p>
            <p className="font-display text-xl font-bold">{selectedProduct.name}</p>
          </div>

          {activeOptions.map((opt) => {
            const val = values[opt.name];
            if (val === undefined || val === null || val === "") return null;
            let display = "";
            if (typeof val === "string") display = val;
            else if (typeof val === "number") display = String(val);
            else if (typeof val === "boolean") display = val ? "Sí" : "No";
            else if (Array.isArray(val)) display = val.join(", ");
            else if (typeof val === "object" && val !== null && "value" in val) {
              const obj = val as { value: string; otherText?: string };
              display = obj.value === "__other__" && obj.otherText ? `Otro: ${obj.otherText}` : obj.value;
            }
            if (!display) return null;
            return (
              <div key={opt.id} className="border-t border-ink/10 pt-3">
                <p className="text-sm text-ink-muted">{opt.label}</p>
                <p className="font-semibold">{display}</p>
              </div>
            );
          })}

          <div className="border-t border-ink/10 pt-3">
            <p className="text-sm text-ink-muted">Cantidad</p>
            <p className="font-semibold">{quantity}</p>
          </div>

          {dueDate && (
            <div className="border-t border-ink/10 pt-3">
              <p className="text-sm text-ink-muted">Fecha deseada</p>
              <p className="font-semibold">{dueDate}</p>
            </div>
          )}

          {estimatedPrice !== null && (
            <div className="border-t border-ink/10 pt-3">
              <p className="text-sm text-ink-muted">Precio estimado</p>
              <p className="font-display text-2xl font-bold">
                {formatCOP(estimatedPrice)} COP
              </p>
            </div>
          )}

          {isOutOfCatalog && (
            <div className="bg-brand-yellow rounded-2xl border-2 border-ink p-4 mt-4">
              <p className="font-semibold text-sm">
                ⚠️ Esta solicitud incluye opciones fuera del catálogo estándar.
              </p>
              <p className="text-xs text-ink-muted mt-1">
                Te contactaremos para revisar los detalles y darte una cotización personalizada.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="font-display text-2xl font-bold">Tus datos de contacto</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="px-4 py-2.5 border-2 border-ink rounded-full bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <input
              type="email"
              placeholder="Email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="px-4 py-2.5 border-2 border-ink rounded-full bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <input
            type="tel"
            placeholder="WhatsApp (con código de país)"
            value={customerWhatsapp}
            onChange={(e) => setCustomerWhatsapp(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-ink rounded-full bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-brand-green text-ink font-bold rounded-full px-6 py-3 shadow-sticker hover:-translate-y-0.5 transition-transform"
          >
            Enviar solicitud por WhatsApp
          </button>
          <button
            onClick={handleBack}
            className="bg-paper-soft border-2 border-ink/10 font-bold rounded-full px-6 py-3"
          >
            Modificar
          </button>
        </div>
      </div>
    );
  }

  return null;
}
