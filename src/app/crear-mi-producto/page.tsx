import type { Metadata } from "next";
import { Suspense } from "react";
import { Configurator } from "@/components/customizer/Configurator";
import { ProductGridSkeleton } from "@/components/shop/ProductSkeleton";

export const metadata: Metadata = {
  title: "Crear mi producto",
  description: "Diseña tu producto personalizado paso a paso con Papelillo.",
};

export default function CrearMiProductoPage() {
  return (
    <div className="min-h-screen bg-paper">
      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="skeleton skeleton-text w-96 h-12 mx-auto mb-4" />
            <div className="skeleton skeleton-text w-64 h-5 mx-auto" />
          </div>
          <ProductGridSkeleton count={6} />
        </div>
      }>
        <Configurator />
      </Suspense>
    </div>
  );
}
