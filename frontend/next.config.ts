import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none",
          },
        ],
      },
    ];
  },
  i18n: {
    locales: ["en", "fr", "es"],
    defaultLocale: "en",
  },
  images: {
    domains: ["giaohangtietkiem.vn"],
  },
};

export default nextConfig;
