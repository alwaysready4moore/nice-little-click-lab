import { clicks } from "@/data/clicks";
import { guideBySlug, guides, guidesIndex, type GuideSlug } from "@/data/guides";
import { siteConfig } from "@/lib/site";

export type ShareCard = {
  path: string;
  eyebrow: string;
  title: string;
  tagline: string;
  badge: string;
  footer: string;
  alt: string;
};

function apexHost() {
  return new URL(siteConfig.url).host;
}

function buildCard(input: {
  path: string;
  eyebrow: string;
  title: string;
  tagline: string;
  badge: string;
}): ShareCard {
  const footer = `${apexHost()}${input.path}`;
  const price =
    input.badge === "Free" || input.badge.startsWith("$") ? ` ${input.badge}.` : "";
  return {
    ...input,
    footer,
    alt: `${input.title}. ${input.tagline}${price}`,
  };
}

export function clickShareCard(slug: string): ShareCard {
  const click = clicks.find((item) => item.slug === slug);
  if (!click) {
    throw new Error(`Unknown Click slug: ${slug}`);
  }

  return buildCard({
    path: `/clicks/${click.slug}`,
    eyebrow: `Click ${String(click.number).padStart(3, "0")}`,
    title: click.name,
    tagline: click.shortDescription,
    badge: click.priceLabel,
  });
}

export function guideShareCard(slug: GuideSlug | "index"): ShareCard {
  if (slug === "index") {
    return buildCard({
      path: "/guides",
      eyebrow: "Guides",
      title: guidesIndex.title,
      tagline: guidesIndex.description,
      badge: `${guides.length} guides`,
    });
  }

  const guide = guideBySlug(slug);
  return buildCard({
    path: `/guides/${guide.slug}`,
    eyebrow: "Guide",
    title: guide.title,
    tagline: guide.summary,
    badge: "Guide",
  });
}

export function shareCardForPath(path: string): ShareCard | undefined {
  if (path === "/guides") return guideShareCard("index");
  if (path.startsWith("/guides/")) {
    return guideShareCard(path.slice("/guides/".length) as GuideSlug);
  }
  if (path.startsWith("/clicks/")) {
    const slug = path.slice("/clicks/".length);
    if (clicks.some((click) => click.slug === slug)) return clickShareCard(slug);
  }
  return undefined;
}
