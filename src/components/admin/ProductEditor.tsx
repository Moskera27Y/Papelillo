"use client";

import React from "react";
import { cn, slugify } from "@/lib/utils";
import {
  AdminCard,
  Input,
  Textarea,
  Select,
  Toggle,
  AdminBadge,
} from "./AdminUI";
import { FieldBuilder } from "./FieldBuilder";
import { useCategories } from "@/hooks/useDataService";
import type {
  AdminProduct,
  ProductOption,
  ProductOptionValue,
  FieldTypeExt,
  Unit,
} from "@/types/admin";
import { uid } from "@/services/ids";

type EditorValue = Omit<AdminProduct, "id" | "createdAt" | "updatedAt">;

interface Props {
  value: EditorValue;
  onChange: (patch: Partial<EditorValue>) => void;
  isEditing?: boolean;
}

export function ProductEditor({ value, onChange, isEditing }: Props) {
  const categories = useCategories();

  const v = value;

  // ---------- General ----------
  const Section = ({
    title,
    children,
    className,
  }: {
    title: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <AdminCard title={title} className={className}>
      {children}
    </AdminCard>
  );

  return (
    <div className="space-y-6">
      {/* INFORMACIÓN GENERAL */}
      <Section title="Información general">
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Nombre del producto *"
            value={v.name}
            onChange={(e) => {
              const name = e.target.value;
              onChange({
                name,
                slug: !isEditing || !v.slug ? slugify(name) : v.slug,
              });
            }}
            placeholder="Ej. Mini libros para colorear"
          />
          <Input
            label="Slug (URL)"
            value={v.slug}
            onChange={(e) => onChange({ slug: slugify(e.target.value) })}
            help="Se usa en la URL. Se autogenera si lo dejas vacío."
            placeholder="mini-libros"
          />
        </div>
        <div className="mt-4">
          <Input
            label="Descripción corta"
            value={v.shortDescription}
            onChange={(e) => onChange({ shortDescription: e.target.value })}
            placeholder="Una frase que aparecerá en la tarjeta del producto."
            maxLength={140}
          />
        </div>
        <div className="mt-4">
          <Textarea
            label="Descripción completa"
            value={v.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Describe el producto con detalle."
            rows={5}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Select
            label="Categoría *"
            value={v.category}
            onChange={(e) => onChange({ category: e.target.value })}
          >
            <option value="">Selecciona una categoría…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input
            label="Subcategoría (opcional)"
            value={v.subcategory ?? ""}
            onChange={(e) => onChange({ subcategory: e.target.value })}
            placeholder="Ej. mini, mediano, grande…"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <Toggle
            label="Producto destacado"
            checked={v.featured}
            onChange={(x) => onChange({ featured: x })}
            help="Aparece en la home."
          />
          <Toggle
            label="Producto nuevo"
            checked={v.isNew}
            onChange={(x) => onChange({ isNew: x })}
            help="Muestra el badge 'Nuevo'."
          />
          <Toggle
            label="Producto popular"
            checked={v.isPopular}
            onChange={(x) => onChange({ isPopular: x })}
            help="Muestra el badge 'Popular'."
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Toggle
            label="Producto activo"
            checked={v.isActive}
            onChange={(x) => onChange({ isActive: x })}
            help="Si está inactivo no aparece en la tienda."
          />
          <Toggle
            label="Requiere cotización"
            checked={v.requiresQuote}
            onChange={(x) => onChange({ requiresQuote: x, priceType: x ? "quote" : v.priceType })}
            help="No mostrará precio, solo el botón de cotización."
          />
        </div>
      </Section>

      {/* PRECIO */}
      <Section title="Precio">
        <div className="grid md:grid-cols-2 gap-4">
          <Select
            label="Tipo de precio"
            value={v.priceType}
            onChange={(e) =>
              onChange({ priceType: e.target.value as EditorValue["priceType"] })
            }
          >
            <option value="fixed">Fijo ($1.500)</option>
            <option value="from">Desde ($10.000)</option>
            <option value="perUnit">Por unidad ($500 / unidad)</option>
            <option value="quote">Bajo cotización</option>
          </Select>
          <Select
            label="Moneda"
            value={v.currency}
            onChange={(e) => onChange({ currency: e.target.value as "COP" })}
          >
            <option value="COP">COP — Peso colombiano</option>
          </Select>
        </div>
        {!v.requiresQuote && (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <Input
              type="number"
              label="Precio (COP)"
              value={v.price ?? ""}
              onChange={(e) =>
                onChange({ price: e.target.value === "" ? null : Number(e.target.value) })
              }
              placeholder="1500"
            />
            <Input
              type="number"
              label="Precio anterior (tachado, opcional)"
              value={v.compareAtPrice ?? ""}
              onChange={(e) =>
                onChange({
                  compareAtPrice: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder="2000"
            />
          </div>
        )}
        {v.requiresQuote && (
          <div className="mt-4 bg-paper-soft rounded-2xl border-2 border-ink/10 p-4 text-sm text-ink-muted">
            Este producto no mostrará precio. El cliente verá &quot;Precio bajo cotización&quot; y un botón
            para solicitar cotización por WhatsApp.
          </div>
        )}
      </Section>

      {/* IMÁGENES */}
      <Section title="Imágenes">
        <ImageUploader
          images={v.images}
          onChange={(images) => onChange({ images })}
        />
      </Section>

      {/* DIMENSIONES */}
      <Section title="Dimensiones">
        <div className="grid md:grid-cols-4 gap-4">
          <Input
            type="number"
            label="Alto"
            value={v.dimensions?.height ?? ""}
            onChange={(e) =>
              onChange({
                dimensions: {
                  ...(v.dimensions || {}),
                  height: e.target.value === "" ? undefined : Number(e.target.value),
                },
              })
            }
          />
          <Input
            type="number"
            label="Ancho"
            value={v.dimensions?.width ?? ""}
            onChange={(e) =>
              onChange({
                dimensions: {
                  ...(v.dimensions || {}),
                  width: e.target.value === "" ? undefined : Number(e.target.value),
                },
              })
            }
          />
          <Input
            type="number"
            label="Profundidad"
            value={v.dimensions?.depth ?? ""}
            onChange={(e) =>
              onChange({
                dimensions: {
                  ...(v.dimensions || {}),
                  depth: e.target.value === "" ? undefined : Number(e.target.value),
                },
              })
            }
          />
          <Select
            label="Unidad"
            value={v.dimensions?.unit ?? "cm"}
            onChange={(e) =>
              onChange({
                dimensions: {
                  ...(v.dimensions || {}),
                  unit: e.target.value as Unit,
                },
              })
            }
          >
            <option value="cm">cm</option>
            <option value="mm">mm</option>
            <option value="m">m</option>
          </Select>
        </div>
        <div className="mt-4">
          <Toggle
            label="Dimensiones aproximadas"
            checked={v.dimensions?.approximate ?? false}
            onChange={(x) =>
              onChange({
                dimensions: { ...(v.dimensions || {}), approximate: x },
              })
            }
            help="Marca si el producto no tiene medidas exactas."
          />
        </div>
      </Section>

      {/* CARACTERÍSTICAS */}
      <Section title="Características">
        <FeaturesEditor
          features={v.features ?? []}
          onChange={(features) => onChange({ features })}
        />
      </Section>

      {/* STOCK */}
      <Section title="Inventario">
        <div className="grid md:grid-cols-3 gap-4">
          <Input
            type="number"
            label="Stock (dejar vacío para ilimitado)"
            value={v.stock ?? ""}
            onChange={(e) =>
              onChange({ stock: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
          <Input
            type="number"
            label="Cantidad mínima"
            value={v.minQuantity ?? 1}
            onChange={(e) => onChange({ minQuantity: Number(e.target.value) || 1 })}
          />
          <Input
            type="number"
            label="Cantidad máxima"
            value={v.maxQuantity ?? 100}
            onChange={(e) =>
              onChange({ maxQuantity: Number(e.target.value) || 100 })
            }
          />
        </div>
      </Section>

      {/* PERSONALIZACIÓN */}
      <Section title="Personalización">
        <Toggle
          label="Este producto es personalizable"
          checked={v.isCustomizable}
          onChange={(x) => onChange({ isCustomizable: x })}
          help="Activa el configurador para que el cliente elija opciones."
        />

        {v.isCustomizable && (
          <div className="mt-6 space-y-6">
            <OptionsEditor
              options={v.options ?? []}
              onChange={(options) => onChange({ options })}
            />
          </div>
        )}
      </Section>

      {/* CTA LABEL */}
      <Section title="Botón de acción">
        <Input
          label="Texto del botón (opcional)"
          value={v.ctaLabel ?? ""}
          onChange={(e) => onChange({ ctaLabel: e.target.value || undefined })}
          help="Si lo dejas vacío se usará el texto por defecto según el tipo."
          placeholder="Ej. Personalizar mi rompecabezas"
        />
      </Section>
    </div>
  );
}

// ---------- FEATURES EDITOR ----------

function FeaturesEditor({
  features,
  onChange,
}: {
  features: NonNullable<AdminProduct["features"]>;
  onChange: (f: NonNullable<AdminProduct["features"]>) => void;
}) {
  const add = () =>
    onChange([...features, { id: uid("f"), text: "", order: features.length }]);
  const update = (id: string, text: string) =>
    onChange(features.map((f) => (f.id === id ? { ...f, text } : f)));
  const remove = (id: string) => onChange(features.filter((f) => f.id !== id));
  const move = (id: string, dir: -1 | 1) => {
    const idx = features.findIndex((f) => f.id === id);
    const target = idx + dir;
    if (target < 0 || target >= features.length) return;
    const next = [...features];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next.map((f, i) => ({ ...f, order: i })));
  };

  return (
    <div className="space-y-3">
      {features.length === 0 && (
        <p className="text-sm text-ink-muted">
          Aún no hay características. Agrega la primera.
        </p>
      )}
      {features.map((f, idx) => (
        <div
          key={f.id}
          className="flex items-center gap-2 bg-paper-soft rounded-2xl border-2 border-ink/10 p-3"
        >
          <input
            value={f.text}
            onChange={(e) => update(f.id, e.target.value)}
            placeholder="Ej. 6 páginas para colorear"
            className="flex-1 bg-transparent px-2 py-1 outline-none"
          />
          <button
            type="button"
            onClick={() => move(f.id, -1)}
            disabled={idx === 0}
            className="text-ink-muted hover:text-ink disabled:opacity-30 px-2"
            title="Subir"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => move(f.id, 1)}
            disabled={idx === features.length - 1}
            className="text-ink-muted hover:text-ink disabled:opacity-30 px-2"
            title="Bajar"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => remove(f.id)}
            className="text-brand-red font-bold px-2"
            title="Eliminar"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="bg-ink text-paper font-bold rounded-full px-4 py-2 text-sm"
      >
        + Agregar característica
      </button>
    </div>
  );
}

// ---------- IMAGE UPLOADER ----------

function ImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange([...images, reader.result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((src, idx) => (
          <div
            key={idx}
            className="relative aspect-square rounded-2xl border-2 border-ink overflow-hidden bg-paper-soft group"
          >
            <img src={src} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
            {idx === 0 && (
              <span className="absolute top-2 left-2 bg-brand-yellow text-ink text-xs font-bold rounded-full px-2 py-0.5 border-2 border-ink">
                Principal
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 p-2 flex items-center justify-center gap-1 bg-gradient-to-t from-ink/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="bg-paper text-ink font-bold rounded-full w-7 h-7 disabled:opacity-30"
                title="Subir"
              >
                ←
              </button>
              <button
                onClick={() => move(idx, 1)}
                disabled={idx === images.length - 1}
                className="bg-paper text-ink font-bold rounded-full w-7 h-7 disabled:opacity-30"
                title="Bajar"
              >
                →
              </button>
              <button
                onClick={() => remove(idx)}
                className="bg-brand-red text-paper font-bold rounded-full w-7 h-7"
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        <label className="aspect-square rounded-2xl border-2 border-dashed border-ink/40 flex flex-col items-center justify-center cursor-pointer hover:border-ink transition-colors text-ink-muted hover:text-ink">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-xs font-semibold mt-1">Agregar imagen</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              files.forEach(handleFile);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <Input
        label="O pegar URL"
        placeholder="https://…"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            const v = (e.target as HTMLInputElement).value.trim();
            if (v) {
              onChange([...images, v]);
              (e.target as HTMLInputElement).value = "";
            }
          }
        }}
        help="Presiona Enter para agregarla."
      />
    </div>
  );
}

// ---------- OPTIONS EDITOR ----------

function OptionsEditor({
  options,
  onChange,
}: {
  options: ProductOption[];
  onChange: (o: ProductOption[]) => void;
}) {
  const add = () => {
    const opt: ProductOption = {
      id: uid("opt"),
      productId: "",
      name: `opcion-${options.length + 1}`,
      label: `Opción ${options.length + 1}`,
      type: "text",
      required: false,
      order: options.length,
      isActive: true,
      options: [],
      allowOther: true,
    };
    onChange([...options, opt]);
  };
  const update = (id: string, patch: Partial<ProductOption>) =>
    onChange(options.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  const remove = (id: string) => onChange(options.filter((o) => o.id !== id));

  return (
    <div className="space-y-4">
      <div className="bg-paper-soft rounded-2xl border-2 border-ink/10 p-4 text-sm text-ink-muted">
        <p className="font-semibold text-ink mb-1">Configurador del cliente</p>
        <p>
          Define aquí qué información debe proporcionar quien pide este producto. El cliente verá
          estos campos en el configurador y podrá elegir &quot;Otro&quot; cuando aplique.
        </p>
      </div>

      {options.length === 0 && (
        <p className="text-sm text-ink-muted">
          Todavía no hay campos. Agrega el primero.
        </p>
      )}

      {options.map((opt) => (
        <OptionEditor
          key={opt.id}
          option={opt}
          onUpdate={(patch) => update(opt.id, patch)}
          onRemove={() => remove(opt.id)}
        />
      ))}

      <button
        type="button"
        onClick={add}
        className="bg-ink text-paper font-bold rounded-full px-4 py-2 text-sm"
      >
        + Agregar campo de personalización
      </button>
    </div>
  );
}

function OptionEditor({
  option,
  onUpdate,
  onRemove,
}: {
  option: ProductOption;
  onUpdate: (patch: Partial<ProductOption>) => void;
  onRemove: () => void;
}) {
  const needsList = ["select", "radio", "checkbox"].includes(option.type);
  const needsMinMax = option.type === "number";

  return (
    <div className="bg-paper rounded-3xl border-2 border-ink shadow-sticker-sm p-5">
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          label="Nombre interno"
          value={option.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="theme"
          help="Identificador sin espacios (se usará en el mensaje de WhatsApp)."
        />
        <Input
          label="Etiqueta visible"
          value={option.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder="Temática"
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <Select
          label="Tipo de campo"
          value={option.type}
          onChange={(e) =>
            onUpdate({ type: e.target.value as FieldTypeExt, options: [] })
          }
        >
          <option value="text">Texto</option>
          <option value="textarea">Texto largo</option>
          <option value="number">Número</option>
          <option value="select">Lista desplegable</option>
          <option value="radio">Selección única (radio)</option>
          <option value="checkbox">Selección múltiple</option>
          <option value="date">Fecha</option>
          <option value="file">Archivo</option>
          <option value="image">Imagen</option>
        </Select>
        <Input
          label="Placeholder"
          value={option.placeholder ?? ""}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          placeholder="Ej. Cumpleaños de dinosaurios"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-4">
        <Toggle
          label="Obligatorio"
          checked={option.required}
          onChange={(x) => onUpdate({ required: x })}
        />
        <Toggle
          label="Activo"
          checked={option.isActive}
          onChange={(x) => onUpdate({ isActive: x })}
        />
        {needsList && (
          <Toggle
            label="Permitir 'Otro'"
            checked={option.allowOther ?? true}
            onChange={(x) => onUpdate({ allowOther: x })}
            help="El cliente puede escribir una opción no listada."
          />
        )}
      </div>

      {needsList && (
        <FieldBuilder
          label="Opciones disponibles"
          values={option.options ?? []}
          onChange={(opts) => onUpdate({ options: opts })}
        />
      )}

      {needsMinMax && (
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Input
            type="number"
            label="Mínimo"
            value={option.min ?? 0}
            onChange={(e) => onUpdate({ min: Number(e.target.value) })}
          />
          <Input
            type="number"
            label="Máximo"
            value={option.max ?? 100}
            onChange={(e) => onUpdate({ max: Number(e.target.value) })}
          />
        </div>
      )}

      {option.type === "file" && (
        <Input
          label="Formatos aceptados"
          value={option.accept ?? ""}
          onChange={(e) => onUpdate({ accept: e.target.value })}
          placeholder=".jpg,.png,.pdf"
          help="Extensión con punto, separadas por coma."
        />
      )}

      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onRemove}
          className="text-sm font-bold bg-brand-red text-paper rounded-full px-4 py-1.5"
        >
          Eliminar campo
        </button>
      </div>
    </div>
  );
}
