import type { Metadata, Viewport } from "next";
import { fredoka, figtree, madeTommy } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eat Better Co Internship · SkilliZee",
  description: "SkilliZee × Eat Better Co virtual internship — design-direction prototypes.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#FFF5EE",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${madeTommy.variable} ${figtree.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
