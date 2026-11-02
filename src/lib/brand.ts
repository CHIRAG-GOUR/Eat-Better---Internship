/**
 * Eat Better Co brand reference — collected from eatbetterco.com on 2026-11-02.
 *
 * Provenance:
 *  - "site-css"   → CSS custom properties in the live Shopify theme (theme.css + inline :root)
 *  - "logo-svg"   → fill colour of the official logo file (eat-better-logo-2025_1.svg)
 *  - "photo"      → sampled from official product photography (approximate, lighting-dependent)
 *
 * Product facts below are copied from official product pages. Nothing here is invented;
 * anything a student creates is a design exercise and is labelled as such in the UI.
 */

export type Swatch = {
  name: string;
  hex: string;
  role: string;
  source: "site-css" | "logo-svg" | "photo";
};

export const BRAND_CORE: Swatch[] = [
  { name: "Better Orange", hex: "#FF5C00", role: "Primary action, buttons, footer, accents", source: "site-css" },
  { name: "Cocoa", hex: "#2F1C1A", role: "Primary text, outlines", source: "site-css" },
  { name: "Cocoa Soft", hex: "#4A3230", role: "Secondary text, button outlines", source: "site-css" },
  { name: "Logo Chocolate", hex: "#603A38", role: "Wordmark colour", source: "logo-svg" },
  { name: "Peach", hex: "#FEE7D5", role: "Header, dialogs, image grids", source: "site-css" },
  { name: "Cream", hex: "#FFF5EE", role: "Primary background", source: "site-css" },
  { name: "Haldi Yellow", hex: "#FED300", role: "Badges, stars, highlights", source: "site-css" },
];

export const STUDIO_TONES: Swatch[] = [
  { name: "Festive Maroon", hex: "#550D10", role: "Laddoo & gifting backdrops", source: "photo" },
  { name: "Chocolate", hex: "#381C11", role: "Laddoo hero backdrops", source: "photo" },
  { name: "Terracotta", hex: "#AF4300", role: "Nut-mix backdrops", source: "photo" },
  { name: "Mustard", hex: "#E7BA68", role: "Tin & festive backdrops", source: "photo" },
  { name: "Forest", hex: "#35401D", role: "Millet range backdrops", source: "photo" },
  { name: "Brass", hex: "#C8963E", role: "Brass props, festive accents", source: "photo" },
  { name: "Table Sand", hex: "#B18F74", role: "Tabletop surfaces", source: "photo" },
];

export const FUNCTIONAL: Swatch[] = [
  { name: "Success", hex: "#00A341", role: "Positive feedback", source: "site-css" },
  { name: "Error", hex: "#F83A3A", role: "Problems, warnings", source: "site-css" },
];

/** Brand lines quoted from the website. */
export const BRAND_LINES = [
  "All indulgence. No guilt.",
  "Eat what you love",
  "Age old wisdom meets modern nutrition",
  "The joy of snacking, made better.",
  "Made in India for India",
];

export const BRAND_FACTS = [
  "10 Lac+ happy customers",
  "6-layer quality check on every batch",
  "Lab-tested nutrition",
  "No palm oil used",
  "FSSAI certified",
  "50,000 sq.ft. kitchen",
];

export const FOUNDER = {
  name: "Mridula Kanoria",
  role: "Founder, Eat Better Co",
  quote:
    "I started this kitchen because I was tired of choosing between tasty and healthy for my own family. Why can't chocolate laddoos have protein? Why can't bhujia be roasted and still be as delicious? Turns out, they can.",
};

export type PackFormat = "pouch" | "sachet" | "carton" | "tin";

export type ProductLine = "millet" | "nuts" | "laddoo" | "gifting";

export type ProductRef = {
  id: string;
  name: string;
  flavour: string;
  line: ProductLine;
  /** packaging format the official product ships in */
  officialFormat: PackFormat;
  /** official net quantities offered on the site */
  netQuantities: string[];
  /** short claims printed on official packs or stated on the product page */
  claims: string[];
  /** ingredient line as stated on the official page/pack */
  keyIngredients: string;
  /** official product photos (stored locally in /public/brand/products) */
  images: string[];
  url: string;
};

export const PRODUCTS: ProductRef[] = [
  {
    id: "millet-bhujia",
    name: "Millet Bhujia",
    flavour: "Pudina Masti",
    line: "millet",
    officialFormat: "pouch",
    netQuantities: ["100 g", "200 g", "400 g"],
    claims: ["Roasted not fried", "No palm oil", "No trans fat", "No cholesterol"],
    keyIngredients: "Millets, real masalas and a pudina twist",
    images: ["/brand/products/millet-bhujia-0.webp", "/brand/products/millet-bhujia-1.webp"],
    url: "https://eatbetterco.com/products/millet-bhujia-pudina-masti-bundle",
  },
  {
    id: "millet-bhel",
    name: "Millet Bhel",
    flavour: "Bombay Bhelpuri",
    line: "millet",
    officialFormat: "pouch",
    netQuantities: ["135 g", "270 g", "540 g"],
    claims: ["Roasted not fried", "No palm oil", "No trans fat", "No cholesterol"],
    keyIngredients: "Tangy, spicy millet snack inspired by Mumbai's bhelpuri",
    images: ["/brand/products/millet-bhel-0.webp"],
    url: "https://eatbetterco.com/products/millet-bhel-bombay-bundle",
  },
  {
    id: "nut-mix",
    name: "Premium Nut Mix",
    flavour: "Sweet & Savoury",
    line: "nuts",
    officialFormat: "pouch",
    netQuantities: ["100 g", "200 g"],
    claims: ["No added sugar", "100% natural ingredients", "No artificial flavours", "No preservatives"],
    keyIngredients: "Cashews, almonds, pistachios, golden and black raisins",
    images: ["/brand/products/nut-mix-0.webp", "/brand/products/nut-mix-2.webp"],
    url: "https://eatbetterco.com/products/premium-nut-mix-100g",
  },
  {
    id: "hazelnut-laddoo",
    name: "Hazelnut Chocolate Laddoos",
    flavour: "Hazelnut Chocolate",
    line: "laddoo",
    officialFormat: "sachet",
    netQuantities: ["40 g", "120 g", "240 g"],
    claims: ["Sweetened with dates", "No added sugar", "93% dry fruits & nuts", "Vegan & gluten-free"],
    keyIngredients: "Dates, hazelnuts, almonds, cocoa, vanilla extract, chia seeds & sea salt",
    images: ["/brand/products/hazelnut-laddoo-0.webp", "/brand/products/hazelnut-laddoo-1.webp"],
    url: "https://eatbetterco.com/products/hazelnut-chocolate-laddoos",
  },
  {
    id: "coffee-almond-laddoo",
    name: "Coffee Almond Laddoos",
    flavour: "Coffee Almond",
    line: "laddoo",
    officialFormat: "sachet",
    netQuantities: ["40 g", "120 g", "240 g"],
    claims: ["Sweetened with dates", "No added sugar", "93% dry fruits & nuts", "Vegan & gluten-free"],
    keyIngredients: "Roasted coffee, dates, almonds",
    images: ["/brand/products/coffee-almond-laddoo-0.webp"],
    url: "https://eatbetterco.com/products/coffee-almond-laddoo",
  },
  {
    id: "laddoo-box-24",
    name: "Assorted Laddoo Box",
    flavour: "24 laddoos · 6 flavours",
    line: "laddoo",
    officialFormat: "carton",
    netQuantities: ["240 g"],
    claims: ["Sweetened with dates", "No added sugar", "6 exciting flavours", "Dry fruits, nuts & seeds"],
    keyIngredients: "Six dry-fruit laddoo flavours, from hazelnut to orange",
    images: ["/brand/products/laddoo-box-24-0.webp", "/brand/products/laddoo-box-42-1.webp"],
    url: "https://eatbetterco.com/products/assorted-laddoo-box-24-laddoos-in-6-different-flavors",
  },
  {
    id: "laddoo-tin",
    name: "Assorted Laddoo Tin",
    flavour: "16 laddoos · 6 flavours",
    line: "gifting",
    officialFormat: "tin",
    netQuantities: ["160 g"],
    claims: ["Sweetened with dates", "No added sugar", "6 flavours", "Made in small batches"],
    keyIngredients: "Wholesome dry fruits, nuts and seeds",
    images: ["/brand/products/laddoo-tin-0.webp"],
    url: "https://eatbetterco.com/products/assorted-laddoo-box-round-tin",
  },
];

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];

/** Backdrop used by the 3D studio per product line, mirroring official photography. */
export const LINE_BACKDROP: Record<ProductLine, { cove: string; table: string; prop: "ceramic" | "brass" }> = {
  millet: { cove: "#35401D", table: "#C9AE90", prop: "ceramic" },
  nuts: { cove: "#AF4300", table: "#C9AE90", prop: "ceramic" },
  laddoo: { cove: "#550D10", table: "#C4A587", prop: "brass" },
  gifting: { cove: "#C98F3C", table: "#D9B98A", prop: "brass" },
};
