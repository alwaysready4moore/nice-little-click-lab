import type { Metadata } from "next";
import { SeatingChartBuilder } from "@/components/clicks/seating/SeatingChartBuilder";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbStructuredData, organizationId } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const pagePath = "/clicks/take-your-seat";

export const metadata: Metadata = {
  title: "Take Your Seat | Custom Seating Chart Builder",
  description: "Arrange wedding tables or classroom desks, assign seats, and print your seating chart. Free, private, and no account required.",
  alternates: { canonical: pagePath },
  robots: { index: true, follow: true },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Take Your Seat",
      alternateName: "Custom Seating Chart Builder",
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript and a modern web browser",
      url: `${siteConfig.url}${pagePath}`,
      image: `${siteConfig.url}${siteConfig.socialImage}`,
      description:
        "A free browser tool for arranging wedding tables or classroom desks, assigning seats, and printing a seating chart.",
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
    },
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Clicks", path: "/clicks" },
      { name: "Take Your Seat", path: pagePath },
    ]),
  ],
};

export default function TakeYourSeatPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <SeatingChartBuilder />
    </>
  );
}
