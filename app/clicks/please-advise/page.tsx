import type { Metadata } from "next";
import { PleaseAdviseGame } from "@/components/clicks/please-advise/PleaseAdviseGame";

export const metadata: Metadata = {
  title: "Please Advise | Nice Little Click Lab",
  description:
    "A tiny workplace judgment game. Reply, reply all, or leave the email alone before your fictional career suffers.",
};

export default function PleaseAdvisePage() {
  return <PleaseAdviseGame />;
}
