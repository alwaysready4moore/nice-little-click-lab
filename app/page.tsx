import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-14 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:pb-20 lg:pt-20">
        <div>
          <p className="lab-label">GOOD LITTLE THINGS FOR THE INTERNET</p>
          <h1 className="mt-6 max-w-2xl text-[clamp(3.45rem,7vw,6.6rem)] font-black leading-[0.88] tracking-[-0.065em]">
            Useful little tools for <span className="lab-script block pt-3 font-normal">oddly specific moments.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--muted)]">
            Useful, delightful Clicks made to solve one small problem, make one thoughtful gift, or rescue one mildly ridiculous situation.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/clicks" className="lab-button lab-button-primary">Explore the Clicks</Link>
            <Link href="/about" className="lab-button lab-button-secondary">Peek inside the Lab</Link>
          </div>
        </div>

        <div className="relative lg:pl-6">
          <div className="folder-stack" aria-hidden="true" />
          <article className="paper-grid relative z-10 overflow-hidden rounded-[1.15rem] border border-[var(--border-strong)] bg-[var(--surface)] p-6 shadow-[0_30px_65px_rgba(75,50,20,0.16)] sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
              <p className="lab-label text-[0.82rem]">FRESH FROM THE LAB</p>
              <span className="stamp-mark">click</span>
            </div>
            <div className="grid gap-6 py-7 sm:grid-cols-[7.5rem_1fr] sm:items-center">
              <div className="rounded-md border border-[var(--accent-strong)] bg-white/60 p-4 text-center">
                <p className="text-[0.72rem] font-extrabold tracking-[0.18em] text-[var(--accent-strong)]">CLICK NO.</p>
                <p className="mt-1 text-5xl font-black text-[var(--accent-strong)]">001</p>
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-[-0.04em] sm:text-4xl">Meeting Cost Ticker</h2>
                <p className="mt-3 text-lg leading-7 text-[var(--muted)]">Finally, a running total for the most expensive habit at work.</p>
              </div>
            </div>
            <div className="grid gap-5 border-t border-[var(--border)] pt-5 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-xs font-extrabold tracking-[0.16em] text-[var(--accent-strong)]">PROTOTYPE STATUS</p>
                <p className="mt-3 max-w-md font-mono text-sm leading-6">In active construction. Core timer first. Opinionated receipt shortly after.</p>
              </div>
              <Link href="/clicks/meeting-cost-ticker" className="lab-button lab-button-secondary">See the plan</Link>
            </div>
          </article>
          <div className="sticky-note absolute -right-2 -top-7 z-20 rotate-3">currently<br />tinkering...</div>
          <div className="click-supervisor" aria-label="Click, the sleepy lab assistant">
            <Image
              src="/images/click/click-sleeping-labcoat.png"
              alt="Click sleeping under a tiny lab coat"
              width={360}
              height={240}
              priority
            />
          </div>
          <p className="font-handwritten ml-auto -mt-3 max-w-xs rotate-1 text-xl text-[var(--accent-strong)]">supervised by one sleepy lab assistant.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-[0.95fr_1.05fr]">
        <article className="lab-card p-7 sm:p-9">
          <p className="lab-label">WHAT IS A CLICK?</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.045em]">One useful little thing.</h2>
          <p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">A tiny tool, game, or gift made for one oddly specific moment. Small in scope. Big on usefulness. Made with care.</p>
          <Link href="/about" className="mt-6 inline-flex font-bold text-[var(--accent-strong)] hover:underline">Learn more about the Lab →</Link>
        </article>

        <article className="next-card relative overflow-hidden rounded-[1.4rem] border border-[#e3c783] p-7 sm:p-9">
          <p className="lab-label">NEXT OUT OF THE LAB</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.045em]">Instant Custom Crossword Gift</h2>
          <p className="mt-4 max-w-lg leading-7 text-[var(--muted)]">A personalized crossword puzzle, ready to print and gift in minutes.</p>
          <p className="mt-6 font-bold text-[var(--accent-strong)]">Launching after Click No. 001 earns its spot.</p>
          <div className="crossword-mini" aria-hidden="true">NICE<br />LITTLE<br />CLICK</div>
        </article>
      </section>

      <section className="border-t border-dashed border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-handwritten text-2xl text-[var(--accent-strong)]">No dashboards. No twelve-step onboarding. Just a nice little click.</p>
          <Link href="/clicks" className="font-bold">See what is on the shelf →</Link>
        </div>
      </section>
    </>
  );
}
