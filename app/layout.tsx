import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nicelittleclick.com"),
  title: {
    default: "Nice Little Click Lab",
    template: "%s | Nice Little Click Lab",
  },
  description: "Tiny tools, games, and gifts for oddly specific moments.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Nice Little Click Lab",
    title: "Nice Little Click Lab",
    description: "Tiny tools, games, and gifts for oddly specific moments.",
  },
  twitter: {
    card: "summary",
    title: "Nice Little Click Lab",
    description: "Tiny tools, games, and gifts for oddly specific moments.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
