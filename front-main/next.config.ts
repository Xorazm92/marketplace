import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "api.phone-tech.uz"],
  },
};

export default nextConfig;
