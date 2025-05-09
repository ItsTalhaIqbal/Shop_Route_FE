import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: isDevelopment ? "localhost" : "www.exampledomain.com",
        port: isDevelopment ? "5000" : undefined, 
      },
    ],
  },
};

export default nextConfig;
