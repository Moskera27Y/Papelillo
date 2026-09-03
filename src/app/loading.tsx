import { CreativeBackground } from "@/components/layout/CreativeBackground";

export default function Loading() {
  return (
    <>
      <CreativeBackground />
      <div className="fixed inset-0 bg-paper/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ink font-semibold">Cargando...</p>
        </div>
      </div>
    </>
  );
}
