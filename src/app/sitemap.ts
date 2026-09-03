import { MetadataRoute } from "next";
import { products } from "@/data/products";
import { siteConfig } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.siteUrl || "https://papelillo.co";

  const staticRoutes = [
    "",
    "/shop",
    "/personalizados",
    "/nosotros",
    "/contacto",
    "/politica-privacidad",
    "/terminos",
    "/envios",
    "/cambios-devoluciones",
    "/preguntas-frecuentes",
  ];

  const staticPages = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const productPages = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
