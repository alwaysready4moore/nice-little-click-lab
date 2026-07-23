import type { Metadata } from "next";
import { PleaseAdviseGame } from "@/components/clicks/please-advise/PleaseAdviseGame";

export const metadata: Metadata = {
  title: "Please Advise | Nice Little Click Lab",
  description:
    "Read the email, choose Reply, Reply All, or Spam / Ignore, and protect your fictional career in this tiny workplace survival game.",
  alternates: { canonical: "/clicks/please-advise" },
  openGraph: {
    title: "Please Advise | Nice Little Click Lab",
    description:
      "A tiny workplace survival game about making the least disastrous inbox decision.",
    url: "/clicks/please-advise",
    type: "website",
  },
};

export default function PleaseAdvisePage() {
  return <PleaseAdviseGame />;
}
