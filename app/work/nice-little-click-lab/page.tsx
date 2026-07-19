import type { Metadata } from "next";
import Link from "next/link";
import {
  BrandBadge,
  CyanSpark,
  MarginArrow,
  NotebookHighlight,
  NotebookPaperclip,
  type BrandBadgeTone,
} from "@/components/brand";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Nice Little Click Lab Case Study | Marquetta Moore",
  description:
    "A product strategy and creative technology case study for Nice Little Click Lab, a tiny web-product studio built around shareable free tools and low-cost personalized products.",
};

const liveSiteUrl = "https://www.nicelittleclick.com";
const tickerUrl =
  "https://www.nicelittleclick.com/clicks/meeting-cost-ticker";
const githubUrl =
  "https://github.com/alwaysready4moore/nice-little-click-lab";

const snapshot = [
  {
    label: "My role",
    value:
      "Founder, product strategist, UX writer, creative director, designer, and builder",
  },
  { label: "Stack", value: "Next.js, React, TypeScript, Tailwind CSS" },
  { label: "Deployment", value: "GitHub + Netlify" },
  { label: "Status", value: "Live beta" },
];

const opportunityCards = [
  {
    label: "Solo-studio constraint",
    title: "Small enough to ship and maintain.",
    body:
      "The studio needed products a single builder could launch, support, and improve without accidentally creating a miniature enterprise platform.",
    tone: "signal" as const,
  },
  {
    label: "Product-quality bar",
    title: "Tiny could not mean disposable.",
    body:
      "Each Click needed to explain itself immediately, work without onboarding, feel polished on mobile, and include one memorable detail without burying the utility.",
    tone: "verified" as const,
  },
  {
    label: "Business question",
    title: "What should people share, and what will they buy?",
    body:
      "The catalog was designed to test two different behaviors: free products for discovery and paid products where personalization, urgency, or gift value creates a credible purchase reason.",
    tone: "experiment" as const,
  },
];

const modelCards = [
  {
    label: "Free Clicks",
    title: "Designed for discovery.",
    body:
      "Free products optimize for immediate use, screenshots, organic sharing, repeat visits, and brand memory rather than forcing a thirty-second curiosity through a paywall.",
    tone: "signal" as const,
  },
  {
    label: "Paid Clicks",
    title: "Designed around stronger value moments.",
    body:
      "Paid products are reserved for personalization, urgency, emotional value, or polished downloadable output where the purchaser directly benefits from the convenience.",
    tone: "verified" as const,
  },
];

const productQuestions = [
  "Who experiences the problem?",
  "Who would realistically pay?",
  "Who would realistically share it?",
  "What free or AI substitute already exists?",
  "How much work will it take to build and maintain?",
  "Should the value be free, paid, or an upsell?",
];

const screenshots = [
  {
    title: "Studio homepage",
    description:
      "The Lab launched around a real, usable product instead of presenting an empty brand shell or oversized roadmap.",
    image: "/nice-little-click-lab/01-studio-homepage.png",
    alt: "Nice Little Click Lab homepage showing the studio identity and Meeting Cost Ticker",
  },
  {
    title: "Functional MVP",
    description:
      "The first version prioritized accurate meeting state, attendee groups, editable salary assumptions, elapsed time, and live cost calculation.",
    image: "/nice-little-click-lab/02-functional-mvp.png",
    alt: "Functional Meeting Cost Ticker MVP before the full visual delight pass",
  },
  {
    title: "Delight pass",
    description:
      "Once the cost engine worked, the product gained a simple meeting-room scene, faceless attendees, restrained workplace humor, and Click sleeping in the corner.",
    image: "/nice-little-click-lab/03-delight-pass.png",
    alt: "Meeting Cost Ticker delight pass with a simple meeting room and mascot",
  },
  {
    title: "Live meeting",
    description:
      "Users can change attendee groups while a meeting is running. Past cost remains intact while the updated team rate applies from that moment forward.",
    image: "/nice-little-click-lab/04-live-meeting.png",
    alt: "Active Meeting Cost Ticker with live elapsed time and meeting cost",
  },
];

const mobileScreenshots = [
  {
    title: "Attendee setup",
    image: "/nice-little-click-lab/05-mobile-attendee-setup.png",
    alt: "Mobile Meeting Cost Ticker attendee setup",
  },
  {
    title: "Live ticker",
    image: "/nice-little-click-lab/06-mobile-live-ticker.png",
    alt: "Mobile live Meeting Cost Ticker",
  },
  {
    title: "Meeting summary",
    image: "/nice-little-click-lab/07-mobile-summary.png",
    alt: "Mobile Meeting Cost Ticker completed meeting summary",
  },
];

const decisions = [
  {
    label: "Local salary defaults",
    title: "Useful convenience without another dependency.",
    body:
      "Instead of calling a live salary API, the tool uses an editable local dataset of common U.S. job titles. The defaults are instant, transparent, and available without adding latency, cost, rate limits, or another privacy dependency.",
    tone: "verified" as const,
  },
  {
    label: "Dynamic attendance",
    title: "The cost model reflects how meetings actually behave.",
    body:
      "People join late and leave early. The app preserves cost already accrued at the old team rate, then applies the new rate going forward rather than rewriting the past.",
    tone: "signal" as const,
  },
  {
    label: "Client-side architecture",
    title: "No account, database, or stored salary data.",
    body:
      "Meeting names, salaries, attendee counts, and totals remain in the browser. Users can open the tool, use it immediately, download the result, and leave without onboarding.",
    tone: "verified" as const,
  },
  {
    label: "Eight-hour boundary",
    title: "A forgotten tab should not run forever.",
    body:
      "The meeting automatically ends after eight hours, creating a sensible operational boundary without requiring saved sessions or account infrastructure.",
    tone: "warning" as const,
  },
];

const writingCards = [
  {
    label: "Utility first",
    title: "The joke never has to explain the product.",
    body:
      "Meeting Cost Ticker tells users exactly what it does, then adds the personality line “Every second counts. Literally.” The supporting instruction removes any ambiguity.",
    tone: "signal" as const,
  },
  {
    label: "Trust microcopy",
    title: "Predictable objections are answered early.",
    body:
      "Editable-salary language, clear privacy copy, and the eight-hour boundary make the product feel safer and more credible without interrupting the flow.",
    tone: "verified" as const,
  },
  {
    label: "Soft conversion",
    title: "The free tool converts through memory, not a gate.",
    body:
      "The Lab identity, recognizable mascot, shareable screenshots, and branded receipt introduce the wider studio without requiring an email address or forced signup.",
    tone: "experiment" as const,
  },
];

const technicalDetails = [
  { label: "Rendering", value: "Next.js + React" },
  { label: "Language", value: "TypeScript" },
  { label: "Styling", value: "Tailwind CSS" },
  { label: "Calculation model", value: "Client-side only" },
  { label: "Data storage", value: "None" },
  { label: "Salary source", value: "Editable local defaults" },
  { label: "Receipt", value: "Browser-generated PNG" },
  { label: "Hosting", value: "Netlify" },
];

const excludedScope = [
  "User accounts",
  "Saved meeting history",
  "Team dashboards",
  "Organization-level reporting",
  "Live payroll integrations",
  "Real-time salary APIs",
  "Persistent share links",
  "Subscription billing",
];

const validationQuestions = [
  "Do visitors start a meeting or leave after reading the concept?",
  "Do people add realistic attendee groups or only test the novelty?",
  "Do users download the receipt?",
  "Do screenshots or links get shared organically?",
  "Does the free product lead visitors to explore the studio or return later?",
  "Which UX details create confusion on real devices?",
];

function SectionTitle({
  kicker,
  title,
  description,
  tone = "quiet",
}: {
  kicker: string;
  title: string;
  description?: string;
  tone?: BrandBadgeTone;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <BrandBadge tone={tone} icon="spark">
          {kicker}
        </BrandBadge>
        <h2 className="mt-3 max-w-4xl font-display text-4xl font-bold leading-none tracking-[-0.05em] text-ink md:text-5xl">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="max-w-xl leading-7 text-muted md:text-right">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-[var(--border)] bg-white/[0.035] p-5">
      <BrandBadge tone="quiet" icon="none">
        {label}
      </BrandBadge>
      <p className="mt-3 font-display text-xl font-bold leading-tight tracking-[-0.03em] text-ink">
        {value}
      </p>
    </article>
  );
}

function TextCard({
  label,
  title,
  body,
  tone,
}: {
  label: string;
  title: string;
  body: string;
  tone: BrandBadgeTone;
}) {
  return (
    <article className="paper-card relative overflow-hidden p-6">
      <NotebookHighlight
        size="lg"
        className="absolute -right-3 -top-3 rotate-[-8deg] opacity-20"
      />
      <BrandBadge tone={tone} icon="dot">
        {label}
      </BrandBadge>
      <h3 className="mt-4 font-display text-3xl font-bold leading-none tracking-[-0.045em] text-ink">
        {title}
      </h3>
      <p className="mt-4 leading-7 text-muted">{body}</p>
    </article>
  );
}

function ScreenshotCard({
  title,
  description,
  image,
  alt,
}: {
  title: string;
  description: string;
  image: string;
  alt: string;
}) {
  return (
    <article className="paper-card overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-cyan/40">
      <div className="border-b border-[var(--border)] bg-white/[0.035] p-3">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[#f6efe2]">
          <img
            src={image}
            alt={alt}
            className="aspect-[16/10] w-full object-cover object-top"
          />
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <BrandBadge tone="experiment" icon="dot">
            {title}
          </BrandBadge>
          <CyanSpark size="xs" className="opacity-65" />
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
      </div>
    </article>
  );
}

export default function NiceLittleClickLabCaseStudyPage() {
  return (
    <main className="pb-16">
      <SiteHeader />

      <section className="lab-shell pt-10">
        <Link
          href="/work"
          className="lab-label inline-flex items-center gap-2 text-cyan transition hover:translate-x-1"
        >
          ← Back to work
        </Link>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_0.65fr] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <BrandBadge tone="experiment" icon="spark">
                Product studio case study
              </BrandBadge>
              <BrandBadge tone="quiet" icon="dot">
                Live beta
              </BrandBadge>
            </div>

            <div className="mt-8 overflow-hidden rounded-[2rem] border border-[#e3b96f]/25 bg-[#f7efe1] p-5 shadow-[0_0_40px_rgba(227,185,111,0.08)]">
              <img
                src="/nice-little-click-lab/wordmark-logo.png"
                alt="Nice Little Click Lab"
                className="mx-auto w-full max-w-3xl object-contain"
              />
            </div>

            <p className="mt-8 max-w-3xl text-xl leading-9 text-muted">
              A tiny web-product studio built around free shareable tools and
              low-cost personalized products for oddly specific moments.
            </p>

            <p className="mt-5 max-w-3xl leading-8 text-muted">
              I created the brand, product strategy, launch sequence, visual
              system, UX copy, and first working Click: Meeting Cost Ticker. The
              larger challenge was defining a repeatable solo-studio model for
              deciding what should be free, what should be paid, and how a very
              small product can still feel complete.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {[
                "Product Strategy",
                "UX Writing",
                "Creative Direction",
                "Next.js",
                "TypeScript",
                "Responsive UI",
              ].map((tag) => (
                <BrandBadge key={tag} tone="quiet" icon="none">
                  {tag}
                </BrandBadge>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={liveSiteUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-ring rounded-2xl border border-cyan/40 bg-cyan px-6 py-4 font-lab text-sm font-semibold uppercase tracking-[0.08em] text-night shadow-[0_0_32px_rgba(39,217,255,0.22)] transition hover:-translate-y-0.5"
              >
                Visit the Lab
              </a>
              <a
                href={tickerUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-ring rounded-2xl border border-[var(--border)] bg-white/5 px-6 py-4 font-lab text-sm font-semibold uppercase tracking-[0.08em] text-ink transition hover:-translate-y-0.5 hover:border-cyan/40"
              >
                Try Meeting Cost Ticker
              </a>
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-ring rounded-2xl border border-[var(--border)] bg-white/5 px-6 py-4 font-lab text-sm font-semibold uppercase tracking-[0.08em] text-ink transition hover:-translate-y-0.5 hover:border-cyan/40"
              >
                Inspect the code
              </a>
            </div>
          </div>

          <aside className="paper-card relative overflow-hidden p-6">
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#e3b96f]/10 blur-3xl"
            />
            <div className="relative">
              <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-[#e3b96f]/25 bg-[#f7efe1] p-1">
                <img
                  src="/nice-little-click-lab/logo.png"
                  alt="Nice Little Click Lab circular logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <BrandBadge tone="experiment" icon="spark">
                Project snapshot
              </BrandBadge>

              <div className="mt-5 grid gap-4">
                {snapshot.map((item) => (
                  <DetailCard
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>

              <div className="mt-5 rounded-3xl border border-[#e3b96f]/20 bg-[#e3b96f]/[0.045] p-5">
                <p className="lab-label text-[#e3c58f]">Studio rule</p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Finish the smallest useful version of the current product
                  before building a collection.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="lab-shell pt-16">
        <div className="paper-card relative grid gap-8 overflow-hidden p-6 md:p-8 lg:grid-cols-[0.7fr_1fr]">
          <MarginArrow
            size="lg"
            className="absolute right-7 top-7 rotate-6 opacity-25"
          />
          <div>
            <BrandBadge tone="experiment" icon="spark">
              The short version
            </BrandBadge>
            <h2 className="mt-4 font-display text-4xl font-bold leading-none tracking-[-0.05em] text-ink md:text-5xl">
              The portfolio itself is freemium.
            </h2>
          </div>
          <div className="grid gap-5 text-muted">
            <p className="leading-8">
              Free Clicks are built for reach, screenshots, organic sharing, and
              repeat visits. Paid Clicks are reserved for moments where
              personalization, urgency, gift value, or polished downloadable
              output creates a credible reason to pay.
            </p>
            <p className="leading-8">
              Meeting Cost Ticker tests what people will use and share. The next
              product, Instant Custom Crossword Gift, is designed to test what
              people will purchase.
            </p>
          </div>
        </div>
      </section>

      <section className="lab-shell pt-20">
        <SectionTitle
          kicker="Opportunity"
          title="Build tiny products without building tiny, bloated SaaS."
          description="The goal was a repeatable studio model, not a collection of unrelated novelty tools."
          tone="signal"
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {opportunityCards.map((card) => (
            <TextCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="lab-shell pt-20">
        <SectionTitle
          kicker="Business model"
          title="Free for discovery. Paid when the value supports it."
          description="The user, buyer, and sharer are not always the same person. Pricing follows that reality."
          tone="verified"
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {modelCards.map((card) => (
            <TextCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="lab-shell pt-20">
        <div className="paper-card relative grid gap-8 overflow-hidden p-6 md:p-8 lg:grid-cols-[0.7fr_1fr]">
          <NotebookHighlight
            size="lg"
            className="absolute right-7 top-7 rotate-[-8deg] opacity-20"
          />
          <div>
            <BrandBadge tone="signal" icon="spark">
              Product filter
            </BrandBadge>
            <h2 className="mt-4 font-display text-4xl font-bold leading-none tracking-[-0.05em] text-ink md:text-5xl">
              Six questions before a Click earns a build slot.
            </h2>
          </div>
          <ul className="grid gap-3">
            {productQuestions.map((question) => (
              <li
                key={question}
                className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-[var(--border)] bg-white/[0.035] p-4 text-muted"
              >
                <span aria-hidden="true" className="font-lab text-cyan">
                  ✓
                </span>
                <span className="leading-6">{question}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="screenshots" className="lab-shell pt-20">
        <SectionTitle
          kicker="First Click"
          title="Meeting Cost Ticker, from useful engine to memorable product."
          description="The calculator worked before the mascot entered the room."
          tone="experiment"
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {screenshots.map((screenshot) => (
            <ScreenshotCard key={screenshot.title} {...screenshot} />
          ))}
        </div>
      </section>

      <section className="lab-shell pt-20">
        <SectionTitle
          kicker="Strategic UX decisions"
          title="Small architectural choices made the product more believable."
          tone="verified"
        />
        <div className="grid gap-5 md:grid-cols-2">
          {decisions.map((decision) => (
            <TextCard key={decision.title} {...decision} />
          ))}
        </div>
      </section>

      <section className="lab-shell pt-20">
        <SectionTitle
          kicker="UX writing"
          title="Clear utility first. Personality where it earns its keep."
          description="The copy establishes trust, removes hesitation, and introduces the studio without interrupting a lightweight tool with a signup gate."
          tone="signal"
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {writingCards.map((card) => (
            <TextCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="lab-shell pt-20">
        <SectionTitle
          kicker="Mobile"
          title="A deliberate sequence, not a desktop page squeezed smaller."
          description="Setup, live cost, and completion become a tap-friendly vertical flow on narrow screens."
          tone="experiment"
        />
        <div className="grid gap-5 md:grid-cols-3">
          {mobileScreenshots.map((item) => (
            <article
              key={item.title}
              className="paper-card overflow-hidden p-3 transition duration-300 hover:-translate-y-1 hover:border-cyan/40"
            >
              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[#f6efe2]">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="mx-auto aspect-[9/16] w-full object-cover object-top"
                />
              </div>
              <p className="px-2 pb-2 pt-4 text-center font-lab text-sm font-semibold uppercase tracking-[0.08em] text-cyan">
                {item.title}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="lab-shell pt-20">
        <div className="paper-card grid gap-8 overflow-hidden p-6 md:p-8 lg:grid-cols-[0.85fr_1fr] lg:items-center">
          <div>
            <BrandBadge tone="experiment" icon="spark">
              Downloadable artifact
            </BrandBadge>
            <h2 className="mt-4 font-display text-4xl font-bold leading-none tracking-[-0.05em] text-ink md:text-5xl">
              The receipt gives the meeting a satisfying ending.
            </h2>
            <p className="mt-5 leading-8 text-muted">
              The browser-generated PNG makes the result portable, gives users
              something easy to save or share, and carries the Lab identity
              beyond the site. It is functional and legible, with another visual
              refinement pass intentionally parked for post-launch.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[#f6efe2] p-3">
            <img
              src="/nice-little-click-lab/08-beta-receipt.png"
              alt="Downloadable Meeting Cost Ticker beta receipt"
              className="w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      </section>

      <section className="lab-shell pt-20">
        <div className="paper-card overflow-hidden">
          <div className="border-b border-[var(--border)] bg-white/[0.035] p-6 md:p-8">
            <BrandBadge tone="verified" icon="spark">
              Technical snapshot
            </BrandBadge>
            <h2 className="mt-4 font-display text-4xl font-bold leading-none tracking-[-0.05em] text-ink md:text-5xl">
              Intentionally boring architecture, intentionally distinctive experience.
            </h2>
          </div>
          <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8 lg:grid-cols-4">
            {technicalDetails.map((item) => (
              <DetailCard key={item.label} {...item} />
            ))}
          </div>
        </div>
      </section>

      <section className="lab-shell pt-20">
        <SectionTitle
          kicker="Intentional scope"
          title="The first release proves the behavior, not the size of the roadmap."
          description="None of these features were necessary to learn whether people would use and share the core product."
          tone="warning"
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {excludedScope.map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-[var(--border)] bg-white/[0.035] p-5"
            >
              <BrandBadge tone="quiet" icon="dot">
                Deferred
              </BrandBadge>
              <p className="mt-4 font-display text-xl font-bold tracking-[-0.03em] text-ink">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="lab-shell pt-20">
        <div className="paper-card relative grid gap-8 overflow-hidden p-6 md:p-8 lg:grid-cols-[0.75fr_1fr]">
          <NotebookPaperclip
            size="lg"
            className="absolute right-7 top-7 rotate-12 opacity-20"
          />
          <div>
            <BrandBadge tone="signal" icon="spark">
              Launch-stage validation
            </BrandBadge>
            <h2 className="mt-4 font-display text-4xl font-bold leading-none tracking-[-0.05em] text-ink md:text-5xl">
              The next step is observation, not automatic expansion.
            </h2>
            <p className="mt-5 leading-7 text-muted">
              No performance or conversion claims are included yet. The current
              release is real, usable, inexpensive to maintain, and capable of
              teaching the next product decision.
            </p>
          </div>
          <ul className="grid gap-3">
            {validationQuestions.map((question) => (
              <li
                key={question}
                className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-[var(--border)] bg-white/[0.035] p-4 text-muted"
              >
                <span aria-hidden="true" className="font-lab text-cyan">
                  ?
                </span>
                <span className="leading-6">{question}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="lab-shell pt-20">
        <div className="paper-note relative overflow-hidden p-7 md:p-9">
          <MarginArrow
            size="lg"
            className="absolute right-7 top-7 rotate-6 opacity-25"
          />
          <p className="field-heading max-w-5xl text-3xl leading-tight text-[var(--paper-ink)] md:text-4xl">
            Nice Little Click Lab shows how I turn a charming idea into a
            product model: define the audience, price the value honestly, reduce
            the architecture, design the experience, ship the useful version,
            and let real behavior decide what comes next.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <a
              href={liveSiteUrl}
              target="_blank"
              rel="noreferrer"
              className="focus-ring rounded-2xl border border-[#19D8E8] bg-[#19D8E8] px-5 py-4 font-lab text-sm font-semibold uppercase tracking-[0.08em] text-[#071014] shadow-[0_0_24px_rgba(25,216,232,0.24)] transition hover:-translate-y-0.5"
            >
              Visit the Lab
            </a>
            <a
              href={tickerUrl}
              target="_blank"
              rel="noreferrer"
              className="focus-ring rounded-2xl border border-[var(--paper-line)] bg-white/40 px-5 py-4 font-lab text-sm font-semibold uppercase tracking-[0.08em] text-[var(--paper-ink)] transition hover:-translate-y-0.5"
            >
              Try the first Click
            </a>
            <Link
              href="/work"
              className="focus-ring rounded-2xl border border-[var(--paper-line)] bg-white/40 px-5 py-4 font-lab text-sm font-semibold uppercase tracking-[0.08em] text-[var(--paper-ink)] transition hover:-translate-y-0.5"
            >
              View all work
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
