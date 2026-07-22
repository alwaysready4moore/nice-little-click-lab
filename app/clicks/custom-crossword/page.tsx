import type { Metadata } from "next";
import { CustomCrosswordBuilder } from "./CustomCrosswordBuilder";

export const metadata: Metadata = {
  title: "Instant Custom Crossword Gift | Nice Little Click Lab",
  description:
    "Turn shared memories, favorite places, and inside jokes into a personalized crossword gift.",
};

export default function CustomCrosswordPage() {
  return <CustomCrosswordBuilder />;
}
