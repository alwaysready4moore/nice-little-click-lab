import type { Metadata } from "next";
import Link from "next/link";
import { MeetingCostTicker } from "@/components/meeting-cost/MeetingCostTicker";

export const metadata: Metadata = {
  title: "Meeting Cost Ticker",
  description:
    "Add your attendees, press Start, and estimate the cost of your meeting in real time.",
  keywords: [
    "meeting cost calculator",
    "meeting cost ticker",
    "meeting salary calculator",
    "cost of meetings",
    "meeting timer",
  ],
  alternates: { canonical: "/clicks/meeting-cost-ticker" },
  openGraph: {
    title: "Meeting Cost Ticker",
    description:
      "Add attendees and watch the estimated cost of your meeting rise in real time.",
    url: "/clicks/meeting-cost-ticker",
    type: "website",
  },
};

const softwareApplicationStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Meeting Cost Ticker",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://www.nicelittleclick.com/clicks/meeting-cost-ticker",
  description:
    "A free browser-based tool that estimates the cost of a meeting in real time using attendee salaries.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Live meeting cost estimate",
    "Editable salary defaults",
    "Attendee groups",
    "Pause and resume",
    "Downloadable meeting receipt",
    "No account required",
  ],
};

export default function MeetingCostTickerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationStructuredData).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <section className="meeting-hero mx-auto max-w-6xl px-6 pb-10 pt-14 sm:pt-20">
        <Link href="/clicks" className="meeting-back-link">← All Clicks</Link>
        <p className="click-number mt-7">CLICK NO. 001</p>
        <h1 className="mt-5 max-w-4xl text-[clamp(3.5rem,8vw,7rem)] font-black leading-[0.9] tracking-[-0.065em]">
          Meeting Cost Ticker
        </h1>
        <p className="lab-script mt-5 text-4xl text-[var(--accent-strong)] sm:text-5xl">
          Every second counts. Literally.
        </p>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          Add your attendees, press Start, and estimate the cost of your meeting.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <MeetingCostTicker />
      </section>
    </>
  );
}
