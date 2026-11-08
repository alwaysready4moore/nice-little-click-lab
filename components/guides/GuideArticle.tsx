import Link from "next/link";
import type { ReactNode } from "react";
import { formatGuideDate, guidePath, guides, type GuideEntry } from "@/data/guides";

const proseClassName = [
  "mt-10 text-[1.0625rem] leading-8 text-[var(--foreground)]",
  "[&_h2]:mt-12 [&_h2]:scroll-mt-28 [&_h2]:text-[clamp(1.7rem,3vw,2.2rem)] [&_h2]:font-black [&_h2]:leading-[1.15] [&_h2]:tracking-[-0.04em]",
  "[&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-black [&_h3]:tracking-[-0.03em]",
  "[&_p]:mt-4 [&_ul]:mt-4 [&_ol]:mt-4",
  "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
  "[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
  "[&_a:not(.lab-card)]:font-bold [&_a:not(.lab-card)]:text-[var(--accent-strong)] [&_a:not(.lab-card)]:underline [&_a:not(.lab-card)]:decoration-1 [&_a:not(.lab-card)]:underline-offset-4",
  "[&_.mention-grid]:mt-6 [&_.mention-grid]:grid [&_.mention-grid]:gap-4 sm:[&_.mention-grid]:grid-cols-2",
].join(" ");

export function GuideArticle({
  guide,
  aside,
  children,
}: {
  guide: GuideEntry;
  aside: string;
  children: ReactNode;
}) {
  const others = guides.filter((item) => item.slug !== guide.slug);

  return (
    <article className="mx-auto max-w-3xl px-6 pb-24 pt-14 sm:pt-20">
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--muted)]">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link href="/" className="underline decoration-1 underline-offset-4">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/guides" className="underline decoration-1 underline-offset-4">
              Guides
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{guide.title}</li>
        </ol>
      </nav>

      <p className="lab-label mt-8">A note from the Lab</p>
      <h1 className="lab-heading mt-3 text-[clamp(2.5rem,6vw,4.4rem)]">{guide.title}</h1>
      <p className="font-handwritten mt-4 text-2xl leading-tight text-[var(--accent-strong)] sm:text-3xl">
        {aside}
      </p>
      <p className="mt-5 text-sm text-[var(--muted)]">
        Updated <time dateTime={guide.updatedAt}>{formatGuideDate(guide.updatedAt)}</time>
        {" · "}
        Nice Little Click Lab, operated by Moore Family Print Shop LLC
      </p>

      <div className={proseClassName}>{children}</div>

      <aside className="mt-14" aria-labelledby="more-guides-heading">
        <h2
          id="more-guides-heading"
          className="text-2xl font-black tracking-[-0.04em]"
        >
          Other notes on the bench
        </h2>
        <ul className="mt-4 grid gap-4">
          {others.map((item) => (
            <li key={item.slug}>
              <Link href={guidePath(item.slug)} className="lab-card block p-5">
                <span className="text-lg font-black tracking-[-0.03em]">{item.title}</span>
                <span className="mt-2 block leading-7 text-[var(--muted)]">{item.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </article>
  );
}
