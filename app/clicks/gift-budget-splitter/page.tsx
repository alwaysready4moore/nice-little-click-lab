import type { Metadata } from "next";
import { GiftBudgetSplitter } from "@/components/clicks/gift-budget/GiftBudgetSplitter";
import { FaqSection, type FaqItem } from "@/components/seo/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbStructuredData,
  faqStructuredData,
  organizationId,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const pagePath = "/clicks/gift-budget-splitter";

export const metadata: Metadata = {
  title: "Gift Budget Splitter | Split a Gift Budget Between People",
  description:
    "One gift budget and a long gift list? Split your money between people by gift size, set aside a buffer, and get a printable plan. Free, private, and no account.",
  alternates: { canonical: pagePath },
  openGraph: {
    title: "Gift Budget Splitter",
    description:
      "Tell us your total gift budget and who's on your list. Watch the gift amounts rebalance instantly.",
    url: pagePath,
    type: "website",
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gift Budget Splitter",
    description:
      "One budget. A whole list of people. Let the little gift boxes do the math.",
    images: [siteConfig.socialImage],
  },
};

const faqs = [
  {
    question: "How does Gift Budget Splitter divide my money?",
    answer:
      "Start with one total gift budget and add the people you're buying for. Little something gets one share, Regular gift gets two shares, and Big gift gets three shares. The Click divides the spendable budget by those shares, so changing one person's gift size rebalances everyone automatically.",
  },
  {
    question: "Does it include wrapping, shipping, and sales tax?",
    answer:
      "You can reserve 0%, 5%, or 10% of the total budget for extras. It is a planning cushion, not a sales-tax calculation or shipping-price estimate.",
  },
  {
    question: "Can the gift amounts add up to more than my budget?",
    answer:
      "No. The amounts are calculated in cents, with leftover pennies distributed across gifts. Gifts plus your reserve always equal the total you entered, provided at least one person is on the list.",
  },
  {
    question: "Can I save or share my gift plan?",
    answer:
      "You can copy the plan to your clipboard or print or save it as a PDF from your browser. Nice Little Click Lab does not store your gift list, names, or budget.",
  },
] as const satisfies readonly FaqItem[];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Gift Budget Splitter",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript and a modern web browser",
      url: siteConfig.url + pagePath,
      image: siteConfig.url + siteConfig.socialImage,
      description:
        "A free interactive browser tool that divides a gift budget across recipients by weighted gift size, with a reserve and printable allocations.",
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
      { name: "Gift Budget Splitter", path: pagePath },
    ]),
    faqStructuredData(faqs),
  ],
};

export default function GiftBudgetSplitterPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <GiftBudgetSplitter />
      <FaqSection
        id="gift-budget-faq"
        eyebrow="Gift-list notes"
        title="A few questions before the wrapping begins"
        intro="No accounts, no hidden math, and no surprise bill from the Lab."
        items={faqs}
      />
    </>
  );
}
