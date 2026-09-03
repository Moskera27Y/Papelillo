"use client";

import React, { useState } from "react";

interface Props {
  label?: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

/**
 * Editor de listas de texto (para opciones de select/radio/checkbox).
 */
export function FieldBuilder({
  label,
  values,
  onChange,
  placeholder = "Ej. Cumpleaños",
}: Props) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (values.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  };
  const remove = (idx: number) => onChange(values.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="mt-4">
      {label && <p className="text-sm font-semibold text-ink mb-2">{label}</p>}
      <div className="flex flex-wrap gap-2 mb-3">
        {values.length === 0 && (
          <span className="text-sm text-ink-muted">
            Sin opciones todavía.
          </span>
        )}
        {values.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-brand-yellow border-2 border-ink rounded-full px-3 py-1 text-sm font-semibold"
          >
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="text-ink/70 hover:text-ink disabled:opacity-30"
              title="Mover izquierda"
            >
              ←
            </button>
            <span>{v}</span>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === values.length - 1}
              className="text-ink/70 hover:text-ink disabled:opacity-30"
              title="Mover derecha"
            >
              →
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-ink hover:text-brand-red"
              title="Eliminar"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border-2 border-ink rounded-full bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue text-sm"
        />
        <button
          type="button"
          onClick={add}
          className="bg-ink text-paper font-bold rounded-full px-4 py-2 text-sm"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
