import type { Metadata } from "next";
import { Suspense } from "react";
import { WordSearchSuccess } from "./WordSearchSuccess";
import { shareImagesForCard } from "@/lib/seo";
import { clickShareCard } from "@/lib/share-card";
import styles from "./success.module.css";

const share = shareImagesForCard(clickShareCard("custom-word-search"));

export const metadata: Metadata = {
  title: "Your Custom Word Search",
  robots: { index: false, follow: false },
  twitter: {
    card: "summary_large_image",
    title: "Your Custom Word Search",
    images: share.twitterImages,
  },
};

export default function WordSearchSuccessPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={<p>Click is checking the receipt...</p>}>
        <WordSearchSuccess />
      </Suspense>
    </main>
  );
}
