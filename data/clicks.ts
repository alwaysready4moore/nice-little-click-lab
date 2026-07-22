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
    status: "coming-soon",
    priceLabel: "Paid",
    purchaseMode: "stripe",
    deliveryMode: "download",
    featured: false,
  },
  {
    slug: "please-advise",
    number: 3,
    name: "Please Advise",
    shortDescription:
      "Read the email. Choose who needs your response. Protect your fictional career.",
    status: "coming-soon",
    priceLabel: "Free",
    purchaseMode: "free",
    deliveryMode: "onsite",
    featured: false,
  },
];
