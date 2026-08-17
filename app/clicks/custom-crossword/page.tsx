import type { Metadata } from "next";
import { FaqSection, type FaqItem } from "@/components/seo/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbStructuredData,
  faqStructuredData,
  organizationId,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { CustomCrosswordBuilder } from "./CustomCrosswordBuilder";

const pagePath = "/clicks/custom-crossword";

export const metadata: Metadata = {
  title: "Personalized Crossword Gift Maker",
  description:
    "Make a personalized crossword from shared memories and inside jokes. Preview it free, then download the printable puzzle and answer key for $4.",
  alternates: { canonical: pagePath },
  openGraph: {
    title: "Personalized Crossword Gift Maker",
    description:
      "Turn 8 to 15 memories into a printable custom crossword gift with a separate answer key.",
    url: pagePath,
    type: "website",
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Personalized Crossword Gift Maker",
    description:
      "Build a custom crossword from shared memories and download the two-page PDF for $4.",
    images: [siteConfig.socialImage],
  },
};

const crosswordFaqs = [
  {
    question: "What do I receive with the custom crossword?",
    answer:
      "You receive a printable two-page PDF. The first page contains the personalized crossword and clues. The second page contains the completed answer key.",
  },
  {
    question: "How many answers and clues can I add?",
    answer:
      "Add 8 to 15 complete answer-and-clue pairs. Shorter answers with shared letters usually create a more connected crossword, and the preview will tell you when an entry needs editing.",
  },
  {
    question: "How much does the personalized crossword cost?",
    answer:
      "The finished crossword PDF costs $4 USD as a one-time purchase. You can enter your memories and preview the puzzle before opening checkout.",
  },
  {
    question: "Does the crossword maker use generative AI?",
    answer:
      "No. Programmed crossword logic arranges the answers and clues you provide. Your entries are not sent to a generative AI model or AI service.",
  },
  {
    question: "Does Nice Little Click Lab save my puzzle?",
    answer:
      "The Lab does not create an account or permanent puzzle library. Your browser keeps the draft during checkout, and the site processes the details only to validate the puzzle and generate the paid PDF. Save the downloaded file somewhere safe.",
  },
  {
    question: "What happens when an answer does not fit?",
    answer:
      "The preview identifies answers that could not join the grid. Edit the answer, try a shorter synonym, or add entries with more shared letters. Every answer must fit before checkout begins.",
  },
] as const satisfies readonly FaqItem[];

const productStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      name: "Instant Custom Crossword Gift",
      alternateName: "Personalized Crossword Gift Maker",
      sku: "CLICK-002",
      url: `${siteConfig.url}${pagePath}`,
      image: `${siteConfig.url}${siteConfig.socialImage}`,
      description:
        "A personalized printable crossword made from 8 to 15 answers and clues supplied by the customer, delivered as a two-page PDF with an answer key.",
      category: "Personalized digital gift",
      brand: {
        "@type": "Brand",
        name: siteConfig.name,
      },
      manufacturer: { "@id": organizationId },
      offers: {
        "@type": "Offer",
        url: `${siteConfig.url}${pagePath}`,
        price: "4.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@id": organizationId },
      },
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Delivery format",
          value: "Two-page PDF download",
        },
        {
          "@type": "PropertyValue",
          name: "Required entries",
          value: "8 to 15 answer-and-clue pairs",
        },
        {
          "@type": "PropertyValue",
          name: "Account required",
          value: "No",
        },
      ],
    },
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Clicks", path: "/clicks" },
      { name: "Instant Custom Crossword Gift", path: pagePath },
    ]),
    faqStructuredData(crosswordFaqs),
  ],
};

const includedItems = [
  {
    title: "A crossword made from your memories",
    description:
      "Use names, places, private jokes, favorite sayings, and the clues only your person will understand.",
  },
  {
    title: "A preview before payment",
    description:
      "See the grid and fix any answer that refuses to mingle before you open the $4 checkout.",
  },
  {
    title: "A puzzle and separate answer key",
    description:
      "Download a clean two-page PDF that is ready to print, tuck into a card, or add to a gift bundle.",
  },
];

export default function CustomCrosswordPage() {
  return (
    <>
      <JsonLd data={productStructuredData} />
      <CustomCrosswordBuilder />

      <section
        aria-labelledby="crossword-included-heading"
        className="mx-auto max-w-6xl px-6 pb-12 pt-6"
      >
        <p className="lab-label">What the $4 includes</p>
        <h2
          id="crossword-included-heading"
          className="mt-3 max-w-3xl text-3xl font-black tracking-[-0.04em] sm:text-4xl"
        >
          A small personalized gift that is ready in minutes.
        </h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">
          The crossword maker turns the words and clues you provide into a
          printable keepsake. No account, blank template, or puzzle-design
          experience required.
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {includedItems.map((item) => (
            <article className="lab-card p-6" key={item.title}>
              <h3 className="text-xl font-black tracking-[-0.025em]">
                {item.title}
              </h3>
              <p className="mt-3 leading-7 text-[var(--muted)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <FaqSection
        id="custom-crossword-faq"
        eyebrow="Before Click starts arranging"
        title="Questions about the personalized crossword gift"
        intro="Everything important about the entries, preview, payment, download, and privacy lives right here."
        items={crosswordFaqs}
      />
    </>
  );
}
