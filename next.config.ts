import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mark native modules as server-only (not bundled by webpack)
  serverExternalPackages: ["better-sqlite3", "bcryptjs"],

  // Allow images from any origin in dev
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Disable x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
