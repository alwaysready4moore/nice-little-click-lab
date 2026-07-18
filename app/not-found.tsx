import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="lab-label">Click misplaced</p>
      <h1 className="mt-5 text-6xl font-black tracking-[-0.055em]">Nothing on this shelf.</h1>
      <p className="mt-5 text-lg leading-8 text-[var(--muted)]">This page wandered out of the Lab. Click is probably sleeping through the search party.</p>
      <Link href="/" className="lab-button lab-button-primary mt-8">Back to the Lab</Link>
    </section>
  );
}
