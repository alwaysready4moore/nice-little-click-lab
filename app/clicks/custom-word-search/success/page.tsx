import type { Metadata } from "next";
import { Suspense } from "react";
import { WordSearchSuccess } from "./WordSearchSuccess";
import styles from "./success.module.css";

export const metadata: Metadata = {
  title: "Your Custom Word Search",
  robots: { index: false, follow: false },
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
