import Link from "next/link";
import type { Click } from "@/data/clicks";

type ClickCardProps = {
  click: Click;
  featured?: boolean;
};

export function ClickCard({ click, featured = false }: ClickCardProps) {
  const href = `/clicks/${click.slug}`;
  const isLive = click.status === "live";
  const liveButtonLabel =
    click.slug === "meeting-cost-ticker"
      ? "Open the ticker"
      : click.slug === "please-advise"
        ? "Play the game"
        : click.slug === "should-have-been-an-email"
          ? "Judge a meeting"
          : "Open this Click";

  return (
    <article
      className={[
        "lab-card group relative overflow-hidden",
        featured ? "p-7 sm:p-10" : "p-7",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent-soft)] opacity-65 blur-2xl transition duration-300 group-hover:scale-110"
      />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="click-number">
              CLICK NO. {String(click.number).padStart(3, "0")}
            </p>
            {click.badge ? (
              <span className="rounded-full border border-[#c96f59]/30 bg-[#fff0ea] px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[#9c4a39]">
                {click.badge}
              </span>
            ) : null}
          </div>

          <span className="rounded-full border border-[var(--border)] bg-white/65 px-3 py-1 text-xs font-semibold">
            {click.priceLabel}
          </span>
        </div>

        <div
          className={
            featured
              ? "mt-8 grid gap-8 md:grid-cols-[1fr_auto] md:items-end"
              : "mt-7"
          }
        >
          <div>
            <h2
              className={[
                "lab-heading",
                featured ? "text-5xl sm:text-6xl" : "text-4xl",
              ].join(" ")}
            >
              {click.name}
            </h2>

            <p
              className={[
                "mt-4 max-w-2xl leading-7 text-[var(--muted)]",
                featured ? "text-lg" : "",
              ].join(" ")}
            >
              {click.shortDescription}
            </p>
          </div>

          <div className={featured ? "md:text-right" : "mt-7"}>
            {isLive ? (
              <div>
                <Link href={href} className="lab-button lab-button-primary">
                  {liveButtonLabel}
                </Link>
                <p className="font-handwritten mt-3 rotate-1 text-lg text-[var(--accent-strong)]">
                  ready for clicking
                </p>
              </div>
            ) : (
              <div>
                <span className="lab-button lab-button-secondary cursor-default">
                  Still tinkering
                </span>
                <p className="font-handwritten mt-3 rotate-1 text-lg text-[var(--accent-strong)]">
                  almost ready for clicking
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
