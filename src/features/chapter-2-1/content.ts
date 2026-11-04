/**
 * Chapter 2.1 — Brand Identity: Visuals & Tone.
 * SOURCE OF TRUTH: chapter content supplied by SkilliZee (2026-11-04).
 * Brand facts come only from src/lib/brand.ts (official site / packs) and official assets.
 * Anything marked "general explanation" is a teaching aid, not Eat Better research or data.
 */

import { BRAND_CORE, BRAND_LINES, STUDIO_TONES } from "@/lib/brand";

export const CHAPTER = {
  module: "Module 2",
  number: "2.1",
  title: ["Brand Identity", "Visuals & Tone"] as [string, string],
  subtitle: "A name, a logo, colours, a pack and a voice — and how together they make people trust a snack.",
  objective:
    "Analyse Eat Better’s brand name, logo, colours, packaging design, and communication tone to understand how these elements shape brand identity and influence the perceptions of health-conscious Indian consumers.",
};

/** The six areas of the detailed breakdown (word for word from the source). */
export const AREAS = [
  { id: "name", area: "Brand Name", analyse: "“Eat Better” and its tagline, “The joy of snacking, made better.”", learn: "How a simple, memorable name communicates a brand promise.", icon: "type" },
  { id: "logo", area: "Logo & Visual Identity", analyse: "Logo design, typography, colours, and consistency across the website, packaging, and social media.", learn: "How visual elements build recognition and differentiate a brand.", icon: "badge" },
  { id: "colour", area: "Colour Psychology", analyse: "Colours used in product packaging and digital creatives.", learn: "How colours influence perceptions of taste, freshness, quality, and health.", icon: "palette" },
  { id: "pack", area: "Packaging Design", analyse: "Product names, snack imagery, ingredient information, claims, and pack formats.", learn: "How packaging attracts attention, communicates value, and influences purchase decisions.", icon: "package" },
  { id: "tone", area: "Brand Communication & Tone", analyse: "Website copy, product descriptions, social media posts, and messaging around taste and ingredients.", learn: "How tone creates trust and makes a brand relatable to its target audience.", icon: "megaphone" },
  { id: "perception", area: "Consumer Perception", analyse: "How different customers might interpret the brand’s identity and messaging.", learn: "How branding influences expectations, purchase intent, and brand recall.", icon: "users" },
] as const;
export type AreaId = (typeof AREAS)[number]["id"];

export const TAGLINE = "The joy of snacking, made better.";
export const OFFICIAL_LINES = BRAND_LINES; // quoted from eatbetterco.com (see brand.ts)
export const PALETTE = BRAND_CORE.filter((s) => ["Better Orange", "Cocoa", "Logo Chocolate", "Peach", "Cream", "Haldi Yellow"].includes(s.name));
export const PACK_TONES = STUDIO_TONES.filter((s) => ["Festive Maroon", "Forest", "Terracotta", "Chocolate"].includes(s.name));

/** Where the identity shows up — official assets only. */
export const TOUCHPOINTS = [
  { id: "web", label: "Website", img: "/chapter-1-5/all-products-collection.png", note: "Official eatbetterco.com collection page" },
  { id: "pack", label: "Packaging", img: "/brand/products/millet-namkeen-0.webp", note: "Official product photo" },
  { id: "social", label: "Video & social", img: "/brand/video-poster.jpg", note: "From Eat Better’s own channel" },
];

/* ── Brand Identity Lab ─────────────────────────────────────────── */

/** Hotspots on the real Coffee Almond Laddoos sachet (u, v measured on the official pack front). */
export const HOTSPOTS = [
  { id: "brandname", label: "Brand name & logo", area: "logo" as AreaId, u: 0.5, v: 0.315, says: "EAT BETTER CO — the wordmark and leaf symbol sit at the top of every pack.", why: "The same logo on every pack, page and post builds recognition." },
  { id: "imagery", label: "Snack imagery", area: "pack" as AreaId, u: 0.5, v: 0.53, says: "A close-up of the actual laddoo, broken open.", why: "Showing the real snack signals taste before you open the pack." },
  { id: "productname", label: "Product name", area: "pack" as AreaId, u: 0.5, v: 0.74, says: "COFFEE ALMOND LADDOOS — big, bold and plain.", why: "A clear product name tells shoppers exactly what is inside." },
  { id: "claim", label: "Claim", area: "pack" as AreaId, u: 0.42, v: 0.88, says: "“Sweetened with dates” on a red strip.", why: "One short claim answers the health question at a glance." },
  { id: "ingredients", label: "Ingredient information", area: "pack" as AreaId, u: 0.32, v: 0.955, says: "Dates, almonds, oats, coconut, coffee, cacao…", why: "Visible ingredients support trust in what the brand says." },
  { id: "colours", label: "Colours", area: "colour" as AreaId, u: 0.13, v: 0.64, says: "Cream on top, deep cocoa below — the laddoo range’s warm, rich palette.", why: "Colour sets the mood before anyone reads a word." },
  { id: "format", label: "Pack format", area: "pack" as AreaId, u: 0.5, v: 0.01, says: "A slim single-serve sachet with a sealed crimp.", why: "The format suits a laddoo you can carry and eat on the go." },
] as const;

/** Colour lab swatches. `official` notes come from brand.ts (sampled from official photography). */
export const LAB_COLOURS = [
  { id: "forest", name: "Forest green", hex: "#35401D", official: "Eat Better’s millet range photography uses this green." },
  { id: "orange", name: "Better Orange", hex: "#FF5C00", official: "Eat Better’s primary brand orange (website)." },
  { id: "maroon", name: "Festive maroon", hex: "#550D10", official: "Used behind Eat Better’s laddoo and gifting photos." },
  { id: "terracotta", name: "Terracotta", hex: "#AF4300", official: "Used behind Eat Better’s nut-mix photos." },
  { id: "grey", name: "Cold grey", hex: "#8C939B", official: null },
  { id: "neon", name: "Neon pink", hex: "#FF2E9A", official: null },
] as const;
export const PERCEPTIONS = ["Fresh", "Tasty", "Healthy", "Premium", "Festive", "Playful", "Cheap", "Clinical"] as const;
/** General explanation (common colour associations in marketing) — not Eat Better research. */
export const COLOUR_NOTE: Record<string, string> = {
  forest: "Greens are often linked with nature, freshness and health.",
  orange: "Warm oranges are often linked with energy, appetite and fun.",
  maroon: "Deep maroons are often linked with richness, indulgence and festivals.",
  terracotta: "Earthy browns and terracottas are often linked with warmth and natural ingredients.",
  grey: "Cold greys can feel clinical or plain on food packs.",
  neon: "Neon brights grab attention but can feel artificial for a ‘real ingredients’ snack.",
};

/** Tone tuner: official lines vs. PRACTICE lines written for this exercise (not from Eat Better). */
export const TONE_LINES: { text: string; on: boolean; why: string }[] = [
  { text: OFFICIAL_LINES[0], on: true, why: "Playful promise: enjoy it, no guilt." },
  { text: "BUY NOW!!! LOWEST PRICE EVER!!! HURRY!!!", on: false, why: "Shouty and pushy — sells price, not joy." },
  { text: OFFICIAL_LINES[2], on: true, why: "Warm and proud of tradition, with a modern twist." },
  { text: "Our macro-optimised snack units deliver nutrient compliance.", on: false, why: "Cold and technical — no taste, no warmth." },
  { text: OFFICIAL_LINES[1], on: true, why: "Simple, friendly and about pleasure." },
  { text: "Healthy food is boring, but you need it.", on: false, why: "Breaks the promise that tasty and healthy can go together." },
  { text: TAGLINE, on: true, why: "The tagline: joy first, ‘better’ second." },
  { text: "Lose 5 kg in 7 days with every pack!", on: false, why: "An unsupported health claim — it would break trust." },
];

/** Fictional shoppers (practice) — each has a stated priority. */
export const SHOPPERS = [
  {
    id: "parent",
    who: "A parent packing a school tiffin",
    priority: "claim",
    look: { skin: "#B5764A", top: "#00897B", bottom: "#00897B", hair: "#140C08", hairStyle: "long" as const, dress: true, extra: "dupatta" as const, extraColor: "#FED300" },
    happy: "“Sweetened with dates” — that’s what I needed to see.",
    miss: "Nice, but I look for what’s inside first.",
  },
  {
    id: "student",
    who: "A college student grabbing a snack",
    priority: "imagery",
    look: { skin: "#D9A066", top: "#3949AB", bottom: "#263238", hair: "#2A1A12", hairStyle: "short" as const, extra: "cap" as const, extraColor: "#FF5C00" },
    happy: "That laddoo looks so good — I want one now.",
    miss: "Hmm, I just want to see if it looks tasty.",
  },
  {
    id: "elder",
    who: "A grandfather buying for the family",
    priority: "brandname",
    look: { skin: "#A86B45", top: "#8D6E63", bottom: "#4E342E", hair: "#BDB6B0", hairStyle: "short" as const, extra: "glasses" as const, extraColor: "#C8963E" },
    happy: "Eat Better — I remember that name from the shop. I trust it.",
    miss: "I go by a name I know and trust.",
  },
] as const;

/* ── Name test (Brand Name) ─────────────────────────────────────── */
/** "Eat Better" is real; the other three names are PRACTICE names invented for comparison. */
export const NAMES = [
  { id: "eatbetter", name: "Eat Better", line: TAGLINE, real: true },
  { id: "nutrimax", name: "NutriMax Labs", line: "Engineered nutrition units.", real: false },
  { id: "discount", name: "Snack Shack Discount", line: "Cheapest snacks in bulk.", real: false },
  { id: "crunchy", name: "Crunchy Joy", line: "Crunch you can hear.", real: false },
] as const;
export const PROMISES = ["Enjoy food", "Better ingredients", "Lab / science", "Low price", "Fun"] as const;
/** How we read Eat Better's name — interpretation grounded in the brand's stated belief (Chapter 1.2). */
export const NAME_READING = "“Eat” = enjoy your food · “Better” = better ingredients and processes. Never choose between tasty and healthy.";

/* ── Spot the consistency (Logo & Visual Identity) ──────────────── */
/** Tap zones are fractions of each official image (x0, y0, x1, y1). */
export const TOUCH_IMAGES = [
  { id: "web", label: "Website", src: "/chapter-2-1/lms-1.png", w: 1642, h: 257, zones: { logo: [0.015, 0.02, 0.1, 0.32], letters: [0.27, 0.55, 0.88, 0.86] } },
  { id: "pack", label: "Pack", src: "/chapter-1-3/packs/coffee-almond-laddoo.webp", w: 268, h: 512, zones: { logo: [0.14, 0.14, 0.86, 0.34], letters: [0.08, 0.64, 0.92, 0.83] } },
  { id: "video", label: "Video", src: "/brand/video-poster.jpg", w: 1280, h: 720, zones: { logo: [0.57, 0.17, 0.83, 0.41], letters: [0.47, 0.45, 0.93, 0.61] } },
] as const;
export const ELEMENTS = [
  { id: "logo", label: "the logo" },
  { id: "letters", label: "the bold, rounded lettering" },
] as const;
