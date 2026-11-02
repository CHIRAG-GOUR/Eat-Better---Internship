import type { NextConfig } from "next";

/** Vercel deployment config. Chapters are static pages (/1.1, /1.2 …) served from the edge CDN. */
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const week = "public, max-age=604800, stale-while-revalidate=86400";
    return [
      // large media: cache at the browser and CDN (files keep stable names, so not "immutable")
      { source: "/chapter-:n/video/:file*", headers: [{ key: "Cache-Control", value: week }] },
      { source: "/chapter-:n/:file*", headers: [{ key: "Cache-Control", value: week }] },
      { source: "/brand/:file*", headers: [{ key: "Cache-Control", value: week }] },
      // allow the LMS to embed chapters in an iframe and use fullscreen inside it
      {
        source: "/:path*",
        headers: [
          { key: "Permissions-Policy", value: "fullscreen=*" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
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
