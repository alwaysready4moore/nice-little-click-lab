import type { Metadata } from "next";
import { HalloweenCandyCalculator } from "@/components/clicks/halloween-candy/HalloweenCandyCalculator";
import { FaqSection, type FaqItem } from "@/components/seo/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbStructuredData,
  faqStructuredData,
  organizationId,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const pagePath = "/clicks/halloween-candy-calculator";

export const metadata: Metadata = {
  title: "Halloween Candy Calculator | How Much Candy Do I Need?",
  description:
    "Estimate how much Halloween candy to buy for trick-or-treaters, add a just-in-case buffer, and calculate how many bags you need. Free and private.",
  alternates: { canonical: pagePath },
  openGraph: {
    title: "How Much Halloween Candy Do I Need?",
    description:
      "A free Halloween candy calculator for planning pieces, backup candy, and bags before trick-or-treat night.",
    url: pagePath,
    type: "website",
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "How Much Halloween Candy Do I Need?",
    description:
      "Plan your trick-or-treat candy without panic-rationing the good stuff at 7:43 PM.",
    images: [siteConfig.socialImage],
  },
};

const faqs = [
  {
    question: "How does the Halloween candy calculator work?",
    answer:
      "Choose how many trick-or-treaters you expect, how many pieces each visitor gets, and how much backup candy you want. The calculator multiplies the visitor estimate by your pieces-per-person choice, then adds your selected buffer.",
  },
  {
    question: "What if I do not know how many trick-or-treaters to expect?",
    answer:
      "Use the planning mode for an unknown turnout. Pick how many hours you expect to hand out candy and choose a light, steady, or very busy traffic assumption. Those are planning presets, not a prediction about your neighborhood.",
  },
  {
    question: "How do I calculate the number of candy bags to buy?",
    answer:
      "Enter the number of pieces printed on the bag you are considering. Bag sizes vary, so the calculator uses the package count you provide instead of pretending every large bag contains the same amount.",
  },
  {
    question: "Does Nice Little Click Lab save my Halloween plans?",
    answer:
      "No. The calculator runs in your browser. Your visitor estimate, candy settings, and bag count are not saved to an account or sent to an AI service.",
  },
] as const satisfies readonly FaqItem[];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Halloween Candy Calculator",
      alternateName: "How Much Halloween Candy Do I Need?",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript and a modern web browser",
      url: siteConfig.url + pagePath,
      image: siteConfig.url + siteConfig.socialImage,
      description:
        "A free browser calculator for estimating Halloween candy pieces, backup candy, and package counts for trick-or-treaters.",
      inLanguage: siteConfig.locale,
      isAccessibleForFree: true,
      publisher: { "@id": organizationId },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: siteConfig.url + pagePath,
        seller: { "@id": organizationId },
      },
    },
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Clicks", path: "/clicks" },
      { name: "Halloween Candy Calculator", path: pagePath },
    ]),
    faqStructuredData(faqs),
  ],
};

export default function HalloweenCandyCalculatorPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <HalloweenCandyCalculator />
      <FaqSection
        id="halloween-candy-faq"
        eyebrow="Porch notes"
        title="Questions before the tiny hordes arrive"
        intro="The candy math is simple on purpose. The important part is knowing what assumptions went into your pile."
        items={faqs}
      />
    </>
  );
}
