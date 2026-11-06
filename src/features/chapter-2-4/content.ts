/**
 * Chapter 2.4 — Shark Tank India, PR & Campaigns.
 * SOURCE OF TRUTH: chapter content supplied by SkilliZee (2026-11-04). Company statements are kept as
 * given and presented as the brand's/chapter's statements. Game data (investors, practice numbers,
 * audiences) is FICTIONAL practice material and labelled in the UI.
 */

export const CHAPTER = {
  module: "Module 2",
  number: "2.4",
  title: ["Shark Tank India,", "PR & Campaigns"] as [string, string],
  subtitle: "National TV, funding news, festive hampers and corporate clients — attention the brand earned.",
  objective:
    "To analyze how national media exposure, strategic fundraising PR, festive marketing campaigns, and B2B corporate gifting synergistically build brand awareness, consumer trust, and scalable distribution channels.",
};

export const SHARK_TANK_VIDEO = {
  id: "x09Y94ksOY0",
  title: "Eat Better Co के Product पर क्यों हुआ Sharks को Doubt? | Shark Tank India S4 | 100 Crore Valuation",
};

/* 1 · The Shark Tank India advantage */
export const PITCH = {
  ask: { amountLakh: 50, equity: 0.5, valuationCrore: 100 },
  structure:
    "Appearing on Shark Tank India (Season 4), the founders pitched an ask of ₹50 lakh for 0.5% equity, evaluating the business at a ₹100 crore valuation. During the pitch, the team highlighted rapid monthly revenue growth and strong quick-commerce traction.",
  deal: "After multiple offers from investors, the team finalized a deal with Namita Thapar for ₹50 lakh for 0.5% equity, structured with a 1% royalty on sales until her investment is fully recouped.",
  impact:
    "A prime-time national broadcast served as high-trust, top-of-funnel marketing. Beyond immediate sales spikes across D2C and quick-commerce channels, the exposure accelerated conversations with distributors, corporate clients, and modern trade partners.",
  impactReach: ["D2C sales", "Quick-commerce sales", "Distributors", "Corporate clients", "Modern trade partners"],
};

/* 2 · Strategic fundraising as earned PR */
export const FUNDING = {
  validation: "Raising a ₹17 crore Pre-Series A funding round co-led by Prath Ventures and Spring Marketing Capital provided major narrative momentum.",
  credibility:
    "Earned press coverage across leading financial, startup, and FMCG trade publications transformed funding announcements into a trust-building asset. Publicizing institutional backing reassures quick-commerce platforms, retail partners, and suppliers of the brand's long-term operational stability.",
  reassures: ["Quick-commerce platforms", "Retail partners", "Suppliers"],
  coLeads: ["Prath Ventures", "Spring Marketing Capital"],
};

/* 3 · Seasonal campaigns & festive drivers */
export const FESTIVE = {
  moments: "High-demand cultural occasions such as Rakhi and Diwali are converted into major revenue drivers through curated, clean-label gift hampers.",
  gifting:
    "Positioning date-sweetened laddoos and roasted nut mixes as alternatives to traditional sugar-heavy sweets taps into the growing preference for guilt-free festive indulgence.",
  hampers: [
    { img: "/brand/catalog/h-sneh.webp", label: "Sneh Rakhi hamper" },
    { img: "/brand/catalog/h-dhoom.webp", label: "Dhoom Diwali hamper" },
    { img: "/brand/catalog/h-marigold.webp", label: "Marigold Diwali hamper" },
    { img: "/brand/catalog/h-pichwai.webp", label: "Pichwai Diwali hamper" },
  ],
};

/* 4 · Corporate gifting & social proof */
export const CORPORATE = {
  roster: "Displaying well-known corporate gifting clients directly on the brand's website functions as an institutional endorsement.",
  proof:
    "Bulk orders from established corporate buyers validate product quality, taste consistency, and supply chain reliability, which in turn reinforces consumer confidence for individual retail purchases.",
  validates: ["Product quality", "Taste consistency", "Supply chain reliability"],
};

/* 5 · Owned media & on-site press validation */
export const PRESS = {
  featured: "Maintaining a dedicated press section on the website highlighting media features provides immediate proof of legitimacy to first-time website visitors.",
  friction: "On-site press features convert earned media attention into higher storefront conversion rates by lowering purchase hesitation for health-conscious shoppers.",
};

export const TAKEAWAY =
  "PR is earned attention. A compelling brand story (such as traditional kitchen recipes re-engineered for health), transparent product standards, and clean unit economics make it seamless for mainstream and business media to amplify the brand organically.";
