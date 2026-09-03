import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  color?: "red" | "yellow" | "green" | "blue" | "ink" | "paper";
  icon?: React.ReactNode;
  hint?: string;
  delay?: number;
}

const colorMap: Record<NonNullable<StatCardProps["color"]>, string> = {
  red: "bg-brand-red",
  yellow: "bg-brand-yellow",
  green: "bg-brand-green",
  blue: "bg-brand-blue",
  ink: "bg-ink text-paper",
  paper: "bg-paper",
};

export function StatCard({ label, value, color = "paper", icon, hint, delay = 0 }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border-2 border-ink shadow-sticker p-6 flex flex-col justify-between min-h-[140px]",
        "transition-all duration-300 hover:scale-105 hover:shadow-sticker-lg",
        "animate-fade-up group",
        colorMap[color]
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold uppercase tracking-wider">{label}</p>
        <div className="opacity-70 group-hover:animate-pulse-soft">
          {icon ?? (
            <div
              className={cn(
                "w-8 h-8 rounded-full",
                "group-hover:animate-spin-slow",
                color === "paper"
                  ? "bg-ink/20"
                  : "bg-white/20"
              )}
            />
          )}
        </div>
      </div>
      <div>
        <p className="font-display text-4xl font-bold">{value}</p>
        {hint && <p className="text-xs mt-1 opacity-80">{hint}</p>}
      </div>
    </div>
  );
}
