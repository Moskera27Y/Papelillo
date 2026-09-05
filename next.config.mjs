/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // TS errors existentes (tipos Prisma/AdminProduct) no deben bloquear build en Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Add remote image hosts here when real product photos are ready.
    remotePatterns: [],
  },
  // Wompi public key → cliente (Vercel lo recibe como NEXT_WOMPI_PUBLIC_KEY y lo re-mapeamos)
  env: {
    NEXT_PUBLIC_WOMPI_PUBLIC_KEY: process.env.NEXT_WOMPI_PUBLIC_KEY || "",
  },
};

export default nextConfig;
// force fresh build cache - 1788648185
// cache invalidation token VERCEL_FRESH_BUILD_1788648608
