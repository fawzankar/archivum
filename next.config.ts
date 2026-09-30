import type { NextConfig } from "next";

const week = 60 * 60 * 24 * 7;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  async headers() {
    return [
      // Static images/icons/masks: cache hard, refresh quietly in the background.
      {
        source: "/:all*(svg|png|webp|ico|jpg|jpeg)",
        headers: [{ key: "Cache-Control", value: `public, max-age=${week}, stale-while-revalidate=${week * 4}` }],
      },
      // Bundled PDFs never change under the same name.
      {
        source: "/uploads/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${week}, stale-while-revalidate=${week * 4}` }],
      },
      { source: "/pdf.worker.min.mjs", headers: [{ key: "Cache-Control", value: `public, max-age=${week}, immutable` }] },
    ];
  },
};

export default nextConfig;
