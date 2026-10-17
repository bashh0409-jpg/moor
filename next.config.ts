import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    const cacheHeaders = [
      {
        key: "Cache-Control",
        value: "public, max-age=86400, stale-while-revalidate=604800",
      },
    ];
    const securityHeaders = [
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000",
      },
    ];

    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/gallery/:path*", headers: cacheHeaders },
      { source: "/splash.svg", headers: cacheHeaders },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
