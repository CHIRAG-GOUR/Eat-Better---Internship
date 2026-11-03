/**
 * Chapter 1.3 — Origin Story & Founders.
 * SOURCE OF TRUTH: chapter content supplied by SkilliZee (2026-11-02).
 * The supplied text repeats its key takeaway and Think & Discuss at the end; each appears once here
 * (the three-question set from section 10 is used, plus the optional mini activity from section 11).
 */

export const CHAPTER = {
  module: "Module 1",
  number: "1.3",
  title: ["Origin Story", "& Founders"] as [string, string],
  subtitle: "From a family's snack problem to a national brand — one careful step at a time.",
  objective:
    "Trace the journey of the three founders (Mridula Kanoria, Shaurya Kanoria, Vidushi Kajaria), the early model of exhibitions and direct selling, and how leadership roles evolved.",
};

export const VIDEOS = {
  sharkTank: {
    id: "x09Y94ksOY0",
    title: "Eat Better Co के Product पर क्यों हुआ Sharks को Doubt? | Shark Tank India S4 | 100 Crore Valuation",
    caption: "Shark Tank India, Season 4 (Sony LIV on YouTube) — plays from YouTube.",
  },
  gifting: {
    title: "Diwali Corporate Gifting, Done Thoughtfully | Inside Eat Better Co",
    av1: "/chapter-1-3/video/diwali-gifting-av1.mp4",
    h264: "/chapter-1-3/video/diwali-gifting-h264.mp4",
    poster: "/chapter-1-3/video/gifting-poster.jpg",
    caption: "Inside Eat Better Co today — from the brand's own channel.",
  },
};

/* 1–3 · the origin story */
export const STORY = [
  {
    id: "spark",
    kicker: "1 · The spark: a family problem",
    text:
      "Founder Mridula Kanoria says she started the kitchen because she was tired of choosing between tasty and healthy for her own family. She asked why laddoos could not have protein, and why bhujia could not be roasted yet still delicious. In her family everyone worked, travelled and kept odd hours, so snacks were always in demand.",
    lesson: "Many strong businesses start with a problem the founder faces personally.",
    img: "/chapter-1-3/home-kitchen.webp",
  },
  {
    id: "experiments",
    kicker: "2 · Small experiments in a home kitchen",
    text:
      "The brand began with small experiments using dates, millets and real masalas. The first aim was simple: make familiar snacks with cleaner ingredients, and check whether people still loved them.",
    img: "/chapter-1-3/kitchen-experiments.webp",
  },
  {
    id: "bigger",
    kicker: "3 · A bigger problem than they first thought",
    text:
      "Over the years, the founders realised they were solving a much bigger problem. People across India wanted delicious, healthy snacks they could trust. This realisation turned a family kitchen into a brand.",
    img: "/chapter-1-1/art/across-india.webp",
  },
];

/* 4 · exhibitions & direct selling */
export const EXHIBITIONS = {
  points: [
    "The founders sold at exhibitions and directly to customers.",
    "Meeting customers face to face gave honest, immediate feedback on taste, price and packaging.",
    "This built a loyal community from the ground up, before the brand went online.",
  ],
  why: "A brand that has already listened to real customers makes fewer expensive mistakes later.",
};

/** Exhibition-stall activity — PRACTICE SCENARIOS invented for learning (labelled in the UI). */
export type Fix = "recipe" | "price" | "packaging" | "ignore";
export const VISITORS: { id: string; says: string; about: Exclude<Fix, "ignore">; good: string }[] = [
  { id: "sweet", says: "These laddoos taste great — but a little too sweet for me.", about: "recipe", good: "You tweak the recipe and offer a new tasting batch. The visitor tries it and smiles." },
  { id: "price", says: "I'd love to try, but the big pack costs a lot for a first try.", about: "price", good: "You bring out a smaller pack at a lower price. First-time buyers can now try it." },
  { id: "pack", says: "The pouch was hard to open and wouldn't close again.", about: "packaging", good: "You switch to an easy-open pouch that reseals. Customers notice straight away." },
];

/* 5 · going national */
export const NATIONAL = [
  { text: "The brand moved online and became internet-first.", img: "/chapter-1-1/art/order-online.webp" },
  { text: "It raised funding from investors.", img: "/chapter-1-3/funding.webp" },
  { text: "It appeared on Shark Tank India (Season 4).", img: "/chapter-1-3/shark-tank-thumb.jpg" },
  { text: "It grew from a home kitchen to a 50,000 sq. ft. facility.", img: "/chapter-1-3/frames/warehouse.webp" },
];

/* 6 · leadership team (role column = general explanation, per the supplied note) */
export const LEADERS = [
  { name: "Mridula Kanoria", role: "Founder", does: "Started the kitchen and shaped the product philosophy" },
  { name: "Shaurya Kanoria", role: "Co-founder & CEO", does: "Leads the company’s overall direction and growth" },
  { name: "Vidushi Kajaria", role: "Co-founder & CMO (Chief Marketing Officer)", does: "Leads brand and marketing" },
  { name: "Pulkit Kanoria", role: "Chief Growth Officer (as listed in business databases)", does: "Focuses on growth" },
];
export const LEADERS_NOTE =
  "Note: the role descriptions are general explanations of what such roles usually do, not statements from the brand.";

/* 7 · how roles evolved */
export const EVOLUTION = {
  early: { title: "In the early days", text: "The founders did everything themselves:", tasks: ["Making", "Selling", "Answering customers"] },
  later: {
    title: "As the company grew",
    text: "Roles became specialised:",
    roles: [
      { role: "CEO", task: "Overall direction" },
      { role: "CMO", task: "Marketing" },
      { role: "Growth role", task: "Scaling sales" },
    ],
  },
  note: "This is how most startups mature.",
};

/* 8 · journey timeline */
export const TIMELINE = [
  { when: "August 2020", what: "Eat Better Co founded in Jaipur; early sales through exhibitions and direct selling" },
  { when: "2021", what: "First external funding recorded (GetVantage, amount undisclosed)" },
  { when: "2022", what: "Seed round of about Rs 5.5 crore led by Java Capital and Mumbai Angels" },
  {
    when: "Shark Tank India, Season 4",
    what: "Founders asked for Rs 50 lakh for 0.5% equity (a Rs 100 crore valuation) and chose Namita Thapar’s offer, which included a 1% royalty until her investment was recouped",
    shark: true,
  },
  { when: "April 2025", what: "Pre-Series A round of Rs 17 crore co-led by Prath Ventures and Spring Marketing Capital" },
];

export const TAKEAWAY =
  "The founders did not start with a big factory. They started with a real family problem, tested recipes with real customers, and scaled step by step.";

export const THINK = {
  questions: [
    "What is the advantage of selling at exhibitions before selling online?",
    "Which founder role (CEO, CMO, Founder) would you want to shadow, and why?",
    "Why do you think the founders chose a deal with a royalty on Shark Tank India instead of one with more equity?",
  ],
  mini: "Prepare 5 interview questions you would ask the founders about their first year. Share them with a mentor, then pick the best question and explain why it would teach you the most.",
};
