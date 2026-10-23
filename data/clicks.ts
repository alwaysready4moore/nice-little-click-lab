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
  badge?: string;
  updatedAt: string;
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
    updatedAt: "2026-08-17",
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
    updatedAt: "2026-08-17",
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
    updatedAt: "2026-08-17",
  },
  {
    slug: "custom-word-search",
    number: 4,
    name: "Custom Word Search Gift",
    shortDescription:
      "Hide names, memories, and favorite things in a printable personalized puzzle.",
    status: "live",
    priceLabel: "$3",
    purchaseMode: "stripe",
    deliveryMode: "download",
    featured: true,
    badge: "NEW GIFT",
    updatedAt: "2026-08-17",
  },
  {
    slug: "should-have-been-an-email",
    number: 5,
    name: "Should This Have Been an Email?",
    shortDescription:
      "Answer seven questions and let Click issue a calendar verdict.",
    status: "live",
    priceLabel: "Free",
    purchaseMode: "free",
    deliveryMode: "onsite",
    featured: true,
    updatedAt: "2026-08-17",
  },
  {
    slug: "halloween-candy-calculator",
    number: 6,
    name: "How Much Halloween Candy Do I Need?",
    shortDescription:
      "Plan your trick-or-treat candy, backup stash, and bag count before the porch gets busy.",
    status: "live",
    priceLabel: "Free",
    purchaseMode: "free",
    deliveryMode: "onsite",
    featured: true,
    badge: "SEASONAL",
    updatedAt: "2026-10-06",
  },
  {
    slug: "gift-budget-splitter",
    number: 7,
    name: "Gift Budget Splitter",
    shortDescription:
      "Give every person on your list a fair share of one gift budget, with a cushion for extras.",
    status: "live",
    priceLabel: "Free",
    purchaseMode: "free",
    deliveryMode: "onsite",
    featured: true,
    updatedAt: "2026-10-13",
  },
  {
    slug: "take-your-seat",
    number: 8,
    name: "Take Your Seat",
    shortDescription:
      "Arrange wedding tables or classroom desks, assign everyone a seat, and print the finished chart.",
    status: "live",
    priceLabel: "Free",
    purchaseMode: "free",
    deliveryMode: "onsite",
    featured: true,
    badge: "NEW",
    updatedAt: "2026-10-23",
  },
];
