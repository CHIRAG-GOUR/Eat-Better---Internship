/**
 * Media URL resolver.
 * Images are loaded statically from the hosting CDN (Firebase / Vercel).
 * Videos are streamed directly from the Git repository (GitHub raw) to save
 * hosting bandwidth and ensure reliable chunked video streaming.
 */

export const GIT_MEDIA_BASE =
  process.env.NEXT_PUBLIC_GIT_MEDIA_BASE ||
  "https://raw.githubusercontent.com/CHIRAG-GOUR/Eat-Better---Internship/main/public";

export function getMediaUrl(path: string | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Stream video files (.mp4, .webm, .mov) from Git
  if (/\.(mp4|webm|mov)$/i.test(path)) {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${GIT_MEDIA_BASE}${cleanPath}`;
  }

  // All other assets (images, svg, webp) load from the local/hosting root
  return path;
}
