"use client";

import React, { useState } from "react";
import type { FieldTypeExt, ProductOption } from "@/types/admin";

interface Props {
  option: ProductOption;
  value: string | number | boolean | string[] | { value: string; otherText?: string } | undefined;
  onChange: (v: string | number | boolean | string[] | { value: string; otherText?: string }) => void;
  error?: string;
}

export function DynamicField({ option, value, onChange, error }: Props) {
  const currentValue = value ?? (option.defaultValue as typeof value);

  const handleChange = (v: typeof value) => {
    onChange(v);
  };

  const isOtherSelected =
    typeof currentValue === "object" && currentValue !== null && !Array.isArray(currentValue)
      ? currentValue.value === "__other__"
      : false;

  const otherText =
    typeof currentValue === "object" && currentValue !== null && !Array.isArray(currentValue)
      ? currentValue.otherText ?? ""
      : "";

  switch (option.type) {
    case "text":
      return (
        <div>
          <label className="block text-sm font-semibold text-ink mb-2">
            {option.label}
            {option.required && <span className="text-brand-red ml-1">*</span>}
          </label>
          <input
            type="text"
            value={(currentValue as string) ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={option.placeholder}
            className="w-full px-4 py-2.5 border-2 border-ink rounded-full bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          {error && <p className="text-xs text-brand-red mt-1 font-semibold">{error}</p>}
        </div>
      );

    case "textarea":
      return (
        <div>
          <label className="block text-sm font-semibold text-ink mb-2">
            {option.label}
            {option.required && <span className="text-brand-red ml-1">*</span>}
          </label>
          <textarea
            value={(currentValue as string) ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={option.placeholder}
            rows={4}
            className="w-full px-4 py-3 border-2 border-ink rounded-2xl bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          {error && <p className="text-xs text-brand-red mt-1 font-semibold">{error}</p>}
        </div>
      );

    case "number":
      return (
        <div>
          <label className="block text-sm font-semibold text-ink mb-2">
            {option.label}
            {option.required && <span className="text-brand-red ml-1">*</span>}
          </label>
          <input
            type="number"
            value={(currentValue as number) ?? ""}
            onChange={(e) => handleChange(Number(e.target.value))}
            min={option.min}
            max={option.max}
            placeholder={option.placeholder}
            className="w-full px-4 py-2.5 border-2 border-ink rounded-full bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          {error && <p className="text-xs text-brand-red mt-1 font-semibold">{error}</p>}
        </div>
      );

    case "select":
      return (
        <div>
          <label className="block text-sm font-semibold text-ink mb-2">
            {option.label}
            {option.required && <span className="text-brand-red ml-1">*</span>}
          </label>
          <select
            value={isOtherSelected ? "__other__" : (currentValue as string) ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__other__") {
                handleChange({ value: "__other__", otherText: "" });
              } else {
                handleChange(v);
              }
            }}
            className="w-full px-4 py-2.5 border-2 border-ink rounded-full bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="">Selecciona…</option>
            {option.options?.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            {option.allowOther && <option value="__other__">Otro (especificar)</option>}
          </select>
          {isOtherSelected && (
            <input
              type="text"
              value={otherText}
              onChange={(e) =>
                handleChange({ value: "__other__", otherText: e.target.value })
              }
              placeholder="Cuéntanos qué tienes en mente…"
              className="mt-3 w-full px-4 py-2.5 border-2 border-ink rounded-full bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          )}
          {error && <p className="text-xs text-brand-red mt-1 font-semibold">{error}</p>}
        </div>
      );

    case "radio":
      return (
        <div>
          <label className="block text-sm font-semibold text-ink mb-3">
            {option.label}
            {option.required && <span className="text-brand-red ml-1">*</span>}
          </label>
          <div className="space-y-2">
            {option.options?.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-3 cursor-pointer bg-paper-soft rounded-2xl border-2 border-ink/10 px-4 py-3 hover:border-ink transition-colors"
              >
                <input
                  type="radio"
                  name={option.name}
                  value={opt}
                  checked={currentValue === opt}
                  onChange={() => handleChange(opt)}
                  className="w-4 h-4"
                />
                <span className="font-medium">{opt}</span>
              </label>
            ))}
            {option.allowOther && (
              <label className="flex items-center gap-3 cursor-pointer bg-paper-soft rounded-2xl border-2 border-ink/10 px-4 py-3 hover:border-ink transition-colors">
                <input
                  type="radio"
                  name={option.name}
                  value="__other__"
                  checked={isOtherSelected}
                  onChange={() => handleChange({ value: "__other__", otherText: "" })}
                  className="w-4 h-4"
                />
                <span className="font-medium">Otro (especificar)</span>
              </label>
            )}
          </div>
          {isOtherSelected && (
            <input
              type="text"
              value={otherText}
              onChange={(e) =>
                handleChange({ value: "__other__", otherText: e.target.value })
              }
              placeholder="Cuéntanos qué tienes en mente…"
              className="mt-3 w-full px-4 py-2.5 border-2 border-ink rounded-full bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          )}
          {error && <p className="text-xs text-brand-red mt-1 font-semibold">{error}</p>}
        </div>
      );

    case "checkbox":
      const arr = Array.isArray(currentValue) ? currentValue : [];
      return (
        <div>
          <label className="block text-sm font-semibold text-ink mb-3">
            {option.label}
            {option.required && <span className="text-brand-red ml-1">*</span>}
          </label>
          <div className="space-y-2">
            {option.options?.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-3 cursor-pointer bg-paper-soft rounded-2xl border-2 border-ink/10 px-4 py-3 hover:border-ink transition-colors"
              >
                <input
                  type="checkbox"
                  checked={arr.includes(opt)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...arr, opt]
                      : arr.filter((x) => x !== opt);
                    handleChange(next);
                  }}
                  className="w-4 h-4"
                />
                <span className="font-medium">{opt}</span>
              </label>
            ))}
          </div>
          {error && <p className="text-xs text-brand-red mt-1 font-semibold">{error}</p>}
        </div>
      );

    case "date":
      return (
        <div>
          <label className="block text-sm font-semibold text-ink mb-2">
            {option.label}
            {option.required && <span className="text-brand-red ml-1">*</span>}
          </label>
          <input
            type="date"
            value={(currentValue as string) ?? ""}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-ink rounded-full bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          {error && <p className="text-xs text-brand-red mt-1 font-semibold">{error}</p>}
        </div>
      );

    case "file":
    case "image":
      return (
        <div>
          <label className="block text-sm font-semibold text-ink mb-2">
            {option.label}
            {option.required && <span className="text-brand-red ml-1">*</span>}
          </label>
          <input
            type="file"
            accept={option.accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") {
                  handleChange(reader.result);
                }
              };
              reader.readAsDataURL(file);
            }}
            className="w-full px-4 py-2.5 border-2 border-ink rounded-2xl bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-ink file:text-paper file:font-bold file:cursor-pointer"
          />
          {typeof currentValue === "string" && currentValue.startsWith("data:") && (
            <div className="mt-3">
              <img src={currentValue} alt="Preview" className="max-h-40 rounded-2xl border-2 border-ink" />
            </div>
          )}
          {error && <p className="text-xs text-brand-red mt-1 font-semibold">{error}</p>}
        </div>
      );

    default:
      return (
        <div>
          <p className="text-sm text-ink-muted">
            Tipo de campo no soportado: {option.type}
          </p>
        </div>
      );
  }
}
