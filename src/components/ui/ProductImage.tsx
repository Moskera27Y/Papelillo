import React from "react";

interface ProductImageProps {
  images: string[] | null | undefined;
  productName: string;
  color?: "red" | "yellow" | "green" | "blue" | "ink";
  className?: string;
}

// Placeholder ilustrado cuando no hay imágenes reales.
// Reemplaza con <img src={images[0]} /> cuando tengas fotos reales en public/images/products/.

export function ProductImage({ images, productName, color = "red", className = "" }: ProductImageProps) {
  const safeImages: string[] = Array.isArray(images) ? images.filter(Boolean) : [];
  const bgColors = {
    red: "#FFE8E9",
    yellow: "#FFF8D6",
    green: "#E8F7D6",
    blue: "#E6EEFB",
    ink: "#F5F5F5",
  };

  const accentColors = {
    red: "#FF2B32",
    yellow: "#FFD000",
    green: "#78D64B",
    blue: "#5274E8",
    ink: "#0A0A0A",
  };

  const bg = bgColors[color] || bgColors.red;
  const accent = accentColors[color] || accentColors.ink;

  // Render real de imagen cuando existe
  if (safeImages.length > 0) {
    return (
      <div className={`relative overflow-hidden rounded-3xl ${className}`}>
        <img src={safeImages[0]} alt={productName || "Producto"} className="w-full h-full object-cover" />
      </div>
    );
  }

  // Placeholder SVG ilustrado
  return (
    <div
      className={`relative overflow-hidden rounded-3xl flex items-center justify-center ${className}`}
      style={{ backgroundColor: bg }}
    >
      <svg width="100%" height="100%" viewBox="0 0 200 200" aria-hidden="true">
        {/* Fondo decorativo */}
        <circle cx="100" cy="100" r="80" fill={accent} opacity="0.1" />
        {/* Elementos decorativos */}
        <circle cx="60" cy="60" r="15" fill={accent} opacity="0.3" />
        <circle cx="140" cy="140" r="20" fill={accent} opacity="0.2" />
        <rect x="130" y="40" width="30" height="30" fill={accent} opacity="0.25" transform="rotate(15 145 55)" />
        {/* Texto del producto */}
        <text
          x="100"
          y="100"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={accent}
          fontSize="18"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
        >
          {(productName ?? "Producto").length > 20 ? (productName ?? "Producto").slice(0, 18) + "..." : productName ?? "Producto"}
        </text>
        {/* Estrella decorativa */}
        <g transform="translate(160, 60) scale(0.8)">
          <path
            d="M0,-20 L5.88,-6.18 L19.51,-6.18 L8.78,2.36 L12.94,16.18 L0,8 L-12.94,16.18 L-8.78,2.36 L-19.51,-6.18 L-5.88,-6.18 Z"
            fill={accent}
            opacity="0.4"
          />
        </g>
      </svg>
    </div>
  );
}
