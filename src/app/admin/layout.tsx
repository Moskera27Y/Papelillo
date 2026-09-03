import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Papelillo",
  description: "Panel administrativo de Papelillo.",
  robots: { index: false, follow: false },
};

// Layout minimalista: cada página admin incluye su propio AuthGuard + AdminSidebar.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
