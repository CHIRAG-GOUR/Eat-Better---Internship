import type { GlossaryEntry } from "@/components/chapter/Glossary";

/** Chapter 3.2 word help: everyday meaning + how the word is used in this chapter. */
export const GLOSSARY_3_2: GlossaryEntry[] = [
  { term: "Business Model Canvas", match: ["canvas"], general: "A one-page map with nine blocks that shows how a business creates, delivers and earns from value.", chapter: "This chapter fills in three blocks: Key Resources, Key Activities and Key Partners." },
  { term: "key resources", match: ["key resource", "resources"], general: "The most important things a business must have to work: places, people, knowledge, brand, technology.", chapter: "For Eat Better: the facility, recipes, brand and trust, the team, and the website." },
  { term: "key activities", match: ["key activity"], general: "The most important things a business must do every day to keep its promise.", chapter: "Sourcing and checking, small-batch cooking and testing, packing and fulfilment, marketing and care, new products." },
  { term: "key partners", match: ["key partner", "partners"], general: "Other companies and people a business depends on to work.", chapter: "Suppliers, selling platforms, delivery partners, investors and corporate clients." },
  { term: "production facility", match: ["facility"], general: "A building where products are made at scale.", chapter: "Eat Better's kitchen and production facility is 50,000 sq. ft." },
  { term: "sq. ft.", match: ["square feet"], general: "Square feet: a unit for measuring floor area.", chapter: "50,000 sq. ft. is roughly the size of a football pitch." },
  { term: "know-how", general: "Practical skill and knowledge about how to do something well.", chapter: "Eat Better's recipes and product know-how are a resource competitors cannot easily copy." },
  { term: "sourcing", match: ["sourcing ingredients"], general: "Finding and buying the raw materials a business needs.", chapter: "Sourcing ingredients comes first, before any cooking." },
  { term: "quality checks", match: ["quality check"], general: "Tests that make sure a product meets its standard before it reaches customers.", chapter: "Ingredients are checked and every batch is tested." },
  { term: "small batches", match: ["small batch"], general: "Making a limited amount at a time instead of one huge run.", chapter: "Eat Better cooks in small batches and tests every batch." },
  { term: "order fulfilment", match: ["fulfilment"], general: "Everything that happens after an order: picking, packing and shipping it to the customer.", chapter: "Packaging and order fulfilment is one of the key activities." },
  { term: "logistics", general: "Moving goods from one place to another: storage, transport and delivery.", chapter: "Logistics and delivery partners carry orders to customers." },
  { term: "suppliers", match: ["supplier", "ingredient suppliers"], general: "Businesses that sell raw materials or products to another business.", chapter: "Ingredient suppliers are a key partner." },
  { term: "investors", match: ["investor"], general: "People or firms who put money into a company in exchange for a share of it.", chapter: "Java Capital, Mumbai Angels, Prath Ventures and Spring Marketing Capital are among Eat Better's investors." },
  { term: "quick-commerce", match: ["quick commerce"], general: "Apps that deliver everyday items within minutes.", chapter: "Quick-commerce platforms are partners that sell Eat Better's snacks." },
  { term: "corporate clients", match: ["corporate client", "bulk orders"], general: "Companies that buy from a business, often in large quantities.", chapter: "Companies order gifting and bulk orders from Eat Better." },
];
