"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import styles from "./fresh-from-lab-banner.module.css";

const DISMISS_KEY = "nlcl-fresh-from-lab-click-005";
const DISMISS_EVENT = "nlcl:fresh-from-lab-change";
const VISIBLE_PATHS = new Set(["/", "/clicks"]);
let dismissedForPageView = false;

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(DISMISS_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(DISMISS_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  if (dismissedForPageView) return false;

  try {
    return window.localStorage.getItem(DISMISS_KEY) !== "dismissed";
  } catch {
    return true;
  }
}

function getServerSnapshot() {
  return true;
}

export function FreshFromLabBanner() {
  const pathname = usePathname();
  const isVisible = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!VISIBLE_PATHS.has(pathname) || !isVisible) return null;

  const dismiss = () => {
    dismissedForPageView = true;

    try {
      window.localStorage.setItem(DISMISS_KEY, "dismissed");
    } catch {
      // The banner can still disappear for this page view if storage is blocked.
    }
    window.dispatchEvent(new Event(DISMISS_EVENT));
  };

  return (
    <aside className={styles.banner} aria-label="Fresh from the Lab">
      <div className={styles.inner}>
        <span className={styles.paw} aria-hidden="true">
          🐾
        </span>

        <div className={styles.copy}>
          <strong>Fresh from the Lab:</strong>{" "}
          <span>Should This Have Been an Email? is live.</span>
        </div>

        <div className={styles.links}>
          <Link
            className={styles.primaryLink}
            href="/clicks/should-have-been-an-email"
          >
            Judge a meeting
          </Link>
          <Link className={styles.secondaryLink} href="/clicks/custom-word-search">
            New word search gift
          </Link>
        </div>

        <button
          type="button"
          className={styles.dismiss}
          onClick={dismiss}
          aria-label="Dismiss Fresh from the Lab announcement"
        >
          ×
        </button>
      </div>
    </aside>
  );
}
