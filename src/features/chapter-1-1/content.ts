/**
 * Chapter 1.1 — About the Company.
 * SOURCE OF TRUTH: the chapter brief supplied by SkilliZee (2026-11-02).
 * Company facts below are copied from that brief. Anything marked `general` is a
 * general business explanation added to help students, not a claim about Eat Better Co.
 */

export const CHAPTER = {
  internship: "Eat Better Co — 360° Internship",
  module: "Module 1",
  number: "1.1",
  title: "About the Company",
  theme:
    "The story of Eat Better Co, what the brand stands for, what it makes, and how its internet-first business model works.",
  objective:
    "Understand what Eat Better Co is: a Jaipur-based, internet-first healthy snacking brand founded in 2020, making better-for-you sweets, namkeens and seed and nut mixes with real ingredients, and understand where it sells today.",
};

/* Section 1 — Company at a glance */
export const GLANCE = {
  name: "Eat Better Co",
  legalName: "Eat Better Ventures Private Limited",
  founded: "August 2020",
  headquarters: "Jaipur, Rajasthan",
  type: "Internet-first, direct-to-consumer (D2C) healthy snacking brand",
  brandLine: "The joy of snacking, made better",
  founders: [
    { name: "Mridula Kanoria", role: "Founder", initials: "MK" },
    { name: "Shaurya Kanoria", role: "Co-founder & CEO", initials: "SK" },
    { name: "Vidushi Kajaria", role: "Co-founder & CMO", initials: "VK" },
  ],
};

/** General explanations of the terms in the fact file (not company-specific claims). */
export const GLANCE_TERMS: Record<string, string> = {
  name: "The brand name — what customers see on packs, the website and social media.",
  legalName:
    "The name the company is registered under. 'Private Limited' means it is a registered company owned by private shareholders, not listed on a stock exchange.",
  founded: "The month and year the company was started.",
  headquarters: "The city where the company is based and run from.",
  type: "How the company mainly reaches its customers and what it sells. You'll explore 'internet-first' and 'D2C' later in this chapter.",
  brandLine: "A short line that sums up what the brand promises its customers.",
};

export const ROLE_EXPLAINERS: Record<string, string> = {
  Founder: "The person who started the business.",
  "Co-founder & CEO":
    "A co-founder helped start the business. The CEO (Chief Executive Officer) leads the company and makes its biggest decisions.",
  "Co-founder & CMO":
    "A co-founder helped start the business. The CMO (Chief Marketing Officer) leads marketing — how the brand talks to and attracts customers.",
};

/* Section 2 — What is Eat Better Co? */
export const WHAT_IS = {
  paragraphs: [
    "Eat Better Co is a healthy snacking brand from Jaipur. It makes familiar Indian snacks and sweets, such as laddoos and namkeens, using cleaner, simpler ingredients.",
    "The brand believes that people should not have to choose between snacks they love and ingredients they trust.",
    "It aims to keep the crunch, flavour and satisfaction while changing the ingredients and the way the snacks are made.",
  ],
  /** Sorting activity — answers come straight from the paragraph above. */
  attributes: [
    { id: "crunch", label: "The crunch", keep: true },
    { id: "flavour", label: "The flavour", keep: true },
    { id: "ingredients", label: "The ingredients", keep: false },
    { id: "satisfaction", label: "The satisfaction", keep: true },
    { id: "method", label: "The way the snacks are made", keep: false },
  ],
};

/* Video */
export const VIDEO = {
  id: "AZrRAUVxlgg",
  title: "Eat Better Co - The Story of how we started and what our brand stands for.",
  channel: "Eat Better Co",
};

/* Section 3 — Internet-first (D2C) */
export const D2C = {
  definition:
    "An internet-first brand builds its business online before, or alongside, physical shops.",
  howEatBetterSells:
    "Eat Better sells directly to customers through its own website, so it does not depend on a shopkeeper or distributor to reach them. This is called D2C (direct-to-consumer).",
  advantages: [
    { id: "feedback", title: "Talks directly to customers", text: "The brand talks directly to its customers and learns from their feedback." },
    { id: "reach", title: "Reaches across India", text: "It can reach customers across India from one kitchen." },
    { id: "control", title: "Controls its own brand", text: "It controls its own pricing, packaging and brand story." },
  ],
  /** General explanation of each route (not Eat Better Co specific). */
  routes: {
    traditional: {
      label: "Shop & distributor route",
      tag: "General explanation",
      stops: [
        { id: "kitchen", label: "Kitchen", text: "Snacks are made and packed." },
        { id: "distributor", label: "Distributor", text: "A distributor buys stock in bulk and delivers it to shops in their area." },
        { id: "shop", label: "Shop", text: "A shopkeeper decides what to stock, where to place it and how to sell it." },
        { id: "customer", label: "Customer", text: "The customer buys from the shop shelf." },
      ],
    },
    d2c: {
      label: "Direct-to-consumer route",
      tag: "How Eat Better sells",
      stops: [
        { id: "kitchen", label: "Kitchen", text: "Snacks are made and packed." },
        { id: "website", label: "Brand website", text: "The customer orders directly from the brand's own website." },
        { id: "delivery", label: "Delivery", text: "The order is shipped from the kitchen to the customer's address." },
        { id: "customer", label: "Customer", text: "The customer receives it — and can talk to the brand directly." },
      ],
    },
  },
  /** Decision scenarios — each maps to one supplied advantage. */
  scenarios: [
    {
      id: "feedback",
      prompt: "A customer thinks a new namkeen is a little too spicy. On which route does that message reach the brand directly?",
      answer: "d2c" as const,
      traditionalOutcome:
        "The customer might mention it to the shopkeeper — but the message may never travel back through the distributor to the kitchen.",
      d2cOutcome: "The customer writes to the brand itself. The kitchen hears it first-hand and can learn from it.",
      advantage: "feedback",
    },
    {
      id: "reach",
      prompt: "Someone in a city far from Jaipur wants to try the laddoos, but no shop near them stocks the brand. Which route can still reach them?",
      answer: "d2c" as const,
      traditionalOutcome: "The product only reaches places where a distributor supplies shops. No local stockist means no sale.",
      d2cOutcome: "They order on the website and it is shipped to their address — one kitchen can reach customers across India.",
      advantage: "reach",
    },
    {
      id: "control",
      prompt: "The brand wants every customer to see its packaging and hear its story the way it intended. Which route gives the brand that control?",
      answer: "d2c" as const,
      traditionalOutcome:
        "Shops decide shelf placement and displays, and other people stand between the brand and the customer.",
      d2cOutcome: "On its own website the brand sets its prices, shows its packaging and tells its own story.",
      advantage: "control",
    },
  ],
};

/* Section 4 — What does Eat Better make? */
export type CategoryId = "sweets" | "namkeens" | "nuts" | "gifting";

export const CATEGORIES: { id: CategoryId; title: string; points: string[]; tone: string }[] = [
  {
    id: "sweets",
    title: "Sweets & laddoos",
    points: ["Dry-fruit laddoos in several flavours", "Sweetened with dates", "Protein laddoos"],
    tone: "#550D10",
  },
  {
    id: "namkeens",
    title: "Namkeens",
    points: ["Roasted namkeens", "Millet varieties", "Quinoa varieties"],
    tone: "#35401D",
  },
  {
    id: "nuts",
    title: "Nuts & mixes",
    points: ["Nut and seed mixes for everyday snacking"],
    tone: "#AF4300",
  },
  {
    id: "gifting",
    title: "Combos & gifting",
    points: ["Snack boxes", "Festive hampers for occasions like Rakhi and Diwali", "Corporate gifting"],
    tone: "#C8963E",
  },
];

/** Official product photos (eatbetterco.com) used in the sorting activity. */
export const PRODUCT_CARDS: { id: string; name: string; image: string; category: CategoryId }[] = [
  { id: "hazelnut", name: "Hazelnut Chocolate Laddoos", image: "/brand/products/hazelnut-laddoo-0.webp", category: "sweets" },
  { id: "protein", name: "Chocolate Fudge Protein Laddoos", image: "/brand/products/protein-laddoo-0.webp", category: "sweets" },
  { id: "bhujia", name: "Millet Bhujia — Pudina Masti", image: "/brand/products/millet-bhujia-0.webp", category: "namkeens" },
  { id: "quinoa", name: "Quinoa Namkeen — Chilli Lime", image: "/brand/products/quinoa-namkeen-0.webp", category: "namkeens" },
  { id: "bhel", name: "Millet Bhel — Bombay Bhelpuri", image: "/brand/products/millet-bhel-0.webp", category: "namkeens" },
  { id: "nutmix", name: "Premium Nut Mix", image: "/brand/products/nut-mix-0.webp", category: "nuts" },
  { id: "seedmix", name: "Seed Mix — Spiced Jaggery", image: "/brand/products/seed-mix-0.webp", category: "nuts" },
  { id: "trail", name: "Better Trail Mix", image: "/brand/products/trail-mix-0.webp", category: "nuts" },
  { id: "snackbox", name: "Ultimate Snack Box", image: "/brand/products/snack-box-0.webp", category: "gifting" },
  { id: "rakhi", name: "Sneh Rakhi Gift Hamper", image: "/brand/products/rakhi-hamper-0.webp", category: "gifting" },
];

export const BRAND_CLAIMS = ["No palm oil", "No refined sugar", "No bad fats"];

/* Key takeaway */
export const TAKEAWAY =
  "Eat Better started as a family kitchen and became a national brand by selling online, which is why we call it an internet-first brand.";

/* Think & Discuss */
export const THINK = {
  q1: "Why would a food brand choose to start online instead of in shops?",
  q2: "Which of Eat Better's categories would you buy online, and which from a local shop? Why?",
  /** Reasons students can weigh for Q1. The first three restate the chapter; the rest are general considerations. */
  q1Reasons: [
    { id: "feedback", text: "It can hear directly from customers and learn from their feedback.", fromChapter: true },
    { id: "reach", text: "One kitchen can reach customers across India.", fromChapter: true },
    { id: "control", text: "It controls its own pricing, packaging and brand story.", fromChapter: true },
    { id: "nostock", text: "It doesn't need shops to agree to stock it before it can start selling.", fromChapter: false },
    { id: "trust", text: "But: some shoppers like to see a product in person before trying a new brand.", fromChapter: false },
    { id: "delivery", text: "But: every order has to be packed and delivered safely to the customer.", fromChapter: false },
  ],
  q2Reasons: {
    online: ["More flavours to choose from", "Can be sent to someone far away", "I plan ahead / buy in bulk", "I can read about the product first"],
    shop: ["I want it right now", "I like to see it before I buy", "A quick everyday snack", "I don't want to wait for delivery"],
  },
};
