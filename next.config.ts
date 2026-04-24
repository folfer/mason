import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
