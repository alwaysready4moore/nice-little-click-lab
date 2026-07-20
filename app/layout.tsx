import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: "Nice Little Click Lab | Tiny tools for oddly specific moments",
    template: "%s | Nice Little Click Lab",
  },
  description: siteConfig.description,
  keywords: [
    "tiny web tools",
    "useful web apps",
    "online tools",
    "meeting cost calculator",
    "meeting cost ticker",
    "personalized gifts",
    "custom crossword gift",
    "Nice Little Click Lab",
  ],
  authors: [
    {
      name: siteConfig.creator,
      url: siteConfig.portfolioUrl,
    },
  ],
  creator: siteConfig.creator,
  publisher: siteConfig.name,
  category: "technology",
  referrer: "origin-when-cross-origin",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteConfig.name,
    title: "Nice Little Click Lab",
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 630,
        alt: "Nice Little Click Lab logo with Click, the golden retriever lab assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nice Little Click Lab",
    description: siteConfig.description,
    images: [siteConfig.socialImage],
  },
};

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  alternateName: siteConfig.shortName,
  url: siteConfig.url,
  description: siteConfig.longDescription,
  publisher: {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/click/03-badge-circle-mark.png`,
    founder: {
      "@type": "Person",
      name: siteConfig.creator,
      url: siteConfig.portfolioUrl,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
