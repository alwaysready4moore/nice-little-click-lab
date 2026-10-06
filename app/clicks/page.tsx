import type { Metadata } from "next";
import { ClickCard } from "@/components/clicks/ClickCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { clicks } from "@/data/clicks";
import {
  absoluteUrl,
  breadcrumbStructuredData,
  organizationId,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Tools, Games, and Personalized Gifts",
  description:
    "Browse the small, focused web tools, games, and personalized gifts made by Nice Little Click Lab.",
  alternates: { canonical: "/clicks" },
  openGraph: {
    title: "Free Tools, Games, and Personalized Gifts",
    description:
      "Browse every live Click: focused browser tools, tiny games, and personalized downloads.",
    url: "/clicks",
    type: "website",
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Tools, Games, and Personalized Gifts",
    description:
      "Small, useful web products for oddly specific moments.",
    images: [siteConfig.socialImage],
  },
};

function clickStructuredItem(click: (typeof clicks)[number]) {
  const url = absoluteUrl(`/clicks/${click.slug}`);

  if (click.purchaseMode === "free") {
    return {
      "@type": "SoftwareApplication",
      name: click.name,
      description: click.shortDescription,
      url,
      applicationCategory:
        click.slug === "please-advise"
          ? "GameApplication"
          : click.slug === "halloween-candy-calculator"
            ? "LifestyleApplication"
            : "BusinessApplication",
      operatingSystem: "Web",
      isAccessibleForFree: true,
      publisher: { "@id": organizationId },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url,
        seller: { "@id": organizationId },
      },
    };
  }

  return {
    "@type": "Product",
    name: click.name,
    description: click.shortDescription,
    url,
    sku: `CLICK-${String(click.number).padStart(3, "0")}`,
    category: "Personalized digital gift",
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    manufacturer: { "@id": organizationId },
    offers: {
      "@type": "Offer",
      price: click.priceLabel.replace("$", ""),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url,
      seller: { "@id": organizationId },
    },
  };
}

const clickListStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ItemList",
      name: "Nice Little Click Lab products",
      description:
        "The current catalog of small web tools, games, and personalized digital gifts from Nice Little Click Lab.",
      numberOfItems: clicks.length,
      itemListElement: clicks.map((click, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: clickStructuredItem(click),
      })),
    },
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Clicks", path: "/clicks" },
    ]),
  ],
};

export default function ClicksPage() {
  return (
    <>
      <JsonLd data={clickListStructuredData} />
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="lab-label">From the Lab</p>

        <h1 className="lab-heading mt-3 text-7xl sm:text-8xl">All the Clicks.</h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
          Browse free browser tools, tiny games, and personalized digital gifts.
          Every Click has one clear job, works without unnecessary setup, and
          comes with at least one detail that made Click wag his tail.
        </p>

        <p className="font-handwritten mt-4 text-xl text-[var(--accent-strong)]">
          The shelf is small on purpose. Good things are being made.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {clicks.map((click) => (
            <ClickCard key={click.slug} click={click} />
          ))}
        </div>
      </section>
    </>
  );
}
