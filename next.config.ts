import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve originals from the CDN. `/_next/image` transformations are a
  // metered Vercel resource and were a likely source of credit burn after
  // the Library/collection covers and article screenshots went public.
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/collections",
        destination: "/collection",
        permanent: true,
      },
      {
        source: "/collections/:slug",
        destination: "/collection",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
