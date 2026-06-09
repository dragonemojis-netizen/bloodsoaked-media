import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
