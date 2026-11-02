import { Fredoka, Figtree } from "next/font/google";
import localFont from "next/font/local";

/** Fredoka — heading face used on eatbetterco.com (theme --heading-font-family). */
export const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

/**
 * MADE TOMMY — Eat Better Co's body face (theme --text-font-family).
 * Self-hosted with partner approval (2026-11-02). The site ships Light/Medium/Bold/ExtraBold;
 * Medium is used as the reading weight.
 */
export const madeTommy = localFont({
  src: [
    { path: "../fonts/MADETOMMY-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/MADETOMMY-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/MADETOMMY-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-tommy",
  display: "swap",
  fallback: ["Figtree", "system-ui", "sans-serif"],
});

/** Figtree — fallback and the "Clean sans" option in the packaging studio. */
export const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});
