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
        <Link href="/clicks" className="meeting-back-link">
          ← All Clicks
        </Link>
        <p className="click-number mt-7">CLICK NO. 001</p>
        <h1 className="mt-5 max-w-4xl text-[clamp(3.5rem,8vw,7rem)] font-black leading-[0.9] tracking-[-0.065em]">
          Meeting Cost Ticker
        </h1>
        <p className="lab-script mt-5 text-4xl text-[var(--accent-strong)] sm:text-5xl">
          Every second counts. Literally.
        </p>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          Add everyone in the room, start the timer, and watch the estimated
          cost of the meeting rise in real time.
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

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <MeetingCostTicker />
      </section>
    </>
  );
}
