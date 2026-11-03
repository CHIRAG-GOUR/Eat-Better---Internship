/**
 * Chapter 1.6 — Quality, Packaging & Compliance.
 * SOURCE OF TRUTH: chapter content supplied by SkilliZee (2026-11-03).
 * Company statements are presented as the brand's commitments / claims.
 * Anything marked "practice scenario" or "practice label" is invented for learning and labelled in the UI.
 */

export const CHAPTER = {
  module: "Module 1",
  number: "1.6",
  title: ["Quality, Packaging", "& Compliance"] as [string, string],
  subtitle: "How a food brand earns trust — batch by batch, label by label, pack by pack.",
  objective:
    "Explore clean-label and quality commitments, packaging design and freshness, and FSSAI labelling and food safety requirements.",
};

export const VIDEO = {
  id: "x09Y94ksOY0",
  title: "Eat Better Co के Product पर क्यों हुआ Sharks को Doubt? | Shark Tank India S4 | 100 Crore Valuation",
  caption: "Shark Tank India, Season 4 (Sony LIV on YouTube) — plays from YouTube.",
  poster: "/chapter-1-3/shark-tank-thumb.jpg",
};

/* 1 · The "6 Layers Quality Promise" */
export const PROMISE_INTRO =
  "Every product batch manufactured by Eat Better Co undergoes six standardized checkpoints to ensure nutritional integrity, safety, and consistent taste.";

export const CHECKPOINTS = [
  {
    id: "sourcing",
    name: "Sourcing",
    process: "Selection of high-grade raw materials directly from trusted local and regional suppliers.",
    objective: "Sourcing premium, authentic ingredients.",
    img: "/chapter-1-2/better-ingredients.webp",
  },
  {
    id: "check",
    name: "Quality Check",
    process: "Rigorous evaluation of raw ingredients for size, freshness, and quality against global food safety benchmarks.",
    objective: "Establishing raw material standards.",
    img: "/chapter-1-3/kitchen-experiments.webp",
  },
  {
    id: "prepping",
    name: "Prepping",
    process: "Hygienic cleaning, dry roasting for enhanced flavor development, and meticulous sorting to eliminate foreign particles or impurities.",
    objective: "Hygienic processing and flavor enhancement without deep frying.",
    img: "/chapter-1-6/frames/hygiene.webp",
  },
  {
    id: "cooking",
    name: "Cooking",
    process: "Controlled cooking carried out in small batches inside dedicated production facilities.",
    objective: "Preserving maximum nutritional value and crunch.",
    img: "/chapter-1-6/frames/roasting.webp",
  },
  {
    id: "testing",
    name: "Batch Testing",
    process: "Systematic evaluation of every completed batch against set parameters for taste, texture, moisture, and quality.",
    objective: "Consistency and zero-defect output.",
    img: "/chapter-1-2/frames/facility-li.webp",
  },
  {
    id: "packaging",
    name: "Packaging",
    process: "Immediate sealing using protective, multi-layer food-grade packaging materials.",
    objective: "Locking in freshness and extending shelf-life naturally.",
    img: "/chapter-1-6/frames/carton-seal.webp",
  },
] as const;
export type CheckpointId = (typeof CHECKPOINTS)[number]["id"];

/* 2 · Clean Label Strategy */
export const CLEAN_LABEL_INTRO =
  "Eat Better Co operates on a transparent Clean Label Commitment designed to make food labeling straightforward and consumer-friendly:";
export const CLEAN_LABEL = [
  { title: "Transparent Ingredients", text: "Short, easily understandable ingredient lists free of complex chemical additives or artificial fillers." },
  { title: "Strict Ingredient Exclusions", text: "Zero use of palm oil, refined sugar, artificial preservatives, or hydrogenated unhealthy fats across all product lines." },
  { title: "Natural Alternatives", text: "Sweetening via natural dates and dry fruits, paired with roasting techniques instead of traditional deep frying." },
];
/** the four exclusions named in the chapter */
export const EXCLUSIONS = ["Palm oil", "Refined sugar", "Artificial preservatives", "Hydrogenated fats"] as const;
export type Exclusion = (typeof EXCLUSIONS)[number];

/**
 * Label detective. The first list is the official ingredient line (src/lib/brand.ts, from eatbetterco.com).
 * The others are PRACTICE LABELS invented for learning — not real products.
 */
export const LABELS: {
  id: string;
  name: string;
  real: boolean;
  source: string;
  ingredients: { text: string; excluded?: Exclusion }[];
}[] = [
  {
    id: "hazelnut",
    name: "Hazelnut Chocolate Laddoos",
    real: true,
    source: "Eat Better's official product page",
    ingredients: [{ text: "Dates" }, { text: "Hazelnuts" }, { text: "Almonds" }, { text: "Cocoa" }, { text: "Vanilla extract" }, { text: "Chia seeds" }, { text: "Sea salt" }],
  },
  {
    id: "masala",
    name: "Crunchy Masala Mix",
    real: false,
    source: "Practice label, not a real product",
    ingredients: [
      { text: "Rice flakes" },
      { text: "Palm oil", excluded: "Palm oil" },
      { text: "Salt" },
      { text: "Spices" },
      { text: "Artificial preservative", excluded: "Artificial preservatives" },
    ],
  },
  {
    id: "choco",
    name: "Choco Cream Biscuits",
    real: false,
    source: "Practice label, not a real product",
    ingredients: [
      { text: "Wheat flour" },
      { text: "Refined sugar", excluded: "Refined sugar" },
      { text: "Hydrogenated vegetable fat", excluded: "Hydrogenated fats" },
      { text: "Cocoa" },
      { text: "Milk solids" },
    ],
  },
  {
    id: "chana",
    name: "Roasted Chana Snack",
    real: false,
    source: "Practice label, not a real product",
    ingredients: [{ text: "Roasted chana" }, { text: "Rice bran oil" }, { text: "Salt" }, { text: "Turmeric" }, { text: "Chilli" }],
  },
];

/* 3 · Regulatory Compliance & Quality Certifications */
export const COMPLIANCE = [
  {
    title: "FSSAI Certification",
    text: "Full accreditation under the Food Safety and Standards Authority of India (FSSAI) guidelines to ensure statutory food safety and hygiene across manufacturing units.",
  },
  {
    title: "Lab-Tested Nutrition",
    text: "Macro- and micronutrient profiles verified through third-party accredited laboratory testing, providing accurate nutritional disclosures on all consumer packaging.",
  },
];

/* 4 · Packaging Strategy & Design Execution */
export const PACKAGING = [
  {
    title: "Freshness & Shelf Life Protection",
    text: "High-barrier packaging safeguards products against moisture, ambient air, and degradation without requiring artificial chemical preservatives.",
    img: "/chapter-1-6/frames/sealed-boxes.webp",
  },
  {
    title: "Clear Labeling",
    text: "Front-of-pack highlighting of key product attributes (e.g., Roasted, No Palm Oil, Sweetened with Dates) allows consumers to make quick, informed purchase decisions.",
    img: "/brand/products/hazelnut-laddoo-0.webp",
  },
  {
    title: "Omnichannel Visual Appeal",
    text: "Designed to maintain strong brand recognition and visual consistency across physical retail shelves and high-resolution digital storefronts on quick-commerce apps.",
    img: "/chapter-1-2/wellness-store.webp",
  },
];

/**
 * Front-of-pack check. Claims are those printed on the official packs (visible in the official photos
 * and listed in src/lib/brand.ts). Decoys are claims from OTHER Eat Better packs.
 */
export const FRONT_PACKS: { id: string; name: string; img: string; claims: string[]; decoys: string[]; note: string }[] = [
  {
    id: "laddoo",
    name: "Hazelnut Chocolate Laddoos",
    img: "/brand/products/hazelnut-laddoo-0.webp",
    claims: ["Sweetened with dates"],
    decoys: ["Roasted not fried", "Baked not fried"],
    note: "The red strip says “Sweetened with dates” — a shopper who avoids refined sugar knows in one glance.",
  },
  {
    id: "ragi",
    name: "Ragi Chips · Achari Masti",
    img: "/brand/products/ragi-chips-0.webp",
    claims: ["Baked not fried", "No palm oil"],
    decoys: ["Sweetened with dates"],
    note: "The yellow band says “Baked not fried | No palm oil” — the two things a chips buyer most wants to check.",
  },
  {
    id: "bhujia",
    name: "Millet Bhujia · Pudina Masti",
    img: "/brand/products/millet-bhujia-0.webp",
    claims: ["Roasted not fried", "No palm oil"],
    decoys: ["Baked not fried", "Sweetened with dates"],
    note: "Along the bottom of the pack: “Roasted not fried | No palm oil”.",
  },
];

export const TAKEAWAY = "For a food brand, trust is the product. Quality checks, clear labels and fresh packaging are how that trust is earned.";

export const THINK = {
  q1: "Which of the six checkpoints do you think is the hardest to maintain as the brand grows? Why?",
  q2: "Why should a customer read the ingredient list even on a “healthy” snack?",
};
