import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const contactEmail = "hello@nicelittleclick.com";

export const metadata: Metadata = {
  title: "Contact the Lab",
  description:
    "Questions, feedback, bug reports, and tiny emergencies for Nice Little Click Lab.",
  alternates: { canonical: "/contact" },
};

const reasons = [
  {
    title: "Something went sideways",
    description:
      "Found a bug, received a wonky download, or watched a button behave suspiciously? Tell us what happened and which Click you were using.",
    subject: "A tiny bug report",
  },
  {
    title: "A purchase needs help",
    description:
      "Include the email used at checkout and a quick description of the problem. Please do not send card numbers or other payment details.",
    subject: "Help with my purchase",
  },
  {
    title: "You have a good little idea",
    description:
      "Suggestions, oddly specific problems, and charming internet contraptions are always welcome at the workbench.",
    subject: "A good little idea",
  },
] as const;

function emailHref(subject: string) {
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`;
}

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <p className="lab-label">The lab hatch</p>
          <h1 className="lab-heading mt-4 text-[clamp(3.8rem,9vw,7rem)]">
            Send a note to the workbench.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Questions, feedback, bug reports, and tiny emergencies are all
            welcome. Click may inspect the message first, but a human will
            answer it.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              className="lab-button lab-button-primary"
              href={emailHref("Hello from the internet")}
            >
              Email the Lab
            </a>
            <Link className="lab-button lab-button-secondary" href="/clicks">
              Browse the Clicks
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative mx-auto aspect-square w-full max-w-sm" aria-hidden="true">
            <Image
              src="/images/click/click-writing.png"
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 32vw, 80vw"
              className="object-contain"
            />
          </div>

          <aside className="lab-card p-6 sm:p-8" aria-label="Contact details">
            <p className="lab-label">Direct line</p>
            <a
              className="mt-4 block break-words text-xl font-bold text-[var(--foreground)] underline decoration-[var(--accent)] decoration-2 underline-offset-4 transition hover:text-[var(--accent-strong)]"
              href={`mailto:${contactEmail}`}
            >
              {contactEmail}
            </a>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              Nice Little Click Lab is a tiny web-product studio operated by
              Moore Family Print Shop LLC.
            </p>
            <p className="font-handwritten mt-6 text-lg text-[var(--accent-strong)]">
              No support maze. No ticket-number scavenger hunt.
            </p>
          </aside>
        </div>
      </section>

      <section className="mt-16 border-t border-black/5 pt-12">
        <p className="lab-label">What should I include?</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          A little context helps us help faster.
        </h2>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {reasons.map((reason) => (
            <article className="lab-panel flex h-full flex-col p-6" key={reason.title}>
              <h3 className="text-xl font-bold">{reason.title}</h3>
              <p className="mt-3 flex-1 leading-7 text-[var(--muted)]">
                {reason.description}
              </p>
              <a
                className="mt-6 font-bold text-[var(--accent-strong)] underline decoration-2 underline-offset-4"
                href={emailHref(reason.subject)}
              >
                Start this email
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
