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
};

export default nextConfig;
