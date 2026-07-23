import type { Metadata } from "next";
import Link from "next/link";
import { FaqSection, type FaqItem } from "@/components/seo/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { MeetingCostTicker } from "@/components/meeting-cost/MeetingCostTicker";
import {
  breadcrumbStructuredData,
  faqStructuredData,
  organizationId,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const pagePath = "/clicks/meeting-cost-ticker";

export const metadata: Metadata = {
  title: "Free Meeting Cost Calculator",
  description:
    "Estimate the cost of a meeting in real time. Add attendees, adjust salary estimates, run the timer, and download a free meeting receipt.",
  alternates: { canonical: pagePath },
  openGraph: {
    title: "Free Meeting Cost Calculator",
    description:
      "Add attendees and watch the estimated cost of a meeting rise in real time. Free, private, and no sign-up required.",
    url: pagePath,
    type: "website",
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Meeting Cost Calculator",
    description:
      "Estimate a meeting's running cost and download a receipt. No account required.",
    images: [siteConfig.socialImage],
  },
};

const meetingFaqs = [
  {
    question: "What is a meeting cost calculator?",
    answer:
      "A meeting cost calculator estimates how much employee time costs while a meeting is running. Meeting Cost Ticker combines the hourly cost of the attendees you add, then applies that total to the elapsed time.",
  },
  {
    question: "How does Meeting Cost Ticker calculate the estimate?",
    answer:
      "The tool adds the hourly salary costs for every attendee group and converts that total into a running per-second estimate. You can use the suggested values or replace them with your own figures.",
  },
  {
    question: "Is Meeting Cost Ticker free?",
    answer:
      "Yes. The full meeting timer, attendee controls, live estimate, and downloadable receipt are free to use without an account.",
  },
  {
    question: "Does the Lab save meeting or salary information?",
    answer:
      "No. The meeting details and calculations stay in your browser. Nice Little Click Lab does not submit or save the attendee and salary values you enter.",
  },
  {
    question: "Are the results exact accounting figures?",
    answer:
      "No. The total is an estimate based on the values entered into the tool. It is meant for awareness, conversation, and planning rather than payroll, billing, or financial reporting.",
  },
] as const satisfies readonly FaqItem[];

const softwareApplicationStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Meeting Cost Ticker",
      alternateName: "Free Meeting Cost Calculator",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript and a modern web browser",
      url: `${siteConfig.url}${pagePath}`,
      description:
        "A free browser-based tool that estimates the running cost of a meeting using attendee counts and editable salary values.",
      inLanguage: siteConfig.locale,
      isAccessibleForFree: true,
      publisher: { "@id": organizationId },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${siteConfig.url}${pagePath}`,
      },
      featureList: [
        "Live meeting cost estimate",
        "Editable salary estimates",
        "Attendee groups",
        "Pause and resume controls",
        "Downloadable meeting receipt",
        "No account required",
        "Browser-only calculations",
      ],
    },
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Clicks", path: "/clicks" },
      { name: "Meeting Cost Ticker", path: pagePath },
    ]),
    faqStructuredData(meetingFaqs),
  ],
};

const steps = [
  {
    number: "1",
    title: "Add your attendees",
    description:
      "Choose each person’s job title, or adjust the salary estimate yourself.",
  },
  {
    number: "2",
    title: "Start the meeting",
    description:
      "Press Start and watch the estimated cost rise while the meeting is running.",
  },
  {
    number: "3",
    title: "End and download",
    description:
      "Finish the meeting and save a printable receipt with the final estimate.",
  },
];

export default function MeetingCostTickerPage() {
  return (
    <>
      <JsonLd data={softwareApplicationStructuredData} />

      <section className="meeting-hero mx-auto max-w-6xl px-6 pb-10 pt-14 sm:pt-20">
        <Link href="/clicks" className="meeting-back-link">
          ← All Clicks
        </Link>
        <p className="click-number mt-7">CLICK NO. 001 · FREE</p>
        <h1 className="mt-5 max-w-4xl text-[clamp(3.5rem,8vw,7rem)] font-black leading-[0.9] tracking-[-0.065em]">
          Meeting Cost Ticker
        </h1>
        <p className="lab-script mt-5 text-4xl text-[var(--accent-strong)] sm:text-5xl">
          Every second counts. Literally.
        </p>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          This free meeting cost calculator estimates how much employee time is
          costing while the meeting runs. Add the people in the room, adjust any
          salary estimate, and watch the total rise in real time.
        </p>
      </section>

      <section
        aria-labelledby="how-it-works-heading"
        className="mx-auto max-w-6xl px-6 pb-10"
      >
        <div className="lab-card p-6 sm:p-8">
          <p className="lab-label">NEW HERE?</p>
          <h2
            id="how-it-works-heading"
            className="mt-3 text-3xl font-black tracking-[-0.04em] sm:text-4xl"
          >
            Here’s how it works.
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article
                key={step.number}
                className="rounded-[1.25rem] border border-[var(--border)] bg-white/55 p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-lg font-black text-[var(--accent-strong)]">
                  {step.number}
                </div>
                <h3 className="mt-4 text-xl font-black tracking-[-0.025em]">
                  {step.title}
                </h3>
                <p className="mt-2 leading-7 text-[var(--muted)]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
          <p className="lab-note mt-6">
            Nothing is submitted or saved. The whole meeting stays in your browser.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <MeetingCostTicker />
      </section>

      <FaqSection
        id="meeting-cost-faq"
        eyebrow="Meeting math, explained"
        title="Questions about the meeting cost calculator"
        intro="The number is meant to make an invisible cost visible, without pretending it belongs in the accounting ledger."
        items={meetingFaqs}
      />
    </>
  );
}
