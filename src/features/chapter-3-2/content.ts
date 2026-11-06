/**
 * Chapter 3.2 — Key Resources, Key Activities & Key Partners.
 * SOURCE OF TRUTH: chapter content supplied by SkilliZee (2026-11-06), saved verbatim in docs/module-3-content.md.
 * Company facts are kept exactly as given; the employee figure keeps its hedge ("business databases list roughly 70").
 */

export const CHAPTER = {
  module: "Module 3",
  number: "3.2",
  title: ["Key Resources, Activities", "& Partners"] as [string, string],
  subtitle: "What Eat Better needs, what it does every day, and who it depends on to keep its promise.",
  objective: "Identify what Eat Better needs, does and depends on to deliver its promise.",
};

export const RESOURCES = [
  { id: "facility", title: "Kitchen & production facility", text: "Its 50,000 sq. ft. kitchen and production facility." },
  { id: "recipes", title: "Recipes & know-how", text: "Recipes and product know-how." },
  { id: "brand", title: "Brand & customer trust", text: "The Eat Better brand and customer trust." },
  { id: "team", title: "The team", text: "Its team (business databases list roughly 70 employees)." },
  { id: "platform", title: "Website & selling platform", text: "Its website and online selling platform." },
] as const;

export const ACTIVITIES = [
  { id: "source", title: "Source & check", text: "Sourcing ingredients and running quality checks." },
  { id: "cook", title: "Cook & test", text: "Cooking in small batches and testing every batch." },
  { id: "pack", title: "Pack & fulfil", text: "Packaging and order fulfilment." },
  { id: "market", title: "Market & care", text: "Marketing, community building and customer care." },
  { id: "develop", title: "Develop new products", text: "Developing new products and festive gifting ranges." },
] as const;

export const PARTNERS = [
  { id: "suppliers", title: "Ingredient suppliers", text: "Ingredient suppliers: they provide the raw ingredients every batch starts with." },
  { id: "platforms", title: "Marketplaces & quick commerce", text: "Marketplaces and quick-commerce platforms: they put the snacks in front of shoppers." },
  { id: "logistics", title: "Logistics & delivery", text: "Logistics and delivery partners: they carry orders to customers." },
  { id: "investors", title: "Investors", text: "Investors (Java Capital, Mumbai Angels, Prath Ventures, Spring Marketing Capital and others)." },
  { id: "corporate", title: "Corporate clients", text: "Corporate clients for gifting and bulk orders." },
] as const;

export const INVESTORS = ["Java Capital", "Mumbai Angels", "Prath Ventures", "Spring Marketing Capital", "and others"];

export const TAKEAWAY = "The middle and right of the canvas show what the company must be good at, and who it needs on its side.";

export const THINK = [
  { id: "supplier", q: "What would happen to the brand if one key supplier failed?" },
  { id: "trust", q: "Which key activity do you think matters most for trust?" },
] as const;
