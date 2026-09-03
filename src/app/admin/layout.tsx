import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Papelillo",
  description: "Panel administrativo de Papelillo.",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // El layout del admin es minimalista: las páginas hijas se encargan
  // de su propio contenido (login no usa sidebar, el resto sí).
  return <>{children}</>;
}
