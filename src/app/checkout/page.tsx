"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ordersService, siteService, wompiService } from "@/services";
const { formatCOP, openWompiWidget, toCents, isWompiReady } = wompiService;
import { ProductImage } from "@/components/ui/ProductImage";
import type { OrderCustomer, OrderShipping } from "@/types/admin";

// ============================================================
// CHECKOUT — formulario + resumen + pago con Wompi
// ============================================================

type Step = "shipping" | "payment" | "processing";

interface FormData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  address: string;
  address2: string;
  city: string;
  department: string;
  postalCode: string;
  notes: string;
}

const EMPTY_FORM: FormData = {
  name: "",
  lastName: "",
  email: "",
  phone: "",
  documentType: "CC",
  documentNumber: "",
  address: "",
  address2: "",
  city: "",
  department: "",
  postalCode: "",
  notes: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, isEmpty, clear, hasQuoteOnly } = useCart();
  const [step, setStep] = useState<Step>("shipping");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [paymentMethod, setPaymentMethod] = useState<"wompi" | "whatsapp">("wompi");
  const [shippingCost] = useState(10000); // Costo de envío fijo (COP)
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settings = siteService.getSiteSettings();
  const wompiCheck = isWompiReady();

  const total = useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);

  useEffect(() => {
    if (isEmpty) {
      router.replace("/shop");
    }
  }, [isEmpty, router]);

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-muted mb-4">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  const updateField = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateShipping = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.name.trim()) errs.name = "Ingresa tu nombre";
    if (!form.lastName.trim()) errs.lastName = "Ingresa tu apellido";
    if (!form.email.trim()) errs.email = "Ingresa tu email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email inválido";
    if (!form.phone.trim()) errs.phone = "Ingresa tu teléfono";
    if (!form.address.trim()) errs.address = "Ingresa tu dirección";
    if (!form.city.trim()) errs.city = "Ingresa tu ciudad";
    if (!form.department.trim()) errs.department = "Ingresa tu departamento";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinueToPayment = () => {
    if (validateShipping()) {
      setStep("payment");
      window.scrollTo(0, 0);
    }
  };

  const handlePay = async () => {
    setError(null);
    setStep("processing");
    setProcessing(true);

    try {
      // 1. Crear el pedido en estado "pending"
      const customer: OrderCustomer = {
        name: form.name,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        documentType: form.documentType,
        documentNumber: form.documentNumber,
      };

      const shipping: OrderShipping = {
        address: form.address,
        address2: form.address2 || undefined,
        city: form.city,
        department: form.department,
        postalCode: form.postalCode || undefined,
        notes: form.notes || undefined,
        cost: shippingCost,
      };

      const items = lines.map((l) => ({
        productId: l.productId,
        slug: l.product?.slug ?? "",
        name: l.product?.name ?? "",
        image: l.product?.images[0],
        unitPrice: l.product?.price ?? 0,
        quantity: l.quantity,
        customization: l.customizations,
      }));

      const order = ordersService.createOrder({
        customer,
        shipping,
        items,
        paymentMethod,
        total,
      });

      // 2. Si el método es WhatsApp, simplemente notificar y redirigir
      if (paymentMethod === "whatsapp") {
        const msg = encodeURIComponent(
          `Hola, acabo de crear un pedido (${order.number}) con los siguientes productos:\n\n` +
            items.map((i) => `• ${i.name} x${i.quantity}`).join("\n") +
            `\n\nTotal: ${formatCOP(total)}\n\n¿Cómo procedo con el pago y envío?`
        );
        const wa = settings.contact.whatsapp
          ? `https://wa.me/${settings.contact.whatsapp}?text=${msg}`
          : "/checkout/success?order=" + order.id;
        clear();
        window.location.href = wa;
        return;
      }

      // 3. Si el método es Wompi, abrir el widget
      if (paymentMethod === "wompi") {
        if (!wompiCheck.ready) {
          throw new Error(
            "Wompi no está configurado. Por favor, intenta con WhatsApp o contacta al administrador."
          );
        }

        try {
          // Solicitar la firma al servidor (server-side)
          const signResp = await fetch("/api/wompi/signature", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: order.payment.reference,
              amountInCents: toCents(total),
              currency: "COP",
            }),
          });

          if (!signResp.ok) {
            throw new Error("No se pudo generar la firma de Wompi");
          }

          const { signature } = await signResp.json();

          const event = await openWompiWidget({
            reference: order.payment.reference,
            amountInCents: toCents(total),
            customerEmail: form.email,
            customerData: {
              fullName: `${form.name} ${form.lastName}`,
              phoneNumber: form.phone.replace(/\D/g, ""),
              phoneNumberCountryCode: "57",
            },
            signature: {
              integrityKey: signature,
            },
            redirectUrl: `${window.location.origin}/checkout/success?order=${order.id}`,
          });

          // 4. Actualizar el pedido según el resultado
          const tx = event.data.transaction;
          if (tx.status === "APPROVED") {
            ordersService.updatePaymentStatus(order.id, "approved", {
              wompiTransactionId: tx.id,
              paidAt: new Date().toISOString(),
            });
            clear();
            router.push(`/checkout/success?order=${order.id}`);
          } else {
            ordersService.updatePaymentStatus(order.id, "declined", {
              failureReason: tx.status_message || tx.status,
            });
            setError(
              `El pago fue ${tx.status === "DECLINED" ? "rechazado" : tx.status.toLowerCase()}. ${
                tx.status_message || ""
              }`
            );
            setStep("payment");
          }
        } catch (err) {
          if (err instanceof Error && err.message.includes("cerró")) {
            // El usuario cerró el widget: el pedido queda "pending"
            setStep("payment");
          } else {
            throw err;
          }
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al procesar tu pedido. Inténtalo nuevamente."
      );
      setStep("payment");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/shop"
            className="text-sm text-ink-muted hover:text-brand-red transition-colors inline-flex items-center gap-2 mb-4"
          >
            ← Volver a la tienda
          </Link>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-ink">
            Finalizar compra
          </h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4 mb-10">
          <StepIndicator n={1} label="Datos" active={step === "shipping"} done={step !== "shipping"} />
          <div className="flex-1 h-0.5 bg-ink/10" />
          <StepIndicator
            n={2}
            label="Pago"
            active={step === "payment"}
            done={step === "processing"}
          />
        </div>

        {error && (
          <div className="mb-6 bg-brand-red/10 border-2 border-brand-red rounded-2xl px-4 py-3 text-sm text-ink">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Formulario */}
          <div className="lg:col-span-2">
            {step === "shipping" && (
              <ShippingForm
                form={form}
                errors={errors}
                onChange={updateField}
                onNext={handleContinueToPayment}
              />
            )}

            {(step === "payment" || step === "processing") && (
              <PaymentForm
                paymentMethod={paymentMethod}
                onChangeMethod={setPaymentMethod}
                onPay={handlePay}
                onBack={() => setStep("shipping")}
                processing={processing}
                wompiReady={wompiCheck.ready}
                wompiReasons={wompiCheck.reasons}
                hasQuoteOnly={hasQuoteOnly}
              />
            )}
          </div>

          {/* Resumen */}
          <aside className="lg:col-span-1">
            <OrderSummary lines={lines} subtotal={subtotal} shipping={shippingCost} total={total} />
          </aside>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STEP INDICATOR
// ============================================================

function StepIndicator({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
          active
            ? "bg-ink text-paper"
            : done
            ? "bg-brand-green text-paper"
            : "bg-ink/10 text-ink/50"
        }`}
      >
        {done ? "✓" : n}
      </div>
      <span
        className={`text-sm font-bold ${
          active || done ? "text-ink" : "text-ink/50"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// ============================================================
// SHIPPING FORM
// ============================================================

function ShippingForm({
  form,
  errors,
  onChange,
  onNext,
}: {
  form: FormData;
  errors: Partial<FormData>;
  onChange: (k: keyof FormData, v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="bg-paper-soft rounded-3xl border-2 border-ink/10 p-6 md:p-8 space-y-6">
      <h2 className="font-display text-2xl font-bold text-ink">Datos de envío</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <Field
          label="Nombre"
          value={form.name}
          onChange={(v) => onChange("name", v)}
          error={errors.name}
          required
        />
        <Field
          label="Apellido"
          value={form.lastName}
          onChange={(v) => onChange("lastName", v)}
          error={errors.lastName}
          required
        />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => onChange("email", v)}
          error={errors.email}
          required
        />
        <Field
          label="Teléfono / WhatsApp"
          type="tel"
          value={form.phone}
          onChange={(v) => onChange("phone", v)}
          error={errors.phone}
          required
          placeholder="300 123 4567"
        />
        <Field
          label="Dirección"
          value={form.address}
          onChange={(v) => onChange("address", v)}
          error={errors.address}
          required
          placeholder="Calle 123 #45-67"
        />
        <Field
          label="Apartamento, interior (opcional)"
          value={form.address2}
          onChange={(v) => onChange("address2", v)}
          error={errors.address2}
        />
        <Field
          label="Ciudad"
          value={form.city}
          onChange={(v) => onChange("city", v)}
          error={errors.city}
          required
        />
        <Field
          label="Departamento"
          value={form.department}
          onChange={(v) => onChange("department", v)}
          error={errors.department}
          required
        />
        <Field
          label="Código postal (opcional)"
          value={form.postalCode}
          onChange={(v) => onChange("postalCode", v)}
          error={errors.postalCode}
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-ink mb-2">
          Notas del pedido (opcional)
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          rows={3}
          placeholder="Instrucciones especiales para la entrega, timbre, etc."
          className="w-full px-4 py-3 rounded-2xl border-2 border-ink/15 bg-paper focus:border-ink focus:outline-none transition-colors"
        />
      </div>

      <button
        onClick={onNext}
        className="w-full bg-ink text-paper font-bold rounded-full px-6 py-4 hover:bg-opacity-90 transition-colors shadow-sticker"
      >
        Continuar al pago
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-ink mb-1.5">
        {label}
        {required && <span className="text-brand-red ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-2xl border-2 bg-paper transition-colors focus:outline-none ${
          error
            ? "border-brand-red focus:border-brand-red"
            : "border-ink/15 focus:border-ink"
        }`}
      />
      {error && <p className="text-xs text-brand-red mt-1">{error}</p>}
    </div>
  );
}

// ============================================================
// PAYMENT FORM
// ============================================================

function PaymentForm({
  paymentMethod,
  onChangeMethod,
  onPay,
  onBack,
  processing,
  wompiReady,
  wompiReasons,
  hasQuoteOnly,
}: {
  paymentMethod: "wompi" | "whatsapp";
  onChangeMethod: (m: "wompi" | "whatsapp") => void;
  onPay: () => void;
  onBack: () => void;
  processing: boolean;
  wompiReady: boolean;
  wompiReasons: string[];
  hasQuoteOnly: boolean;
}) {
  if (hasQuoteOnly) {
    return (
      <div className="bg-paper-soft rounded-3xl border-2 border-ink/10 p-6 md:p-8 space-y-6">
        <h2 className="font-display text-2xl font-bold text-ink">
          Tu pedido requiere cotización
        </h2>
        <p className="text-ink-muted">
          Los productos en tu carrito requieren una cotización personalizada.
          Te contactaremos por WhatsApp para confirmar el precio final y
          coordinar el pago.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-full border-2 border-ink/20 font-bold text-ink hover:bg-ink/5 transition-colors"
          >
            Volver
          </button>
          <button
            onClick={onPay}
            disabled={processing}
            className="flex-1 bg-brand-green text-ink font-bold rounded-full px-6 py-3 hover:bg-opacity-90 transition-colors shadow-sticker disabled:opacity-50"
          >
            {processing ? "Enviando..." : "Enviar solicitud por WhatsApp"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-paper-soft rounded-3xl border-2 border-ink/10 p-6 md:p-8 space-y-6">
      <h2 className="font-display text-2xl font-bold text-ink">Método de pago</h2>

      <div className="space-y-3">
        <PaymentOption
          selected={paymentMethod === "wompi"}
          onClick={() => onChangeMethod("wompi")}
          disabled={!wompiReady}
          title="Tarjeta de crédito / débito (Wompi)"
          description="Pago seguro con PSE, Nequi, Daviplata o tarjetas Visa/Mastercard"
          icon="💳"
          badge="Recomendado"
          badgeColor="brand-yellow"
        />
        {!wompiReady && wompiReasons.length > 0 && (
          <p className="text-xs text-ink-muted pl-12">
            ℹ️ {wompiReasons[0]}. Puedes usar WhatsApp como alternativa.
          </p>
        )}

        <PaymentOption
          selected={paymentMethod === "whatsapp"}
          onClick={() => onChangeMethod("whatsapp")}
          title="Coordinar por WhatsApp"
          description="Te contactamos para confirmar pedido y acordar forma de pago (transferencia, contra entrega, etc.)"
          icon="💬"
          badgeColor="brand-green"
        />
      </div>

      <div className="pt-4 border-t border-ink/10 flex gap-3">
        <button
          onClick={onBack}
          disabled={processing}
          className="px-6 py-3 rounded-full border-2 border-ink/20 font-bold text-ink hover:bg-ink/5 transition-colors disabled:opacity-50"
        >
          Volver
        </button>
        <button
          onClick={onPay}
          disabled={processing}
          className="flex-1 bg-ink text-paper font-bold rounded-full px-6 py-4 hover:bg-opacity-90 transition-colors shadow-sticker disabled:opacity-50"
        >
          {processing
            ? "Procesando..."
            : paymentMethod === "wompi"
            ? "Pagar con Wompi"
            : "Enviar pedido por WhatsApp"}
        </button>
      </div>

      <p className="text-xs text-ink-muted text-center">
        🔒 Tu información está protegida. No almacenamos datos de tarjetas.
      </p>
    </div>
  );
}

function PaymentOption({
  selected,
  onClick,
  disabled,
  title,
  description,
  icon,
  badge,
  badgeColor,
}: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  description: string;
  icon: string;
  badge?: string;
  badgeColor: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
        selected
          ? "border-ink bg-paper shadow-sticker-sm"
          : "border-ink/15 hover:border-ink/30"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 flex-shrink-0 bg-paper-soft rounded-full border-2 border-ink/10 flex items-center justify-center text-2xl">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-bold text-ink">{title}</p>
            {badge && (
              <span
                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-${badgeColor} text-ink`}
              >
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-ink-muted">{description}</p>
        </div>
        <div
          className={`w-5 h-5 flex-shrink-0 rounded-full border-2 ${
            selected ? "border-ink bg-ink" : "border-ink/30"
          } flex items-center justify-center mt-1`}
        >
          {selected && <div className="w-2 h-2 bg-paper rounded-full" />}
        </div>
      </div>
    </button>
  );
}

// ============================================================
// ORDER SUMMARY
// ============================================================

function OrderSummary({
  lines,
  subtotal,
  shipping,
  total,
}: {
  lines: ReturnType<typeof useCart>["lines"];
  subtotal: number;
  shipping: number;
  total: number;
}) {
  return (
    <div className="sticky top-24 bg-paper-soft rounded-3xl border-2 border-ink/10 p-6 space-y-5">
      <h2 className="font-display text-xl font-bold text-ink">Resumen</h2>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {lines.map((line) => {
          const p = line.product;
          if (!p) return null;
          return (
            <div key={line.productId} className="flex gap-3">
              <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 border-ink/10">
                <ProductImage
                  images={p.images}
                  productName={p.name}
                  color="yellow"
                  className="w-full h-full"
                />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-ink text-paper text-xs font-bold rounded-full flex items-center justify-center">
                  {line.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink line-clamp-2">{p.name}</p>
                <p className="text-xs text-ink-muted">
                  {line.lineTotal !== null ? formatCOP(line.lineTotal) : "Cotizar"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2 pt-4 border-t border-ink/10 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-muted">Subtotal</span>
          <span className="font-bold text-ink">{formatCOP(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Envío</span>
          <span className="font-bold text-ink">{formatCOP(shipping)}</span>
        </div>
        <div className="flex justify-between pt-3 border-t border-ink/10">
          <span className="font-display text-lg font-bold text-ink">Total</span>
          <span className="font-display text-xl font-bold text-ink">
            {formatCOP(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
