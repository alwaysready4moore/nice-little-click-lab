import { Suspense } from "react";
import { CrosswordSuccess } from "./CrosswordSuccess";
import styles from "./success.module.css";

export const metadata = {
  title: "Your crossword is ready",
  robots: { index: false, follow: false },
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
