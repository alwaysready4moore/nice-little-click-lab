import type { Metadata } from "next";
import { PleaseAdviseGame } from "@/components/clicks/please-advise/PleaseAdviseGame";
import { FaqSection, type FaqItem } from "@/components/seo/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbStructuredData,
  faqStructuredData,
  organizationId,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const pagePath = "/clicks/please-advise";

export const metadata: Metadata = {
  title: "Please Advise: Free Workplace Email Game",
  description:
    "Play a free workplace email game. Read each fictional message, choose Reply, Reply All, or Spam / Ignore, and try to survive the inbox.",
  alternates: { canonical: pagePath },
  openGraph: {
    title: "Please Advise: Free Workplace Email Game",
    description:
      "A tiny inbox survival game about choosing the least disastrous email response.",
    url: pagePath,
    type: "website",
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Please Advise: Free Workplace Email Game",
    description:
      "Choose Reply, Reply All, or Spam / Ignore before the timer runs out.",
    images: [siteConfig.socialImage],
  },
};

const pleaseAdviseFaqs = [
  {
    question: "What is Please Advise?",
    answer:
      "Please Advise is a free browser game about workplace email judgment. Each fictional message asks you to choose Reply, Reply All, or Spam / Ignore before the timer runs out.",
  },
  {
    question: "How long is a game?",
    answer:
      "Choose a 10-email or 20-email session. The game can also end early after three mistakes, when your fictional career receives some extremely immediate feedback.",
  },
  {
    question: "Does Please Advise require an account?",
    answer:
      "No. The game is free and starts in the browser without registration. A personal best and sound preference may be stored on your device.",
  },
  {
    question: "Is the game real workplace or HR advice?",
    answer:
      "No. The emails, companies, coworkers, and outcomes are fictional. The game is entertainment and should not replace your employer's policies, professional guidance, or legal advice.",
  },
] as const satisfies readonly FaqItem[];

const gameStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["SoftwareApplication", "VideoGame"],
      name: "Please Advise",
      alternateName: "Please Advise Workplace Email Game",
      applicationCategory: "GameApplication",
      gamePlatform: "Web browser",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript and a modern web browser",
      url: `${siteConfig.url}${pagePath}`,
      image: `${siteConfig.url}${siteConfig.socialImage}`,
      description:
        "A free fictional workplace email game in which players choose Reply, Reply All, or Spam / Ignore.",
      inLanguage: siteConfig.locale,
      isAccessibleForFree: true,
      publisher: { "@id": organizationId },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${siteConfig.url}${pagePath}`,
        seller: { "@id": organizationId },
      },
      numberOfPlayers: 1,
      playMode: "SinglePlayer",
    },
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Clicks", path: "/clicks" },
      { name: "Please Advise", path: pagePath },
    ]),
    faqStructuredData(pleaseAdviseFaqs),
  ],
};

export default function PleaseAdvisePage() {
  return (
    <>
      <JsonLd data={gameStructuredData} />
      <PleaseAdviseGame />
      <FaqSection
        id="please-advise-faq"
        eyebrow="Inbox orientation"
        title="Questions about Please Advise"
        intro="A quick briefing before you make a fictional email decision with wildly disproportionate consequences."
        items={pleaseAdviseFaqs}
      />
    </>
  );
}
