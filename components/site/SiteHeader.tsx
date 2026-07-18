import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[rgba(247,241,231,0.9)] backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          className="flex items-baseline gap-2"
          aria-label="Nice Little Click Lab home"
        >
          <span className="font-display text-[1.9rem] leading-none">
            nice little click
          </span>
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            lab
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-5 text-sm font-semibold"
        >
          <Link
            href="/clicks"
            className="transition hover:text-[var(--accent-strong)]"
          >
            Clicks
          </Link>

          <Link
            href="/about"
            className="transition hover:text-[var(--accent-strong)]"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}
