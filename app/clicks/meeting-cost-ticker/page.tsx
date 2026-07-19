import type { Metadata } from "next";
import Link from "next/link";
import { MeetingCostTicker } from "@/components/meeting-cost/MeetingCostTicker";

export const metadata: Metadata = {
  title: "Meeting Cost Ticker",
  description:
    "Add your attendees, press Start, and estimate the cost of your meeting in real time.",
  alternates: { canonical: "/clicks/meeting-cost-ticker" },
};

export default function MeetingCostTickerPage() {
  return (
    <>
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
