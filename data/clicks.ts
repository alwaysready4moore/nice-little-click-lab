export type Click = {
  slug: string;
  number: number;
  name: string;
  shortDescription: string;
  status: "coming-soon" | "live" | "retired";
  priceLabel: string;
  purchaseMode: "free" | "stripe" | "etsy";
  deliveryMode: "onsite" | "download" | "external";
  featured: boolean;
};

export const clicks: Click[] = [
  {
    slug: "meeting-cost-ticker",
    number: 1,
    name: "Meeting Cost Ticker",
    shortDescription: "Watch the estimated cost of a meeting rise in real time.",
    status: "live",
    priceLabel: "Free",
    purchaseMode: "free",
    deliveryMode: "onsite",
    featured: true,
  },
  {
    slug: "custom-crossword",
    number: 2,
    name: "Instant Custom Crossword Gift",
    shortDescription: "Turn shared memories into a personalized crossword gift.",
    status: "live",
    priceLabel: "$4",
    purchaseMode: "stripe",
    deliveryMode: "download",
    featured: true,
  },
  {
    slug: "please-advise",
    number: 3,
    name: "Please Advise",
    shortDescription:
      "Read the email. Choose who needs your response. Protect your fictional career.",
    status: "live",
    priceLabel: "Free",
    purchaseMode: "free",
    deliveryMode: "onsite",
    featured: true,
  },
  {
    slug: "custom-word-search",
    number: 4,
    name: "Custom Word Search Gift",
    shortDescription: "Hide names, memories, and favorite things in a printable personalized puzzle.",
    status: "live",
    priceLabel: "$3",
    purchaseMode: "stripe",
    deliveryMode: "download",
    featured: true,
  },

];
