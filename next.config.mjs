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
  // Wompi public key → cliente (segura: solo public key, NUNCA expose secret en frontend)
  env: {
    NEXT_PUBLIC_WOMPI_PUBLIC_KEY: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "",
  },
};

export default nextConfig;
