import React from "react";

/**
 * Skeleton card para ProductCard.
 * Reproduce la estructura visual exacta para que la transición sea fluida.
 */
export function ProductSkeleton() {
  return (
    <div className="bg-paper rounded-3xl border-2 border-ink/10 overflow-hidden" aria-hidden="true">
      {/* Image area */}
      <div className="skeleton aspect-square w-full" />

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Name */}
        <div className="skeleton skeleton-text w-3/4 h-5" />
        {/* Description */}
        <div className="skeleton skeleton-text w-full h-4" />
        <div className="skeleton skeleton-text w-2/3 h-4" />
        {/* Price */}
        <div className="skeleton skeleton-text w-1/3 h-5 mt-2" />
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <div className="skeleton h-9 rounded-full flex-1" />
          <div className="skeleton h-9 rounded-full w-10" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
