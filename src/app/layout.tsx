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
    url: siteConfig.siteUrl,
    siteName: siteConfig.siteName,
    title: `${siteConfig.siteName} — ${siteConfig.tagline}`,
    description: siteConfig.siteDescription,
    images: [
      {
        url: siteConfig.ogImage || `${siteConfig.siteUrl}/images/logo.png`,
        width: 1200,
        height: 630,
        alt: siteConfig.siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.siteName} — ${siteConfig.tagline}`,
    description: siteConfig.siteDescription,
    images: [siteConfig.ogImage || `${siteConfig.siteUrl}/images/logo.png`],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="system" className={`${fredoka.variable} ${manrope.variable}`}>
      <body
        className="bg-background text-foreground transition-colors duration-300"
      >
        <CartProvider>
          <CreativeBackground />
          {/* SEO JSON-LD Organization */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Papelillo",
                url: "https://papelillo-web-lilac.vercel.app",
                logo: "https://papelillo-web-lilac.vercel.app/images/logo.png",
                sameAs: ["https://instagram.com/papelillo", "https://facebook.com/papelillo"],
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+57 318 517 11 63",
                  email: "hola@papelillo.com.co",
                  contactType: "customer service",
                },
              }),
            }}
          />
          <div className="relative z-10">
            <Header />
            <main id="main">{children}</main>
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
