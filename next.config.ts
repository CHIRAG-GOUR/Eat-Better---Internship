import type { NextConfig } from "next";

/** Vercel deployment config. Chapters are static pages (/1.1, /1.2 …) served from the edge CDN. */
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    // Serve WebP images statically from the CDN (compatible with Firebase Hosting & Vercel)
    unoptimized: true,
  },
  async redirects() {
    // chapters are direct links; the bare domain opens Chapter 1.1 (temporary, so it can change later)
    return [{ source: "/", destination: "/1.1", permanent: false }];
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
