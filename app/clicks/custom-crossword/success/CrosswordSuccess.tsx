"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CrosswordPurchasePayload } from "../../../../lib/crossword/purchase";
import { readMatchingPurchaseBackup } from "../../../../lib/purchase-backup";
import styles from "./success.module.css";

type Status = "checking" | "ready" | "downloading" | "needs-backup" | "error";

export function CrosswordSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<Status>("checking");
  const [payload, setPayload] = useState<CrosswordPurchasePayload | null>(null);
  const [paidPuzzleHash, setPaidPuzzleHash] = useState<string | null>(null);
  const [verifyAttempt, setVerifyAttempt] = useState(0);
  const [message, setMessage] = useState("Click is checking the receipt...");
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function verify() {
      try {
        if (!sessionId) throw new Error("This page is missing its checkout receipt.");
        const response = await fetch(
          `/api/crossword/verify?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" },
        );
        const data = (await response.json()) as {
          paid?: boolean;
          puzzleHash?: string | null;
          error?: string;
        };
        if (!response.ok || !data.paid || !data.puzzleHash) {
          throw new Error(data.error || "Payment has not been confirmed yet.");
        }

        const stored = sessionStorage.getItem(`nlcl-crossword:${data.puzzleHash}`);
        if (!cancelled) {
          setPaidPuzzleHash(data.puzzleHash);
          setDownloadError(null);
          if (!stored) {
            setStatus("needs-backup");
            setMessage("Payment confirmed. This browser no longer has the puzzle details. Restore your purchase backup to download it.");
          } else {
            setPayload(JSON.parse(stored) as CrosswordPurchasePayload);
            setStatus("ready");
            setMessage("Your printable crossword is ready.");
          }
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "The purchase could not be verified.");
        }
      }
    }
    void verify();
    return () => { cancelled = true; };
  }, [sessionId, verifyAttempt]);

  async function restoreBackup(file: File | undefined) {
    if (!file || !paidPuzzleHash) return;
    try {
      setDownloadError(null);
      const restored = await readMatchingPurchaseBackup<CrosswordPurchasePayload>(
        file, "crossword", paidPuzzleHash,
      );
      // The server also rechecks this data against the paid receipt on download.
      sessionStorage.setItem(`nlcl-crossword:${paidPuzzleHash}`, JSON.stringify(restored));
      setPayload(restored);
      setStatus("ready");
      setMessage("Your matching backup is restored. You can download the crossword.");
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Could not open that backup.");
    }
  }

  async function downloadPdf() {
    if (!sessionId || !payload) return;
    setStatus("downloading");
    setDownloadError(null);
    setMessage("Click is assembling both pages...");
    try {
      const response = await fetch("/api/crossword/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, payload }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "The PDF could not be assembled.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "custom-crossword-gift.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("ready");
      setMessage("Download started. The answer key is on page two. Keep your PDF somewhere safe.");
    } catch (error) {
      setStatus("ready");
      setMessage("Your payment is still confirmed. You can try the download again.");
      setDownloadError(error instanceof Error ? error.message : "The PDF could not be downloaded.");
    }
  }

  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>Click No. 002 · purchase complete</p>
      <h1>{status === "error" ? "We couldn't check that receipt." : status === "needs-backup" ? "Your purchase is confirmed." : "Your crossword is ready."}</h1>
      <p className={styles.message} role="status">{message}</p>

      {payload && status !== "error" && (
        <>
          <div className={styles.summary}>
            <span>2 printable pages</span>
            <span>{payload.entries.length} clues</span>
            <span>Puzzle + answer key</span>
          </div>
          <p className={styles.saveNotice}>
            Save this PDF somewhere safe. The Lab does not keep a recoverable copy of your personalized crossword.
          </p>
        </>
      )}

      {status === "needs-backup" && (
        <div className={styles.saveNotice}>
          <p>Your purchase backup stays on your device until you choose a file here.</p>
          <label>
            Restore from purchase backup (.json)
            <input type="file" accept=".json,application/json" onChange={(event) => { void restoreBackup(event.target.files?.[0]); }} />
          </label>
        </div>
      )}
      {downloadError && <p className={styles.help} role="alert">{downloadError}</p>}

      <div className={styles.actions}>
        {payload && status !== "error" && (
          <button type="button" disabled={status === "downloading"} onClick={downloadPdf}>
            {status === "downloading" ? "Assembling PDF..." : downloadError ? "Retry download" : "Download my PDF"}
          </button>
        )}
        {status === "error" && <button type="button" onClick={() => { setStatus("checking"); setVerifyAttempt((value) => value + 1); }}>Retry receipt check</button>}
        <Link href="/clicks/custom-crossword">Back to the crossword maker</Link>
      </div>
      {status === "error" && (
        <p className={styles.help}>Keep your Stripe receipt. Contact the Lab with your receipt reference if payment went through.</p>
      )}
    </section>
  );
}
