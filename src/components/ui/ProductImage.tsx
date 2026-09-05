// ============================================================
// PRODUCT IMAGE — next/image + blur placeholder + fallthrough
// nextjs-debug-patterns: image optimization
// ============================================================
"use client";

import React from "react";
import Image from "next/image";

interface ProductImageProps {
  images: string[] | string | null | undefined;
  alt?: string;
  className?: string;
  priority?: boolean;
}

const PLACEHOLDER_IMG = "/images/placeholder.png";
// Valid base64 1x1 gray blur seed (prevents next/image crash on invalid blurDataURL)
// ✅ NOT an <svg> — raw PNG bytes avoid Edge optimization parser corruption (<path> Expected number)
const BLUR_FALLBACK = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export function ProductImage({ images, alt = "Producto", className = "", priority = false }: ProductImageProps) {
  const safeImages = React.useMemo(() => {
    if (!images) return [];
    if (Array.isArray(images)) return images.filter(Boolean);
    if (typeof images === "string") return [images];
    return [];
  }, [images]);

  const src = safeImages[0] || PLACEHOLDER_IMG;
  // blurDataURL must be a valid base64 data URI or null (not arbitrary image URL)
  const candidate = safeImages[1];
  const blurDataURL = candidate && candidate.startsWith("data:image") ? candidate : null;

  // For fill to work, parent must be position:relative — wrap in div
  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        quality={85}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL || BLUR_FALLBACK}
        onError={(e) => {
          const tgt = e.currentTarget as HTMLImageElement;
          tgt.onerror = null; // Prevent infinite re-render loop
          if (tgt.src !== PLACEHOLDER_IMG) tgt.src = PLACEHOLDER_IMG;
        }}
      />
      {safeImages.length === 0 && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L10 12l2.586-2.586M4.5 6h15a2 2 0 012 2v10a2 2 0 01-2 2h-2l-4.586-4.586M6.5 6h11a2 2 0 012 2v10a2 2 0 01-2 2H6.5a2 2 0 01-2-2V8a2 2 0 012-2z" />
          </svg>
        </div>
      )}
    </div>
  );
}