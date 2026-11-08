import type { Metadata } from "next";
import type { FaqItem } from "@/components/seo/FaqSection";
import { siteConfig } from "@/lib/site";

export const organizationId = `${siteConfig.url}/#organization`;
export const websiteId = `${siteConfig.url}/#website`;

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
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
}: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type,
      images: [siteConfig.socialImage],
      ...(publishedTime
        ? { publishedTime, modifiedTime: publishedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.socialImage],
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
    image: absoluteUrl(siteConfig.socialImage),
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
    image: absoluteUrl(siteConfig.socialImage),
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
