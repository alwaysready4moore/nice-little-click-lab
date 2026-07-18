import Link from "next/link";

export const metadata = { title: "Meeting Cost Ticker" };

export default function MeetingCostTickerPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <p className="click-number">CLICK NO. 001</p>
      <h1 className="mt-5 text-6xl font-black tracking-[-0.06em] sm:text-8xl">Meeting Cost Ticker</h1>
      <p className="mt-6 max-w-2xl text-xl leading-8 text-[var(--muted)]">Watch the estimated cost of a meeting rise in real time.</p>
      <div className="lab-card paper-grid mt-12 p-8 sm:p-12">
        <p className="lab-label">BUILDING NOW</p>
        <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">The shell is ready. The ticker is next.</h2>
        <p className="mt-4 leading-7 text-[var(--muted)]">The first working version will include attendee count, meeting duration, hourly team cost, a live total, and an end-of-meeting receipt. No account. No saved salary data.</p>
        <Link href="/" className="lab-button lab-button-secondary mt-7">Back to the Lab</Link>
      </div>
    </section>
  );
}
