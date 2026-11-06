/**
 * Chapter 3.1 — Customer Segments, Value Propositions, Channels & Customer Relationships.
 * SOURCE OF TRUTH: docs/module-3-content.md (SkilliZee). Lists are kept as given; short neutral
 * explanations of what each block means are marked "explainer" in sections.
 */

export const CHAPTER = {
  module: "Module 3 · Business Model Canvas",
  number: "3.1",
  title: ["Customers, Promise", "& Reach"] as [string, string],
  subtitle: "Customer Segments, Value Propositions, Channels & Customer Relationships — the people side of the canvas.",
  objective: "Understand who Eat Better serves, what promise it makes, how it reaches customers and how it keeps them.",
};

export const LMS_IMG = {
  src: "/chapter-3-1/lms-1.webp",
  alt: "The Business Model Canvas: nine blocks — Key Partners, Key Activities, Key Resources, Value Propositions, Customer Relationships, Channels, Customer Segments, Cost Structure and Revenue Streams",
  credit: "Business Model Canvas overview from the SkilliZee course (image credit: Umbrex).",
};

export const SEGMENTS = [
  { id: "families", name: "Health-conscious families", img: "/chapter-3-1/seg-family.webp", alt: "A family sharing a bowl of namkeen at home", icon: "home" },
  { id: "young", name: "Young professionals and students looking for better snacks", short: "Young professionals & students", img: "/chapter-3-1/seg-student.webp", alt: "A young woman snacking at her laptop", icon: "laptop" },
  { id: "gift", name: "Gift buyers (festivals and personal gifting)", short: "Gift buyers", img: "/chapter-3-1/seg-gift.webp", alt: "A woman handing a printed gift box to a friend", icon: "gift" },
  { id: "corp", name: "Corporate buyers (employee gifting and events)", short: "Corporate buyers", img: "/chapter-3-1/seg-corp.webp", alt: "A large Ultimate Snack Box with many packs", icon: "building" },
] as const;

export const VALUE_PROPS = [
  { id: "taste", text: "Familiar Indian taste, made with cleaner ingredients.", brand: false },
  { id: "clean", text: "No palm oil, refined sugar or bad fats.", brand: true },
  { id: "quality", text: "6-layer quality check and FSSAI certification.", brand: false },
  { id: "convenience", text: "Convenience: order online or on quick-commerce apps.", brand: false },
  { id: "gifting", text: "Ready-made gifting options.", brand: false },
] as const;
export type VpId = (typeof VALUE_PROPS)[number]["id"];

export const CHANNELS = [
  { id: "web", name: "Own website", detail: "eatbetterco.com", note: "Eat Better runs this shop itself." },
  { id: "market", name: "Marketplaces", detail: "such as Amazon", note: "Someone else’s shop, with its own shoppers." },
  { id: "qc", name: "Quick-commerce apps", detail: "Blinkit, Zepto, Swiggy Instamart", note: "Groceries delivered in minutes." },
  { id: "bulk", name: "Corporate gifting and bulk order requests", detail: "a request, then a custom order", note: "Companies ask for a quote for many boxes." },
] as const;

export const RELATIONSHIPS = [
  { id: "community", title: "Reviews and ratings, customer care by email, and a subscriber community", icon: "message" },
  { id: "offers", title: "Content, offers and repeat-purchase combos", icon: "tag" },
  { id: "transparency", title: "Transparency through kitchen visibility and the origin-story video", icon: "eye" },
] as const;

export const TAKEAWAY = "The left side of the canvas is about people: who they are, what they need and how you stay in touch.";

export const THINK = {
  q1: "Pick one customer segment and write what they want in one sentence.",
  q2: "Which channel is best for first-time buyers? Which is best for loyal buyers?",
};
