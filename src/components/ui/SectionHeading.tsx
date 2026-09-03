import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", className)}>
      {eyebrow && (
        <p className="text-sm font-bold uppercase tracking-widest text-brand-red mb-2">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-ink leading-tight mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-ink-muted max-w-2xl mx-auto">{description}</p>
      )}
    </div>
  );
}
