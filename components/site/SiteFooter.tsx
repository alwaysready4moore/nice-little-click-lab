import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer border-t border-black/5 bg-[var(--surface)]">
      <div className="site-footer-inner mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Link href="/" className="site-footer-brand flex items-baseline gap-2">
            <span className="font-display text-3xl">nice little click</span>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              lab
            </span>
          </Link>

          <p className="font-handwritten mt-2 text-lg text-[var(--accent-strong)]">
            Run by Click. Supervised loosely.
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="site-footer-nav flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-[var(--muted)]"
        >
          <Link href="/clicks">Clicks</Link>
          <Link href="/about">About</Link>
          <Link href="/about#meet-click">Meet Click</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
