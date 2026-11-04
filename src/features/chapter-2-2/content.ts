/**
 * Chapter 2.2 — Digital Marketing & Community Building.
 * SOURCE OF TRUTH: chapter content supplied by SkilliZee (2026-11-04). Examples and key concepts are
 * kept as given. Activity data (practice snack, reviews, numbers) is FICTIONAL and labelled in the UI.
 */

export const CHAPTER = {
  module: "Module 2",
  number: "2.2",
  title: ["Digital Marketing", "& Community Building"] as [string, string],
  subtitle: "Stories, reviews, community — and a great first order that earns the second.",
  objective:
    "Understand how Eat Better attracts new customers, builds trust, encourages purchases, and turns first-time buyers into loyal customers through digital marketing.",
};

const V = "/chapter-2-2/video";
export const VIDEOS = {
  perfectSnack: { title: "Found my perfect snack! — Eat Better Co on YouTube", h264: `${V}/perfect-snack-h264.mp4`, poster: `${V}/perfect-snack-poster.jpg` },
  factory: {
    title: "From a home kitchen to building a 50,000 sq ft factory — Eat Better Co on YouTube",
    h264: `${V}/home-kitchen-to-factory-h264.mp4`,
    av1: `${V}/home-kitchen-to-factory-av1.mp4`,
    poster: `${V}/home-kitchen-to-factory-poster.jpg`,
  },
  sharks: {
    title: "Facing the Sharks? — Eat Better Co on YouTube",
    h264: `${V}/facing-the-sharks-h264.mp4`,
    av1: `${V}/facing-the-sharks-av1.mp4`,
    poster: `${V}/facing-the-sharks-poster.jpg`,
  },
  reel: { title: "Reel by Eat Better Co on Instagram", h264: `${V}/instagram-reel-h264.mp4`, poster: `${V}/instagram-reel-poster.jpg` },
  instagramPost: "DZhqX_7D8S5",
  sharkTank: { id: "x09Y94ksOY0", title: "Eat Better Co के Product पर क्यों हुआ Sharks को Doubt? | Shark Tank India S4 | 100 Crore Valuation" },
};

/* 1 · Community-first marketing */
export const COMMUNITY = {
  text: "Eat Better started by interacting directly with customers through exhibitions and direct selling. These interactions helped the brand understand customer preferences, receive feedback, and improve its products.",
  loop: ["Meet customers", "Hear feedback", "Improve the product"],
  example: "If customers at an exhibition ask for smaller snack packs at affordable prices, the brand can use this feedback to explore a new product size.",
  concept: "Listen to customers first; use their feedback to improve the business.",
};

/* 2 · Owned digital channels */
export const OWNED = {
  text: "A brand can communicate with customers through platforms and channels it manages, such as its website, email lists, and blog.",
  channels: [
    { id: "website", name: "Website", line: "Displays products, prices, ingredients, and purchasing options." },
    { id: "email", name: "Email list", line: "Keeps customers informed about new products, offers, and updates." },
    { id: "blog", name: "The Conscious Eater", line: "Eat Better's blog, which can help educate readers about food and conscious snacking." },
    { id: "squad", name: "Join the Eat Better Co. Squad", line: "Encourages visitors to join the brand's customer communication community." },
  ],
  example: "A customer signs up for emails and later receives an update about a new snack launch.",
  concept: "Owned channels help brands maintain direct relationships with customers rather than depending entirely on social media or marketplaces.",
};

/* 3 · Social media marketing */
export const SOCIAL = {
  text: "Social media helps brands reach people, showcase products, and interact with potential customers.",
  platforms: [
    { id: "instagram", name: "Instagram", line: "Product visuals, reels, collaborations, and engagement." },
    { id: "youtube", name: "YouTube", line: "Longer videos, product demonstrations, vlogs by audience, customer review videos and founder stories." },
    { id: "facebook", name: "Facebook", line: "Community interaction, promotions, and audience reach." },
    { id: "linkedin", name: "LinkedIn", line: "Business updates, founder insights, and professional networking." },
  ],
  example: "An Instagram reel showing a snack being enjoyed during a work break may introduce the product to people looking for convenient snack options.",
  concept: "Each platform serves a different purpose. Brands should select platforms based on their target audience and marketing goals.",
};

/* 4 · Brand storytelling & transparency */
export const STORY = {
  text: "Customers are more likely to connect with a brand when they understand its story, purpose, and people.",
  points: [
    { id: "founder", label: "Founder story" },
    { id: "youtube", label: "YouTube content" },
    { id: "tour", label: "Invitation to book a kitchen tour" },
  ],
  detail: "Eat Better uses its founder story and YouTube content to communicate its journey. Its invitation to book a kitchen tour also provides an opportunity for customers to learn more about its operations.",
  example: "A founder explaining why they started a snack business can make the brand feel more personal and relatable.",
  concept: "Storytelling creates an emotional connection, while transparency can strengthen trust. However, trust also depends on product quality and credible information.",
};

/* 5 · Customer reviews & ratings */
export const REVIEWS = {
  text: "Online customers cannot always taste or inspect a product before buying it. Reviews and ratings help them evaluate other customers' experiences.",
  compare: ["Ratings", "Comments about taste", "Packaging", "Delivery"],
  example: "A customer comparing two snack brands may consider ratings, comments about taste, packaging, and delivery before making a decision.",
  negative: "Brands can also use negative feedback constructively to identify problems and improve their products or service.",
  concept: "Reviews provide social proof, reduce uncertainty, and help customers make informed decisions.",
  roles: ["Social proof", "Less uncertainty", "Informed decisions"],
};

/* 6 · Offers & conversion strategies */
export const OFFERS = {
  text: "A customer may visit a website without making a purchase. Offers can provide an additional reason to buy.",
  types: [
    { id: "combo", name: "Combo discounts", line: "Encourage customers to purchase multiple products together." },
    { id: "ship", name: "Free shipping thresholds", line: "Encourage customers to meet a minimum order value." },
    { id: "limited", name: "Limited-period offers", line: "Create a reason to purchase during a specific period." },
  ],
  example: "If free shipping is available on orders above ₹499, a customer with a ₹400 basket may add another product to qualify.",
  threshold: 499,
  basket: 400,
  concept: "Offers can encourage purchases and increase average order value, but excessive discounts may reduce profit margins.",
};

/* 7 · Marketplaces & quick commerce */
export const MARKETS = {
  text: "Brands can sell through their own websites as well as third-party platforms.",
  places: [
    { id: "amazon", name: "Amazon", line: "Helps customers discover and purchase products through an online marketplace." },
    { id: "quick", name: "Blinkit, Zepto, and Swiggy Instamart", line: "Can offer convenient access to products through quick-commerce services, depending on availability." },
  ],
  example: "A customer who discovers Eat Better on social media may purchase directly from its website, while another may prefer ordering through a quick-commerce app.",
  concept: "Multiple sales channels increase potential reach and convenience, but brands must also consider platform fees, competition, margins, and control over the customer relationship.",
  considerations: ["Platform fees", "Competition", "Margins", "Control over the customer relationship"],
};

export const TAKEAWAY = "For a D2C brand, marketing is not just ads. It is stories, reviews, community and a great first order that earns the second.";

export const THINK = {
  q: "Which would build more trust for a food brand: a celebrity ad or 500 real reviews? Why?",
};
