import type { Metadata } from "next";
import type { FaqItem } from "@/components/seo/FaqSection";
import { shareCardForPath } from "@/lib/share-card";
import { siteConfig } from "@/lib/site";

export const organizationId = `${siteConfig.url}/#organization`;
export const websiteId = `${siteConfig.url}/#website`;

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}

export function shareImageUrl(path: string) {
  if (!path.startsWith("/")) {
    throw new Error(`Share image path must start with /: ${path}`);
  }
  const route = `${path.replace(/\/$/, "")}/opengraph-image`;
  const url = absoluteUrl(route);
  const parsed = new URL(url);
  const site = new URL(siteConfig.url);
  if (parsed.origin !== site.origin || parsed.host.startsWith("www.")) {
    throw new Error(`Share image URL must use the apex origin ${site.origin}, got ${url}`);
  }
  return url;
}

export function shareImages(path: string, alt: string) {
  const url = shareImageUrl(path);
  const image = { url, width: 1200, height: 630, alt };
  return {
    url,
    openGraphImages: [image],
    twitterImages: [image],
  };
}

export function shareImagesForCard(card: { path: string; alt: string }, pagePath = card.path) {
  if (pagePath !== card.path) {
    throw new Error(`Share image path ${card.path} does not match ${pagePath}`);
  }
  return shareImages(pagePath, card.alt);
}

export function breadcrumbStructuredData(
  items: ReadonlyArray<{ name: string; path: string }>,
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function socialMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  imageAlt,
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  imageAlt?: string;
}): Metadata {
  const share = shareImages(path, imageAlt ?? shareCardForPath(path)?.alt ?? title);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type,
      images: share.openGraphImages,
      ...(publishedTime
        ? { publishedTime, modifiedTime: publishedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: share.twitterImages,
    },
  };
}

export function articleStructuredData(article: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
}) {
  const url = absoluteUrl(article.path);

  return {
    "@type": "Article",
    headline: article.headline,
    description: article.description,
    url,
    mainEntityOfPage: url,
    image: shareImageUrl(article.path),
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    inLanguage: siteConfig.locale,
    author: { "@id": organizationId },
    publisher: {
      "@id": organizationId,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    isPartOf: { "@id": websiteId },
  };
}

export function howToStructuredData(howTo: {
  name: string;
  description: string;
  path: string;
  steps: ReadonlyArray<{ id: string; name: string; text: string }>;
  tools?: ReadonlyArray<{ name: string; path: string }>;
}) {
  return {
    "@type": "HowTo",
    name: howTo.name,
    description: howTo.description,
    url: absoluteUrl(howTo.path),
    image: shareImageUrl(howTo.path),
    inLanguage: siteConfig.locale,
    step: howTo.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${absoluteUrl(howTo.path)}#${step.id}`,
    })),
    ...(howTo.tools
      ? {
          tool: howTo.tools.map((tool) => ({
            "@type": "HowToTool",
            name: tool.name,
            url: absoluteUrl(tool.path),
          })),
        }
      : {}),
  };
}

export function faqStructuredData(items: readonly FaqItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
