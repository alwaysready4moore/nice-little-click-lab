import type { Metadata } from "next";
import { ShouldEmailTool } from "@/components/clicks/should-email/ShouldEmailTool";
import { FaqSection, type FaqItem } from "@/components/seo/FaqSection";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbStructuredData,
  faqStructuredData,
  organizationId,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const pagePath = "/clicks/should-have-been-an-email";

export const metadata: Metadata = {
  title: "Should This Have Been an Email? Free Meeting Test",
  description:
    "Answer seven quick questions and get a shareable verdict on whether a meeting should have been an email. Free, private, and no account required.",
  alternates: { canonical: pagePath },
  openGraph: {
    title: "Should This Have Been an Email?",
    description:
      "A free, seven-question meeting test with a downloadable calendar verdict.",
    url: pagePath,
    type: "website",
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Should This Have Been an Email?",
    description:
      "Let Click review the evidence and issue a free meeting verdict.",
    images: [siteConfig.socialImage],
  },
};

const faqs = [
  {
    question: "What does Should This Have Been an Email do?",
    answer:
      "It asks seven questions about a planned or completed meeting, then gives you a practical verdict ranging from keeping the meeting to handling the work asynchronously.",
  },
  {
    question: "Can I use it before a meeting starts?",
    answer:
      "Yes. Choose Before it starts to evaluate a proposed meeting, or After it ended for a post-meeting review.",
  },
  {
    question: "Does it save my answers?",
    answer:
      "No. Your answers stay in the current browser session and are not stored in an account, sent to an AI service, or saved by the Lab.",
  },
  {
    question: "Is the verdict professional or HR advice?",
    answer:
      "No. The Click is a playful meeting-design prompt. Use your workplace policies, accessibility needs, team norms, and professional judgment when deciding how people should communicate.",
  },
] as const satisfies readonly FaqItem[];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Should This Have Been an Email?",
      alternateName: "Should This Be an Email?",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript and a modern web browser",
      url: `${siteConfig.url}${pagePath}`,
      description:
        "A free seven-question browser tool that evaluates whether a meeting should be synchronous or handled in writing.",
      inLanguage: siteConfig.locale,
      isAccessibleForFree: true,
      publisher: { "@id": organizationId },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${siteConfig.url}${pagePath}`,
      },
    },
    breadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Clicks", path: "/clicks" },
      { name: "Should This Have Been an Email?", path: pagePath },
    ]),
    faqStructuredData(faqs),
  ],
};

export default function ShouldHaveBeenAnEmailPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <ShouldEmailTool />
      <FaqSection
        id="should-email-faq"
        eyebrow="Calendar notes"
        title="Questions before anyone sends an invite"
        intro="The meeting may be debatable. The rules of this tiny Click are not."
        items={faqs}
      />
    </>
  );
}
