import type { Metadata } from "next";
import { Fredoka, Manrope } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CreativeBackground } from "@/components/layout/CreativeBackground";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { siteConfig } from "@/lib/config";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${siteConfig.siteName}`,
    default: `${siteConfig.siteName} — ${siteConfig.tagline}`,
  },
  description: siteConfig.siteDescription,
  keywords: ["papelería", "creativa", "personalizados", "invitaciones", "regalos", "colorear"],
  authors: [{ name: siteConfig.brandName }],
  creator: siteConfig.brandName,
  metadataBase: siteConfig.siteUrl ? new URL(siteConfig.siteUrl) : undefined,
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: siteConfig.siteName,
    title: `${siteConfig.siteName} — ${siteConfig.tagline}`,
    description: siteConfig.siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.siteName} — ${siteConfig.tagline}`,
    description: siteConfig.siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fredoka.variable} ${manrope.variable}`}>
      <body>
        <CartProvider>
          <CreativeBackground />
          <div className="relative z-10">
            <Header />
            <main>{children}</main>
            <Footer />
            <WhatsAppButton />
            <CartDrawer />
            <ScrollToTop />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
