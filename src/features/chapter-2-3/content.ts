/**
 * Chapter 2.3 — Positioning & Target Audience.
 * SOURCE OF TRUTH: chapter content supplied by SkilliZee (2026-11-05). Definitions, examples, table
 * rows and key concepts are kept as given. The source numbers its last section "5" (there is no 4);
 * sections are numbered 1–4 here.
 */

export const CHAPTER = {
  module: "Module 2",
  number: "2.3",
  title: ["Positioning", "& Target Audience"] as [string, string],
  subtitle: "Who Eat Better is for, where it stands, and why customers choose it.",
  objective:
    "Understand how Eat Better differentiates itself in the Indian snacking market, identifies its ideal customers, and communicates its value to stand out from traditional sweet shops, mainstream namkeen brands, and other healthy-snack brands.",
};

const V = "/chapter-2-3/video";
export const VIDEO = {
  title: "New Flavour Pudina Punch — a zesty, minty millet snack (Eat Better Co on YouTube)",
  h264: `${V}/pudina-punch-h264.mp4`,
  av1: `${V}/pudina-punch-av1.mp4`,
  poster: `${V}/pudina-punch-poster.jpg`,
};

/* 1 · Understanding brand positioning */
export const POSITIONING = {
  definition: "Brand positioning is the place a brand occupies in a customer’s mind compared with competing brands.",
  aim: "Eat Better aims to occupy the space between traditional indulgent snacks and products marketed primarily around health: familiar snacks with a better-for-you approach.",
  ends: { left: "Traditional indulgent snacks", right: "Products marketed primarily around health", middle: "Familiar snacks with a better-for-you approach" },
  idea: "The idea is to offer consumers snacks that feel familiar and enjoyable while emphasising ingredient choices and quality.",
  example: "A customer who enjoys traditional Indian snacks but wants to avoid certain ingredients may consider Eat Better as an alternative.",
  concept: "A brand needs a clear reason for customers to choose it over other available options.",
};

/* 2 · Identifying the target audience */
export const AUDIENCE = {
  definition: "A target audience is the specific group of people a brand wants to reach because its products meet their needs, preferences, or buying motivations.",
  rows: [
    {
      id: "families",
      audience: "Health-conscious families",
      need: "Snacks that balance familiar taste with ingredient preferences.",
      appeal: "Position products as options for family snacking, supported by clear ingredient information.",
      img: "/chapter-1-1/art/family-kitchen.webp",
    },
    {
      id: "professionals",
      audience: "Working professionals",
      need: "Convenient snacks for work breaks and busy schedules.",
      appeal: "Highlight convenience, taste, and suitable pack sizes.",
      img: "/brand/products/hazelnut-laddoo-0.webp",
    },
    {
      id: "gifting",
      audience: "Festive gift buyers",
      need: "Gifts that feel thoughtful, attractive, and different from conventional sweets.",
      appeal: "Showcase gift boxes, packaging, product variety, and gifting occasions.",
      img: "/brand/products/diwali-hamper-0.webp",
    },
    {
      id: "corporate",
      audience: "Corporate buyers",
      need: "Bulk gifts for employees, clients, and business partners like JP Morgan, EY etc.",
      appeal: "Emphasise bulk-order options, presentation, customisation, and reliable fulfilment where available.",
      img: "/chapter-1-5/frames/bulk-boxes.webp",
    },
  ],
  concept: "Different customers may buy the same product for different reasons. Marketing should reflect those motivations.",
} as const;
export type AudienceId = (typeof AUDIENCE.rows)[number]["id"];

/* 3 · Understanding Eat Better's USP */
export const USP = {
  definition: "A Unique Selling Proposition (USP) explains what makes a product or brand distinctive and gives customers a reason to choose it.",
  value: "Eat Better’s proposed value proposition centres on familiar snack experiences combined with specific ingredient and quality standards.",
  differentiators: ["Familiar taste and snack formats.", "No palm oil.", "No refined sugar.", "No bad fats.", "A six-layer quality check."],
  caveat: "These claims should be verified against the relevant product labels and official brand information, as formulations and claims may vary across products.",
  example: "Instead of communicating only that a snack is tasty, a brand can explain what makes its product different in terms of ingredients, quality checks, and customer experience.",
  concept: "A strong USP should be specific, relevant to customers, distinctive from competitors, and supported by evidence.",
  tests: [
    { title: "Specific", text: "Says exactly what is different." },
    { title: "Relevant", text: "Matters to the customers you want." },
    { title: "Distinctive", text: "Competitors can’t say the same thing." },
    { title: "Supported by evidence", text: "Backed by labels, checks and facts." },
  ],
};

/* 4 · Creating a customer persona (numbered 5 in the source) */
export const PERSONA = {
  definition: "A customer persona is a simple profile representing a typical customer within a target audience.",
  name: "The Conscious Family Buyer",
  img: "/chapter-2-3/persona.jpeg",
  fields: [
    { label: "Profile", text: "A working parent shopping for family snacks." },
    { label: "Need", text: "Products that combine enjoyable taste with ingredient choices that suit the family." },
    { label: "Buying considerations", text: "Taste, ingredients, price, packaging, trust, and availability." },
    { label: "Possible marketing message", text: "“Your favourite snacking moments, with ingredients you can understand.”" },
  ],
  considerations: ["Taste", "Ingredients", "Price", "Packaging", "Trust", "Availability"],
  note: "Illustrative persona for classroom learning, not verified Eat Better customer research.",
};
