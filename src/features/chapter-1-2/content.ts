/**
 * Chapter 1.2 — Vision, Mission & Values.
 * SOURCE OF TRUTH: chapter content supplied by SkilliZee (2026-11-02).
 * Anything marked `general` / "practice scenario" is a teaching aid, not a company claim.
 *
 * NOTE: the supplied 1.2 text lists "Vidushi Kanoria"; chapters 1.1 and 1.3 (and the brand's
 * own materials) say "Vidushi Kajaria". Kajaria is used here for consistency — flagged for review.
 */

export const CHAPTER = {
  module: "Module 1",
  number: "1.2",
  title: ["Vision, Mission", "& Values"] as [string, string],
  subtitle: "Where Eat Better wants to go, what it does every day to get there — and the values behind each decision.",
  objective:
    "Study Eat Better's vision and mission and the values behind “better ingredients, better quality, better-for-you”; learn how a vision statement guides everyday decisions.",
};

export const VIDEO = {
  title: "Scaling with Spring: A Journey of Aggressive Execution",
  src: "/chapter-1-2/video/scaling-with-spring.mp4",
  poster: "/chapter-1-2/video/scaling-poster.jpg",
  caption: "A look inside Eat Better's facility — shared by co-founder & CEO Shaurya Kanoria on LinkedIn.",
};

/* 1 · Brand identity & philosophy */
export const IDENTITY = {
  brandIdea: "The joy of snacking, made better",
  coreBelief:
    "You should never have to choose between tasty and healthy. Eat Better keeps the crunch, flavour, and satisfaction while upgrading ingredients and production processes.",
  headquarters: "Jaipur, Rajasthan",
  founders: ["Shaurya Kanoria", "Mridula Kanoria", "Vidushi Kajaria"],
  foundersNote: "featured on Shark Tank India",
};

/* 2 · Strategic direction */
export const VISION = {
  meaning: "Where the brand aims to reach",
  publicVision: "To become India’s most loved family snacking brand.",
  longTermVision:
    "To build a large, enduring food and beverage enterprise offering delicious, health-conscious options at the click of a button.",
};
export const MISSION = {
  meaning: "What the brand does daily to get there",
  text: "To revive the Indian snacking category with healthier, tastier options for every household.",
};

/* 3 · Core values */
export const VALUES = [
  { id: "taste", name: "Familiar Taste", meaning: "The nostalgic flavours you grew up snacking on, made better.", img: "/brand/products/millet-bhujia-1.webp" },
  { id: "ingredients", name: "Better Ingredients", meaning: "Simpler, cleaner ingredients that do not compromise on taste.", img: "/chapter-1-2/better-ingredients.webp" },
  { id: "process", name: "Honest Processes", meaning: "Every batch is made with rigorous quality checks and clean processes.", img: "/chapter-1-3/frames/warehouse.webp" },
] as const;

/* 4 · Operationalising the vision — the four practices (company facts) */
export const PRACTICES = [
  { id: "sweet", title: "Natural Sweetening", text: "Sweetening laddoos and sweet snacks naturally with dates and dry fruits instead of refined sugar." },
  { id: "roast", title: "Oil & Cooking Innovation", text: "Choosing roasting over deep-frying for traditional namkeens, with a strict ban on palm oil and harmful fats." },
  { id: "qa", title: "Quality Assurance", text: "Inspecting every batch across six mandatory quality checkpoints before dispatch." },
  { id: "clean", title: "Clean-Label Commitment", text: "Eliminating artificial preservatives, hydrogenated oils, and unnecessary fillers to ensure transparency." },
];

/**
 * Vision Filter activity. Real practices (company facts) pass; the "practice scenarios" are
 * invented counter-examples for learning, clearly labelled in the UI.
 */
export const FILTER_DECISIONS: { id: string; text: string; real: boolean; passes: boolean; why: string }[] = [
  { id: "sweet", text: PRACTICES[0].text, real: true, passes: true, why: "Dates and dry fruits keep laddoos sweet and tasty while making them better for you." },
  { id: "sugar", text: "Switch the laddoos to refined sugar because it is cheaper.", real: false, passes: false, why: "Cheaper, but not better for you — it fails the filter." },
  { id: "roast", text: PRACTICES[1].text, real: true, passes: true, why: "Roasting keeps the crunch people love while avoiding deep-frying and palm oil." },
  { id: "fry", text: "Deep-fry the namkeen in palm oil so it is faster to make.", real: false, passes: false, why: "Faster, but it breaks the promise of better ingredients — no." },
  { id: "qa", text: PRACTICES[2].text, real: true, passes: true, why: "Six checkpoints protect taste and quality for every family that buys the snack." },
  { id: "skip", text: "Skip a quality checkpoint to dispatch orders a day earlier.", real: false, passes: false, why: "Speed can't come at the cost of honest processes — the filter says no." },
  { id: "clean", text: PRACTICES[3].text, real: true, passes: true, why: "A clean label means customers know exactly what they are eating." },
  { id: "preserve", text: "Add an artificial preservative so packs last longer on shelves.", real: false, passes: false, why: "It may help shelf life, but it goes against the clean-label commitment." },
];

/* 5 · Product offerings & distribution */
export const PRODUCT_LINES = [
  { name: "Roasted Millet Namkeens", img: "/brand/products/millet-namkeen-0.webp" },
  { name: "Sugar-Free Dry Fruit Laddoos", img: "/brand/products/hazelnut-laddoo-0.webp" },
  { name: "Seasoned Seed Mixes", img: "/brand/products/seed-mix-0.webp" },
  { name: "Trail Mixes", img: "/brand/products/trail-mix-0.webp" },
];
export const CHANNELS = [
  {
    id: "quick",
    name: "Quick-commerce platforms",
    detail: "Blinkit, Zepto, Swiggy Instamart",
    general: "Apps that deliver everyday items to your door within minutes.",
    img: "/chapter-1-2/quick-delivery.webp",
  },
  {
    id: "d2c",
    name: "D2C e-commerce channels",
    detail: "Selling directly to customers online",
    general: "The brand sells straight to customers through online channels — no shop in between.",
    img: "/chapter-1-2/frames/shipping-box.webp",
  },
  {
    id: "wellness",
    name: "Wellness retail outlets",
    detail: "Across India",
    general: "Physical shops that focus on health and wellness products.",
    img: "/chapter-1-2/wellness-store.webp",
  },
];

export const TAKEAWAY =
  "A good vision is a filter. If a decision does not help the brand make snacks that are both tasty and better for you, the answer is no.";

export const THINK = {
  q1: "Write your own vision statement for Eat Better in 20 words or fewer.",
  q2: "Pick one value and name a real decision a snack brand would make because of it.",
};
