import { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Tienda",
  description: `Explora todos los productos de ${siteConfig.brandName}: papelería creativa, personalizados, invitaciones, cajas, stickers, rompecabezas y más.`,
  openGraph: {
    title: `Tienda | ${siteConfig.brandName}`,
    description: `Explora todos los productos de ${siteConfig.brandName}: papelería creativa, personalizados, invitaciones, cajas, stickers, rompecabezas y más.`,
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
