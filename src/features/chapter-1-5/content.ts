/**
 * Chapter 1.5 — The Product Portfolio.
 * SOURCE OF TRUTH: chapter content supplied by SkilliZee (2026-11-03): objective, the Category table,
 * the Occasions table, the key takeaway and Think & discuss. Product names come from the official
 * packs / eatbetterco.com (see src/lib/brand.ts). Anything marked "practice scenario" or
 * "general explanation" is a teaching aid, not a company claim.
 */

export const CHAPTER = {
  module: "Module 1",
  number: "1.5",
  title: ["The Product", "Portfolio"] as [string, string],
  subtitle: "Laddoos, namkeens, nut mixes and gift boxes — how one brand fits a family's whole year.",
  objective:
    "Examine the healthy sweets and laddoos, namkeens, and seeds & nuts mixes: ingredients, health positioning, occasions (daily, festive, gifting) and how new products are developed.",
};

/** Same clip as Chapter 1.3 — Eat Better Co's own channel, self-hosted lossless copies. */
export const VIDEO = {
  title: "Diwali Corporate Gifting, Done Thoughtfully | Inside Eat Better Co",
  av1: "/chapter-1-3/video/diwali-gifting-av1.mp4",
  h264: "/chapter-1-3/video/diwali-gifting-h264.mp4",
  poster: "/chapter-1-3/video/gifting-poster.jpg",
  caption: "Inside Eat Better Co: festive and corporate gifting — from the brand's own channel.",
};

export type CategoryId = "laddoos" | "namkeens" | "nuts" | "gifting";

/* ── Category table (verbatim) ─────────────────────────────────── */
export const CATEGORIES: { id: CategoryId; name: string; includes: string; positioning: string; color: string; imgs: string[] }[] = [
  {
    id: "laddoos",
    name: "Sweets & Laddoos",
    includes: "Dry-fruit laddoos in six flavours, sold in assorted boxes of 24 and 42; protein laddoos",
    positioning: "Sweetened with dates",
    color: "#550D10",
    imgs: ["/brand/products/laddoo-box-24-0.webp", "/brand/products/laddoo-box-42-0.webp", "/brand/products/protein-laddoo-0.webp", "/brand/products/hazelnut-laddoo-1.webp"],
  },
  {
    id: "namkeens",
    name: "Namkeens",
    includes: "Roasted namkeens such as millet bhujia, millet bhel, and millet and quinoa varieties; assorted namkeen combo of 4",
    positioning: "Roasted, no palm oil",
    color: "#35401D",
    imgs: ["/brand/products/millet-bhujia-1.webp", "/brand/products/millet-bhel-0.webp", "/brand/products/quinoa-namkeen-0.webp", "/brand/products/namkeen-combo-0.webp"],
  },
  {
    id: "nuts",
    name: "Nuts & Mixes",
    includes: "Nut and seed mixes for everyday snacking",
    positioning: "Real ingredients, better-for-you snacking",
    color: "#AF4300",
    imgs: ["/brand/products/nut-mix-0.webp", "/brand/products/trail-mix-0.webp", "/brand/products/seed-mix-0.webp", "/brand/products/nut-mix-2.webp"],
  },
  {
    id: "gifting",
    name: "Combos & Gifting",
    includes: "Ultimate Snack Box (12 snacks), festive hampers for Rakhi and Diwali, corporate gifting",
    positioning: "Convenience and variety",
    color: "#C98F3C",
    imgs: ["/brand/products/snack-box-0.webp", "/brand/products/diwali-hamper-0.webp", "/brand/products/rakhi-hamper-0.webp", "/brand/products/snack-box-1.webp"],
  },
];

export type OccasionId = "daily" | "festive" | "gifting" | "corporate";

/* ── Occasions table (verbatim) ────────────────────────────────── */
export const OCCASIONS: { id: OccasionId; name: string; example: string; why: string; img: string }[] = [
  { id: "daily", name: "Daily snacking", example: "Namkeen packs, nut mixes, a laddoo with tea", why: "Guilt-free, easy to carry", img: "/brand/products/millet-bhujia-0.webp" },
  { id: "festive", name: "Festive", example: "Diwali and Rakhi hampers", why: "Healthier alternative to traditional mithai", img: "/brand/products/diwali-hamper-0.webp" },
  { id: "gifting", name: "Gifting", example: "Assorted laddoo boxes, snack boxes", why: "A thoughtful, health-conscious gift", img: "/brand/products/laddoo-box-24-0.webp" },
  { id: "corporate", name: "Corporate", example: "Bulk orders for teams and events", why: "Brands and offices choose snacks that feel good to give", img: "/chapter-1-5/frames/bulk-boxes.webp" },
];

/* ── Innovation Studio (main activity) ───────────────────────────
 * Product facts come only from the category table above and the official packs / eatbetterco.com
 * (src/lib/brand.ts). Everything the student creates is a DESIGN EXERCISE — not an Eat Better product,
 * not a recipe and not a nutritional formulation. No nutrition values are shown anywhere.
 */

/** Real products shown in the four product zones (pack fronts cut from official photos where available). */
export type ZoneProduct = { id: string; name: string; tex: string; shape: "sachet" | "pouch" | "box" };
export const ZONE_PRODUCTS: Record<CategoryId, ZoneProduct[]> = {
  laddoos: [
    { id: "hazelnut-laddoo", name: "Hazelnut Chocolate Laddoos", tex: "/chapter-1-3/packs/hazelnut-laddoo.webp", shape: "sachet" },
    { id: "protein-laddoo", name: "Protein Laddoos", tex: "/chapter-1-3/packs/protein-laddoo.webp", shape: "sachet" },
    { id: "laddoo-box-24", name: "Assorted Laddoo Box (24)", tex: "/brand/products/laddoo-box-24-0.webp", shape: "box" },
  ],
  namkeens: [
    { id: "millet-bhujia", name: "Millet Bhujia", tex: "/chapter-1-3/packs/millet-bhujia.webp", shape: "pouch" },
    { id: "millet-bhel", name: "Millet Bhel", tex: "/chapter-1-3/packs/millet-bhel.webp", shape: "pouch" },
    { id: "quinoa-namkeen", name: "Quinoa Namkeen", tex: "/chapter-1-3/packs/quinoa-namkeen.webp", shape: "pouch" },
  ],
  nuts: [
    { id: "nut-mix", name: "Premium Nut Mix", tex: "/chapter-1-3/packs/nut-mix.webp", shape: "pouch" },
    { id: "trail-mix", name: "Better Trail Mix", tex: "/chapter-1-3/packs/trail-mix.webp", shape: "pouch" },
    { id: "seed-mix", name: "Spiced Jaggery Seed Mix", tex: "/chapter-1-3/packs/seed-mix.webp", shape: "pouch" },
  ],
  gifting: [
    { id: "snack-box", name: "Ultimate Snack Box (12 snacks)", tex: "/brand/products/snack-box-0.webp", shape: "box" },
    { id: "diwali-hamper", name: "Diwali Hamper", tex: "/brand/products/diwali-hamper-0.webp", shape: "box" },
    { id: "rakhi-hamper", name: "Rakhi Hamper", tex: "/brand/products/rakhi-hamper-0.webp", shape: "box" },
  ],
};

export type IngredientId = "dates" | "millets" | "quinoa" | "almonds" | "cashews" | "hazelnuts" | "seeds" | "jaggery" | "masalas" | "cocoa" | "coffee" | "raisins";
export type Ingredient = { id: IngredientId; name: string; color: string; usedIn: string; source: string; fits: CategoryId[] };
/** `usedIn` quotes only official Eat Better product information; `fits` = categories where Eat Better already uses it. */
export const INGREDIENTS: Ingredient[] = [
  { id: "dates", name: "Dates", color: "#5A2A16", usedIn: "Eat Better's laddoos are sweetened with dates.", source: "Category table · official laddoo packs (“Sweetened with dates”)", fits: ["laddoos", "gifting"] },
  { id: "millets", name: "Millets", color: "#E2BE62", usedIn: "Used in roasted namkeens such as Millet Bhujia and Millet Bhel — “Millets, real masalas and a pudina twist”.", source: "Category table · official Millet Bhujia page", fits: ["namkeens", "gifting"] },
  { id: "quinoa", name: "Quinoa", color: "#E8D6A8", usedIn: "Eat Better has quinoa namkeen varieties, such as Quinoa Namkeen Chilli Lime.", source: "Category table · official pack", fits: ["namkeens", "gifting"] },
  { id: "almonds", name: "Almonds", color: "#B07A47", usedIn: "In the Premium Nut Mix, and in the Hazelnut Chocolate and Coffee Almond Laddoos.", source: "Official product pages", fits: ["nuts", "laddoos", "gifting"] },
  { id: "cashews", name: "Cashews", color: "#E6CF9F", usedIn: "In the Premium Nut Mix: “Cashews, almonds, pistachios, golden and black raisins”.", source: "Official Premium Nut Mix page", fits: ["nuts", "gifting"] },
  { id: "hazelnuts", name: "Hazelnuts", color: "#8B5A2B", usedIn: "In the Hazelnut Chocolate Laddoos: “Dates, hazelnuts, almonds, cocoa, vanilla extract, chia seeds & sea salt”.", source: "Official Hazelnut Chocolate Laddoos page", fits: ["laddoos", "gifting"] },
  { id: "seeds", name: "Seeds", color: "#8DA34B", usedIn: "The Spiced Jaggery seed mix: “Pumpkin, sunflower, melon, watermelon, sesame seeds roasted with jaggery, ginger”.", source: "Official Better Seed Mix pack", fits: ["nuts", "gifting"] },
  { id: "jaggery", name: "Jaggery", color: "#9B5A1A", usedIn: "The seeds in the Spiced Jaggery seed mix are roasted with jaggery.", source: "Official Better Seed Mix pack", fits: ["nuts", "gifting"] },
  { id: "masalas", name: "Real masalas", color: "#B3261E", usedIn: "Millet Bhujia is made with “millets, real masalas and a pudina twist”. The founders' first experiments used dates, millets and real masalas.", source: "Official Millet Bhujia page · Chapter 1.3", fits: ["namkeens", "gifting"] },
  { id: "cocoa", name: "Cocoa", color: "#3B2416", usedIn: "In the Hazelnut Chocolate Laddoos.", source: "Official Hazelnut Chocolate Laddoos page", fits: ["laddoos", "gifting"] },
  { id: "coffee", name: "Roasted coffee", color: "#3E2516", usedIn: "In the Coffee Almond Laddoos: “Roasted coffee, dates, almonds”.", source: "Official Coffee Almond Laddoos page", fits: ["laddoos", "gifting"] },
  { id: "raisins", name: "Raisins", color: "#4A1E2A", usedIn: "Golden and black raisins are in the Premium Nut Mix.", source: "Official Premium Nut Mix page", fits: ["nuts", "gifting"] },
];

/** Student choices — not company facts. */
export const CUSTOMERS = ["School kids and their parents", "College students", "Working professionals", "Grandparents", "Families celebrating festivals", "Office teams"];

/** Differentiators come from the category table's positioning and claims printed on official packs. */
export const DIFFERENTIATORS: { text: string; source: string; cat?: CategoryId }[] = [
  { text: "Sweetened with dates", source: "Sweets & Laddoos positioning", cat: "laddoos" },
  { text: "No added sugar", source: "Claim on official laddoo and nut-mix packs" },
  { text: "Roasted, not fried", source: "Namkeens positioning · official packs", cat: "namkeens" },
  { text: "No palm oil", source: "Namkeens positioning · official packs", cat: "namkeens" },
  { text: "Real ingredients", source: "Nuts & Mixes positioning", cat: "nuts" },
  { text: "Convenience and variety", source: "Combos & Gifting positioning", cat: "gifting" },
];

export type Format = "sachet" | "pouch" | "box";
export const FORMATS: { id: Format; name: string; note: string }[] = [
  { id: "sachet", name: "Single-serve sachet", note: "Like the laddoo sachets — one snack, easy to carry." },
  { id: "pouch", name: "Stand-up pouch", note: "Like the namkeen and nut-mix pouches — a few servings." },
  { id: "box", name: "Gift box", note: "Like the assorted laddoo box and snack box — made to give." },
];

/** How well a format suits each occasion — reasons quote the Occasions table. */
export const FORMAT_FIT: Record<OccasionId, { good: Format[]; why: string; fix: string }> = {
  daily: { good: ["sachet", "pouch"], why: "Daily snacking works because it is guilt-free and easy to carry.", fix: "A gift box is bulky for a school bag or desk drawer — try a sachet or pouch." },
  festive: { good: ["box"], why: "Festive packs (Diwali and Rakhi hampers) are a healthier alternative to traditional mithai.", fix: "Festive examples are hampers — a gift box presents your snack as a festive treat." },
  gifting: { good: ["box"], why: "Assorted laddoo boxes and snack boxes make a thoughtful, health-conscious gift.", fix: "A gift should look like a gift — try the gift box format." },
  corporate: { good: ["box"], why: "Brands and offices choose snacks that feel good to give — and order them in bulk.", fix: "Offices order gift boxes in bulk for teams and events — try the gift box format." },
};

export const PACK_COLORS = [
  { hex: "#FF5C00", name: "Better Orange" },
  { hex: "#35401D", name: "Forest" },
  { hex: "#550D10", name: "Festive Maroon" },
  { hex: "#AF4300", name: "Terracotta" },
  { hex: "#E7BA68", name: "Mustard" },
  { hex: "#FFF5EE", name: "Cream" },
];

/* ── Three habits, one family year ─────────────────────────────── */
export const HABITS = [
  { id: "daily", name: "Everyday snacking", color: "#35401D", img: "/brand/products/nut-mix-2.webp" },
  { id: "festive", name: "Festive sweets", color: "#550D10", img: "/brand/products/diwali-hamper-0.webp" },
  { id: "gifting", name: "Gifting", color: "#C98F3C", img: "/brand/products/laddoo-box-24-0.webp" },
] as const;
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const FAMILY_EVENTS = [
  { id: "rakhi", label: "Rakhi", habit: "festive", product: "Rakhi Hamper", img: "/brand/products/rakhi-hamper-0.webp" },
  { id: "diwali", label: "Diwali", habit: "festive", product: "Diwali Hamper", img: "/brand/products/diwali-hamper-0.webp" },
  { id: "bday1", label: "A birthday", habit: "gifting", product: "Assorted Laddoo Box", img: "/brand/products/laddoo-box-24-0.webp" },
  { id: "bday2", label: "Another birthday", habit: "gifting", product: "Ultimate Snack Box", img: "/brand/products/snack-box-1.webp" },
] as const;
export const DATES_NOTE = "Rakhi and Diwali fall on different dates each year — Rakhi is usually in August, and Diwali in October or November (general explanation).";

export const TAKEAWAY =
  "Eat Better’s portfolio covers three habits: everyday snacking, festive sweets and gifting. That is why one brand can serve a family all year.";

export const THINK = {
  q1: "Which category would you launch next, and what would make it “better”?",
  q2: "Why do gift boxes help a brand grow during festivals?",
};
