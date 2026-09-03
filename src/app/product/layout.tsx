import { Metadata } from "next";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Producto",
  description: siteConfig.siteDescription,
};

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
