import type { NextConfig } from "next";

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)", // Apply to all routes
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none", // Fixes Google OAuth popup issue
          },
          // {
          //   key: "Cross-Origin-Embedder-Policy",
          //   value: "require-corp", // Ensures security for cross-origin resources
          // },
        ],
      },
    ];
  },
  i18n: {
    locales: ["en", "fr", "es"],
    defaultLocale: "en",
    localeDetection: true,
  },
};

export default nextConfig;
