import { Suspense } from "react";
import { CrosswordSuccess } from "./CrosswordSuccess";
import { shareImagesForCard } from "@/lib/seo";
import { clickShareCard } from "@/lib/share-card";
import styles from "./success.module.css";

const share = shareImagesForCard(clickShareCard("custom-crossword"));

export const metadata = {
  title: "Your crossword is ready",
  robots: { index: false, follow: false },
  twitter: {
    card: "summary_large_image" as const,
    title: "Your crossword is ready",
    images: share.twitterImages,
  },
};

export default function CrosswordSuccessPage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={<section className={styles.card}><p>Click is checking the receipt...</p></section>}>
        <CrosswordSuccess />
      </Suspense>
    </div>
  );
}
