import { BadgePercent, BookOpen, Briefcase, Camera, Clock, Ear, Globe, Handshake, HeartHandshake, Layers, Mail, MessageSquareHeart, Package, Repeat, Scale, ShieldCheck, ShoppingCart, Store, Truck, Users, Video, Zap } from "lucide-react";
import { HeartLeaf } from "@/components/icons/EbIcons";
import type { LabSpec } from "@/components/learn/LearnLab";

/**
 * Chapter 2.2 learnable labs — one per part of the source. Rules quote the chapter's own definitions,
 * examples and key concepts; anything else is labelled "general explanation". Every comment, review,
 * message, customer and number in the tasks is FICTIONAL practice material.
 */

const CH = "From the chapter";
const GEN = "General explanation";

export const LABS_22: Record<"community" | "owned" | "social" | "story" | "reviews" | "offers" | "markets", LabSpec> = {
  community: {
    id: "22-community",
    skill: "turn customer feedback into a business improvement.",
    rules: [
      { id: "listen", title: "Listen first", text: "Listen to customers first; use their feedback to improve the business.", icon: Ear, source: CH },
      { id: "theme", title: "Group it by theme", text: "Sort comments into themes (taste, size & price, packaging) so patterns show.", icon: Layers, source: GEN },
      { id: "repeat", title: "Act on what repeats", text: "One comment is an opinion; the same comment from many people is a signal.", icon: Repeat, source: GEN },
      { id: "example", title: "The chapter’s example", text: "Customers asking for smaller, affordable packs → explore a new product size.", icon: Package, source: CH },
    ],
    task: {
      kind: "classify",
      prompt: "You collected these comments at an exhibition stall. Sort each into its theme.",
      buckets: [
        { id: "taste", label: "Taste" },
        { id: "size", label: "Size & price" },
        { id: "pack", label: "Packaging" },
      ],
      items: [
        { id: "spicy", label: "“A bit too spicy for my kids.”", answer: "taste", why: "It’s about the flavour itself — a recipe question.", rule: "theme" },
        { id: "try", label: "“A smaller pack would be easier to try.”", answer: "size", why: "It asks for a different size — the size & price theme.", rule: "theme" },
        { id: "cost", label: "“The big pack costs a lot for a first try.”", answer: "size", why: "Price for a first try → also solved by a smaller, affordable pack.", rule: "example" },
        { id: "tiffin", label: "“Is there a mini pack for my child’s tiffin?”", answer: "size", why: "Another request for a smaller size — the theme is repeating.", rule: "repeat" },
        { id: "open", label: "“The pouch was hard to open.”", answer: "pack", why: "It’s about the pack, not the snack — a packaging fix.", rule: "theme" },
        { id: "salt", label: "“Could it have a little less salt?”", answer: "taste", why: "Flavour again — a taste note for the kitchen.", rule: "theme" },
      ],
    },
    note: "Practice comments, not real customer feedback. Notice which theme repeats most.",
    create: {
      prompt: "Size & price came up three times. Write the product change you would test, and how you would tell customers about it.",
      placeholder: "We will test … and tell customers by …",
      checklist: ["It responds to the theme that repeated most", "It’s a change the business can actually test", "I said how customers will hear about it", "It came from listening, not guessing"],
    },
  },

  owned: {
    id: "22-owned",
    skill: "pick the right owned channel for a message and explain why owned channels matter.",
    rules: [
      { id: "web", title: "Website", text: "Displays products, prices, ingredients and purchasing options.", icon: Globe, source: CH },
      { id: "email", title: "Email list", text: "Keeps customers informed about new products, offers and updates.", icon: Mail, source: CH },
      { id: "blog", title: "The Conscious Eater (blog)", text: "Can help educate readers about food and conscious snacking.", icon: BookOpen, source: CH },
      { id: "squad", title: "Join the Eat Better Co. Squad", text: "Encourages visitors to join the brand’s customer community. Owned channels keep a direct relationship.", icon: Users, source: CH },
    ],
    task: {
      kind: "classify",
      prompt: "Route each practice message to the best owned channel.",
      buckets: [
        { id: "web", label: "Website" },
        { id: "email", label: "Email list" },
        { id: "blog", label: "Blog" },
        { id: "squad", label: "Squad" },
      ],
      items: [
        { id: "ingr", label: "Full ingredients and price of a snack", answer: "web", why: "Products, prices and ingredients live on the website.", rule: "web" },
        { id: "launch", label: "“A new snack launches next week” — tell past buyers", answer: "email", why: "Email keeps existing customers informed about new products.", rule: "email" },
        { id: "label", label: "Article: how to read a snack label", answer: "blog", why: "Educating readers about conscious snacking is the blog’s job.", rule: "blog" },
        { id: "join", label: "Invite fans to join the community", answer: "squad", why: "That’s exactly what the Squad is for.", rule: "squad" },
        { id: "offer", label: "A weekend offer for subscribers", answer: "email", why: "Offers and updates go to the email list.", rule: "email" },
        { id: "buy", label: "Checkout for a laddoo box", answer: "web", why: "Purchasing options are on the website.", rule: "web" },
      ],
    },
    note: "Practice messages written for this activity.",
    create: {
      prompt: "Plan a launch across two owned channels, then say why owning them beats relying only on social media or marketplaces.",
      placeholder: "Channel 1: … Channel 2: … Owned matters because …",
      checklist: ["Each message fits its channel’s purpose", "I used two different owned channels", "I explained the direct relationship owned channels give", "Nothing depends only on social media or a marketplace"],
    },
  },

  social: {
    id: "22-social",
    skill: "match content to the social platform whose purpose fits it.",
    rules: [
      { id: "ig", title: "Instagram", text: "Product visuals, reels, collaborations and engagement.", icon: Camera, source: CH },
      { id: "yt", title: "YouTube", text: "Longer videos, product demos, audience vlogs, customer review videos and founder stories.", icon: Video, source: CH },
      { id: "fb", title: "Facebook", text: "Community interaction, promotions and audience reach.", icon: Users, source: CH },
      { id: "li", title: "LinkedIn", text: "Business updates, founder insights and professional networking. Pick platforms by audience and goals.", icon: Briefcase, source: CH },
    ],
    task: {
      kind: "classify",
      prompt: "Match each practice content idea to its best platform.",
      buckets: [
        { id: "ig", label: "Instagram" },
        { id: "yt", label: "YouTube" },
        { id: "fb", label: "Facebook" },
        { id: "li", label: "LinkedIn" },
      ],
      items: [
        { id: "reel", label: "A 15-second reel of a snack enjoyed on a work break", answer: "ig", why: "Short product reels are Instagram’s strength (the chapter’s own example).", rule: "ig" },
        { id: "founder", label: "A 10-minute founder story about building the factory", answer: "yt", why: "Longer founder stories belong on YouTube.", rule: "yt" },
        { id: "funding", label: "Business update: the company raised a funding round", answer: "li", why: "Business updates and founder insights suit LinkedIn’s professional audience.", rule: "li" },
        { id: "promo", label: "A weekend promotion shared with local community groups", answer: "fb", why: "Community interaction and promotions fit Facebook.", rule: "fb" },
        { id: "review", label: "A customer’s review video", answer: "yt", why: "Customer review videos are listed under YouTube.", rule: "yt" },
        { id: "collab", label: "A collaboration post with a food creator", answer: "ig", why: "Collaborations are an Instagram format.", rule: "ig" },
      ],
    },
    note: "Practice content ideas written for this activity.",
    create: {
      prompt: "Pick a target audience, then plan one post for each of two platforms and say why each platform fits.",
      placeholder: "Audience: … · Platform 1: … because … · Platform 2: … because …",
      checklist: ["I named a target audience", "Each post fits its platform’s purpose", "I explained why each platform suits that audience", "The two posts aren’t identical copies"],
    },
  },

  story: {
    id: "22-story",
    skill: "build a brand story that earns trust, and know where storytelling stops.",
    rules: [
      { id: "purpose", title: "Story = purpose and people", text: "Customers connect when they understand the brand’s story, purpose and people.", icon: HeartHandshake, source: CH },
      { id: "emotion", title: "Stories create connection", text: "A founder explaining why they started makes a brand feel personal and relatable.", icon: HeartLeaf, source: CH },
      { id: "transparency", title: "Transparency builds trust", text: "Eat Better invites customers to book a kitchen tour — proof you can check.", icon: ShieldCheck, source: CH },
      { id: "limits", title: "Stories aren’t enough", text: "Trust also depends on product quality and credible information.", icon: Scale, source: CH },
    ],
    task: {
      kind: "order",
      prompt: "Put this founder-story post in the order that builds connection, then trust.",
      items: [
        { id: "problem", label: "The problem: tired of choosing between tasty and healthy for the family", why: "Start with the human problem — that’s what people connect with.", rule: "emotion" },
        { id: "kitchen", label: "The start: small experiments in a home kitchen", why: "Show the people and the purpose behind the brand.", rule: "purpose" },
        { id: "change", label: "What changed: cleaner ingredients, same familiar taste", why: "Tell what the brand actually does differently.", rule: "purpose" },
        { id: "proof", label: "Proof you can check: book a kitchen tour", why: "Transparency turns a nice story into something you can trust.", rule: "transparency" },
        { id: "try", label: "The invitation: try a pack and tell us what you think", why: "End by inviting people in — and back to quality they can taste.", rule: "limits" },
      ],
    },
    note: "Story beats from Chapter 1.3 (Eat Better’s origin); the post itself is a practice draft.",
    create: {
      prompt: "Write a short founder-story caption for a practice snack brand using this arc.",
      placeholder: "We started because … Today … Come and see …",
      checklist: ["It opens with a real problem or purpose", "It shows the people behind the brand", "It offers proof or transparency", "It makes no claim the product can’t back up"],
    },
  },

  reviews: {
    id: "22-reviews",
    skill: "use reviews as social proof and reply to negative feedback constructively.",
    rules: [
      { id: "uncertainty", title: "Reviews reduce uncertainty", text: "Online customers can’t taste or inspect first, so others’ experiences help them decide.", icon: ShoppingCart, source: CH },
      { id: "proof", title: "Social proof", text: "Ratings and comments about taste, packaging and delivery guide choices.", icon: Users, source: CH },
      { id: "constructive", title: "Use negative feedback", text: "Treat it as a way to find problems and improve the product or service.", icon: Repeat, source: CH },
      { id: "reply", title: "A good reply", text: "Thank → own the specific issue → fix it → invite them back. Never argue.", icon: MessageSquareHeart, source: GEN },
    ],
    task: {
      kind: "build",
      prompt: "Build a reply to this practice 2-star review: “Tasty, but the pouch arrived crushed.”",
      previewTitle: "Your reply",
      slots: [
        {
          id: "open",
          label: "Opening",
          options: [
            { id: "a", text: "Thank you for telling us — and we’re glad you liked the taste.", best: true, why: "Thanks them and notices what went right.", rule: "reply" },
            { id: "b", text: "Our pouches are perfectly fine.", best: false, why: "Defensive — it argues instead of listening.", rule: "constructive" },
            { id: "c", text: "Okay.", best: false, why: "Too cold; it shows nobody really read the review.", rule: "reply" },
          ],
        },
        {
          id: "own",
          label: "Own the issue",
          options: [
            { id: "a", text: "A crushed pouch isn’t the experience we want you to have.", best: true, why: "Names the exact problem and owns it.", rule: "reply" },
            { id: "b", text: "Sorry for any inconvenience caused.", best: false, why: "Generic — it doesn’t show you understood the problem.", rule: "reply" },
            { id: "c", text: "The courier must have dropped it.", best: false, why: "Blaming someone else doesn’t help the customer.", rule: "constructive" },
          ],
        },
        {
          id: "fix",
          label: "Fix it",
          options: [
            { id: "a", text: "We’re sending a replacement and checking how we pack orders.", best: true, why: "Fixes it for them and uses the feedback to improve the service.", rule: "constructive" },
            { id: "b", text: "Please be careful when opening deliveries.", best: false, why: "Puts the fix on the customer.", rule: "constructive" },
            { id: "c", text: "Nothing we can do now.", best: false, why: "Wastes the chance to improve.", rule: "constructive" },
          ],
        },
        {
          id: "close",
          label: "Close",
          options: [
            { id: "a", text: "Hope your next order arrives perfect — we’d love to hear from you again.", best: true, why: "Invites them back — a great first order earns the second.", rule: "reply" },
            { id: "b", text: "Please remove your review.", best: false, why: "Asking to hide feedback destroys trust.", rule: "proof" },
            { id: "c", text: "(no closing)", best: false, why: "Ending abruptly misses the chance to win them back.", rule: "reply" },
          ],
        },
      ],
    },
    note: "The review and every reply option are practice material, not real Eat Better reviews.",
    create: {
      prompt: "Write your own reply to this practice review: “Too salty for me.”",
      placeholder: "Thank you …",
      checklist: ["Thanks the customer", "Names their specific issue", "Offers a fix or a next step", "Invites them back without arguing"],
    },
  },

  offers: {
    id: "22-offers",
    skill: "choose an offer that fits a goal and weigh it against profit margin.",
    rules: [
      { id: "combo", title: "Combo discounts", text: "Encourage customers to buy multiple products together.", icon: Package, source: CH },
      { id: "threshold", title: "Free shipping thresholds", text: "Encourage customers to reach a minimum order value.", icon: Truck, source: CH },
      { id: "limited", title: "Limited-period offers", text: "Create a reason to buy within a specific period.", icon: Clock, source: CH },
      { id: "margin", title: "Watch the margin", text: "Offers can raise average order value, but excessive discounts may reduce profit margins.", icon: BadgePercent, source: CH },
    ],
    task: {
      kind: "choose",
      prompt: "Pick the best offer, or the best response, for each goal.",
      cases: [
        {
          id: "two",
          title: "Shoppers usually buy one pack. You want them to buy two different snacks together.",
          options: [
            { id: "a", text: "A combo discount", best: true, why: "Combos reward buying multiple products together.", rule: "combo" },
            { id: "b", text: "A limited-period offer", best: false, why: "That creates urgency, not a bigger mixed basket.", rule: "limited" },
            { id: "c", text: "A higher shipping fee", best: false, why: "That pushes people away instead of growing the basket.", rule: "threshold" },
          ],
        },
        {
          id: "basket",
          title: "Free shipping applies above ₹499. A customer has ₹400 in the basket.",
          context: "What are they most likely to do?",
          options: [
            { id: "a", text: "Add another product to qualify", best: true, why: "That’s the chapter’s own example — the threshold nudges the order value up.", rule: "threshold" },
            { id: "b", text: "Remove items to save money", best: false, why: "The threshold gives a reason to add, not remove.", rule: "threshold" },
            { id: "c", text: "Nothing changes", best: false, why: "A threshold within reach usually changes behaviour.", rule: "threshold" },
          ],
        },
        {
          id: "festive",
          title: "You want a burst of orders during one festive week.",
          options: [
            { id: "a", text: "A limited-period offer", best: true, why: "A clear deadline gives a reason to buy now.", rule: "limited" },
            { id: "b", text: "A permanent price cut", best: false, why: "There’s no urgency, and margin is lost all year.", rule: "margin" },
            { id: "c", text: "A free shipping threshold only", best: false, why: "Good for basket size, but it doesn’t create urgency for that week.", rule: "limited" },
          ],
        },
        {
          id: "half",
          title: "A teammate suggests 50% off everything, always.",
          options: [
            { id: "a", text: "Push back: excessive discounts may reduce profit margins — use targeted offers", best: true, why: "That’s the chapter’s key concept.", rule: "margin" },
            { id: "b", text: "Agree — more discount is always better", best: false, why: "Sales may rise, but each order can stop making money.", rule: "margin" },
            { id: "c", text: "Make it 70% instead", best: false, why: "Even bigger margin losses.", rule: "margin" },
          ],
        },
      ],
    },
    note: "Practice scenarios; ₹499 / ₹400 is the chapter’s example.",
    create: {
      prompt: "Design one offer for a practice snack launch: the goal, the offer type, and its margin risk.",
      placeholder: "Goal: … · Offer: … · Margin risk: …",
      checklist: ["I named one clear goal", "The offer type fits that goal", "I named the margin risk", "The discount isn’t excessive or permanent"],
    },
  },

  markets: {
    id: "22-markets",
    skill: "choose sales channels for different customers and weigh their trade-offs.",
    rules: [
      { id: "own", title: "Own website", text: "Sell directly and keep the customer relationship.", icon: Store, source: CH },
      { id: "amazon", title: "Marketplace (e.g. Amazon)", text: "Helps customers discover and buy products.", icon: ShoppingCart, source: CH },
      { id: "qc", title: "Quick commerce", text: "Blinkit, Zepto and Swiggy Instamart offer convenient access, depending on availability.", icon: Zap, source: CH },
      { id: "trade", title: "Weigh the trade-offs", text: "More channels mean more reach, but consider platform fees, competition, margins and control over the relationship.", icon: Handshake, source: CH },
    ],
    task: {
      kind: "choose",
      prompt: "Which channel fits each fictional customer, or each goal?",
      cases: [
        {
          id: "riya",
          title: "Riya discovered the brand on social media and wants to buy straight from it.",
          options: [
            { id: "a", text: "The brand’s own website", best: true, why: "The chapter’s example: discover on social, buy direct on the website.", rule: "own" },
            { id: "b", text: "A marketplace search", best: false, why: "She already knows the brand; sending her elsewhere adds fees and competitors.", rule: "trade" },
            { id: "c", text: "Nowhere — social only", best: false, why: "Social media introduces; it isn’t where she buys here.", rule: "own" },
          ],
        },
        {
          id: "arjun",
          title: "Arjun wants a snack delivered within minutes during a late study session.",
          options: [
            { id: "a", text: "A quick-commerce app", best: true, why: "Quick commerce is about convenience, depending on availability.", rule: "qc" },
            { id: "b", text: "The brand’s website", best: false, why: "Standard delivery won’t arrive in minutes.", rule: "qc" },
            { id: "c", text: "An email newsletter", best: false, why: "That’s a communication channel, not a way to get the snack now.", rule: "qc" },
          ],
        },
        {
          id: "meera",
          title: "Meera searches a big online marketplace for “millet snacks” and compares brands.",
          options: [
            { id: "a", text: "Be listed on the marketplace", best: true, why: "Marketplaces help customers discover products they didn’t know yet.", rule: "amazon" },
            { id: "b", text: "Only the brand’s website", best: false, why: "She isn’t looking for the brand yet — she won’t find it there.", rule: "amazon" },
            { id: "c", text: "Only quick commerce", best: false, why: "She’s comparing and discovering, not looking for instant delivery.", rule: "amazon" },
          ],
        },
        {
          id: "goal",
          title: "The brand wants to keep the customer relationship and protect margins.",
          options: [
            { id: "a", text: "Grow sales on its own website", best: true, why: "Owning the channel avoids platform fees and keeps control of the relationship.", rule: "trade" },
            { id: "b", text: "Move every sale to marketplaces", best: false, why: "That adds fees and competition and loses control of the relationship.", rule: "trade" },
            { id: "c", text: "Stop selling online", best: false, why: "That throws away reach entirely.", rule: "trade" },
          ],
        },
      ],
    },
    note: "Riya, Arjun and Meera are fictional customers.",
    create: {
      prompt: "Choose a channel mix for a practice snack launch and give one benefit and one trade-off for each channel.",
      placeholder: "Channel: … · Benefit: … · Trade-off: …",
      checklist: ["I used at least two channels", "Each has a benefit (reach or convenience)", "Each has a trade-off (fees, competition, margins or control)", "The mix fits who I want to reach"],
    },
  },
};
