import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-6xl md:text-8xl font-bold text-ink mb-4">404</h1>
        <p className="text-xl text-ink-muted mb-8">
          Oops! Esta página no existe.
        </p>
        <Link
          href="/"
          className="inline-block bg-ink text-paper font-bold rounded-full px-8 py-3 hover:bg-opacity-90 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
