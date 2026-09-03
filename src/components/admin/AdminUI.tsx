import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function AdminCard({ children, className, title, description, action }: CardProps) {
  return (
    <section
      className={cn(
        "bg-paper rounded-3xl border-2 border-ink shadow-sticker-sm p-6 lg:p-8",
        className
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 mb-6">
          <div>
            {title && <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>}
            {description && <p className="text-sm text-ink-muted mt-1">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
}

export function Input({ label, error, help, className, id, ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-4 py-2.5 border-2 border-ink rounded-full bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:opacity-60",
          error && "border-brand-red",
          className
        )}
        {...rest}
      />
      {help && !error && <p className="text-xs text-ink-muted">{help}</p>}
      {error && <p className="text-xs text-brand-red font-semibold">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  help?: string;
}

export function Textarea({ label, error, help, className, id, ...rest }: TextareaProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "w-full px-4 py-3 border-2 border-ink rounded-2xl bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue",
          error && "border-brand-red",
          className
        )}
        {...rest}
      />
      {help && !error && <p className="text-xs text-ink-muted">{help}</p>}
      {error && <p className="text-xs text-brand-red font-semibold">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  help?: string;
}

export function Select({ label, error, help, className, id, children, ...rest }: SelectProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          "w-full px-4 py-2.5 border-2 border-ink rounded-full bg-paper focus:outline-none focus:ring-2 focus:ring-brand-blue",
          error && "border-brand-red",
          className
        )}
        {...rest}
      >
        {children}
      </select>
      {help && !error && <p className="text-xs text-ink-muted">{help}</p>}
      {error && <p className="text-xs text-brand-red font-semibold">{error}</p>}
    </div>
  );
}

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  help?: string;
  disabled?: boolean;
}

export function Toggle({ label, checked, onChange, help, disabled }: ToggleProps) {
  return (
    <label className={cn("flex items-start gap-3 cursor-pointer", disabled && "opacity-60 cursor-not-allowed")}>
      <span
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-block w-11 h-6 rounded-full border-2 border-ink transition-colors",
          checked ? "bg-brand-green" : "bg-paper-soft"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-paper border-2 border-ink transition-transform",
            checked && "translate-x-5"
          )}
        />
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {help && <span className="block text-xs text-ink-muted">{help}</span>}
      </span>
    </label>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminBadge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-bold rounded-full px-2.5 py-0.5 border-2 border-ink",
        className ?? "bg-paper-soft text-ink"
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="inline-flex w-16 h-16 rounded-full bg-paper-soft items-center justify-center border-2 border-ink mb-4">
        <svg className="w-8 h-8 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="font-display text-xl font-bold text-ink mb-2">{title}</h3>
      {description && <p className="text-sm text-ink-muted mb-4 max-w-md mx-auto">{description}</p>}
      {action}
    </div>
  );
}

export function Toast({ type, message }: { type: "success" | "error" | "info"; message: string }) {
  const colors = {
    success: "bg-brand-green text-ink border-ink",
    error: "bg-brand-red text-paper border-ink",
    info: "bg-brand-blue text-paper border-ink",
  };
  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-6 right-6 z-50 rounded-2xl border-2 px-5 py-3 shadow-sticker-lg font-semibold text-sm animate-pop",
        colors[type]
      )}
    >
      {message}
    </div>
  );
}
