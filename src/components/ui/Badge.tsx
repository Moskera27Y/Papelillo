import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: "red" | "yellow" | "green" | "blue" | "ink";
  className?: string;
}

export function Badge({ children, color = "ink", className }: BadgeProps) {
  const colorClasses = {
    red: "bg-brand-red text-ink",
    yellow: "bg-brand-yellow text-ink",
    green: "bg-brand-green text-ink",
    blue: "bg-brand-blue text-paper",
    ink: "bg-ink text-paper",
  };

  return (
    <span
      className={cn(
        "inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full",
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
}
