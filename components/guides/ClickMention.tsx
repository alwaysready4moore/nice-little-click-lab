import Link from "next/link";
import type { Click } from "@/data/clicks";

export function ClickMention({ click }: { click: Click }) {
  return (
    <Link href={`/clicks/${click.slug}`} className="lab-card block p-5">
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
        Click {String(click.number).padStart(3, "0")} · {click.priceLabel}
      </p>
      <p className="mt-2 text-xl font-black tracking-[-0.03em]">{click.name}</p>
      <p className="mt-2 leading-7 text-[var(--muted)]">{click.shortDescription}</p>
    </Link>
  );
}
