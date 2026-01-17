import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "utfs.io" },
      { hostname: "images.unsplash.com" }
    ]
  }
};

export default nextConfig;
