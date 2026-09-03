import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-ink text-paper hover:bg-opacity-90 shadow-sticker hover:shadow-sticker-lg hover:-translate-y-0.5",
    secondary: "bg-brand-yellow text-ink hover:bg-opacity-90 shadow-sticker hover:shadow-sticker-lg hover:-translate-y-0.5",
    outline: "border-2 border-ink text-ink hover:bg-ink hover:text-paper",
    ghost: "text-ink hover:bg-paper-cream",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const classes = cn(baseStyles, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
