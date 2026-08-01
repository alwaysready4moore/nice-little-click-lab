import type { Metadata } from "next";
import { FaqSection, type FaqItem } from "@/components/seo/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbStructuredData, faqStructuredData, organizationId } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { CustomWordSearchBuilder } from "./CustomWordSearchBuilder";

const pagePath = "/clicks/custom-word-search";
export const metadata: Metadata = {
  title: "Custom Word Search Gift Maker",
  description: "Turn 10 to 30 names, memories, and favorite things into a printable custom word search gift with an answer key for $3.",
  alternates: { canonical: pagePath },
  openGraph: { title: "Custom Word Search Gift Maker", description: "Make a personalized printable word search from the words only your person would choose.", url: pagePath, type: "website", images: [siteConfig.socialImage] },
};

const faqs = [
  { question: "What comes with the custom word search?", answer: "You receive a printable two-page PDF. Page one contains the personalized word search and word bank. Page two contains the completed answer key." },
  { question: "How many words can I add?", answer: "Add 10 to 30 unique words or short phrases. Spaces and punctuation are removed inside the grid, while the word bank keeps the wording you entered." },
  { question: "How much does it cost?", answer: "The finished custom word search costs $3 USD as a one-time purchase. You can build and preview the puzzle before checkout." },
  { question: "Does it use generative AI?", answer: "No. Programmed puzzle logic places your words and fills the remaining squares. Your entries are not sent to an AI model." },
  { question: "Does the Lab save my puzzle?", answer: "No account or permanent puzzle library is created. Your browser keeps the draft during checkout, so save the downloaded PDF somewhere safe." },
] as const satisfies readonly FaqItem[];

const structuredData = { "@context": "https://schema.org", "@graph": [
  { "@type": "Product", name: "Custom Word Search Gift", sku: "CLICK-004", url: `${siteConfig.url}${pagePath}`, description: "A printable personalized word search made from 10 to 30 customer-supplied words, with a separate answer key.", category: "Personalized digital gift", brand: { "@type": "Brand", name: siteConfig.name }, manufacturer: { "@id": organizationId }, offers: { "@type": "Offer", url: `${siteConfig.url}${pagePath}`, price: "3.00", priceCurrency: "USD", availability: "https://schema.org/InStock" } },
  breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "Clicks", path: "/clicks" }, { name: "Custom Word Search Gift", path: pagePath }]),
  faqStructuredData(faqs),
] };

export default function CustomWordSearchPage() {
  return <><JsonLd data={structuredData} /><CustomWordSearchBuilder /><FaqSection id="custom-word-search-faq" eyebrow="Before Click starts hiding things" title="Questions about the custom word search" intro="The important bits about words, payment, downloads, and privacy." items={faqs} /></>;
}
