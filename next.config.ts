import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Default is 1 MB; lifted to allow avatar uploads (max 5 MB enforced server-side).
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    remotePatterns: [
      // dev local
      { protocol: "http", hostname: "localhost", port: "9000", pathname: "/**" },
      // dentro da rede Docker (service name)
      { protocol: "http", hostname: "minio", port: "9000", pathname: "/**" },
    ],
  },
};

export default nextConfig;
