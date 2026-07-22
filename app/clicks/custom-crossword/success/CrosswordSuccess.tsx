"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { CrosswordPurchasePayload } from "../../../../lib/crossword/purchase";
import styles from "./success.module.css";

type Status = "checking" | "ready" | "downloading" | "error";

export function CrosswordSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<Status>("checking");
  const [payload, setPayload] = useState<CrosswordPurchasePayload | null>(null);
  const [message, setMessage] = useState("Click is checking the receipt...");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("This page is missing its checkout receipt.");
      return;
    }

    let cancelled = false;
    async function verify() {
      try {
        const response = await fetch(`/api/crossword/verify?session_id=${encodeURIComponent(sessionId!)}`, {
          cache: "no-store",
        });
        const data = (await response.json()) as { paid?: boolean; puzzleHash?: string | null; error?: string };
        if (!response.ok || !data.paid || !data.puzzleHash) {
          throw new Error(data.error || "Payment has not been confirmed yet.");
        }
        const stored = sessionStorage.getItem(`nlcl-crossword:${data.puzzleHash}`);
        if (!stored) {
          throw new Error("The purchase is valid, but this browser no longer has the crossword details.");
        }
        const parsed = JSON.parse(stored) as CrosswordPurchasePayload;
        if (!cancelled) {
          setPayload(parsed);
          setStatus("ready");
          setMessage("Your printable crossword is ready.");
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
  }, [sessionId]);

  async function downloadPdf() {
    if (!sessionId || !payload) return;
    setStatus("downloading");
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
      URL.revokeObjectURL(url);
      setStatus("ready");
      setMessage("Downloaded. The answer key is safely tucked onto page two.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "The PDF could not be downloaded.");
    }
  }

  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>Click No. 002 · purchase complete</p>
      <h1>{status === "error" ? "Something wandered off." : "Your crossword is ready."}</h1>
      <p className={styles.message}>{message}</p>

      {payload && status !== "error" && (
        <div className={styles.summary}>
          <span>2 printable pages</span>
          <span>{payload.result.placements.length} clues</span>
          <span>Puzzle + answer key</span>
        </div>
      )}

      {payload && status !== "error" && (
        <p className={styles.saveNotice}>
          Save this PDF somewhere safe. The Lab does not keep a copy of your
          personalized crossword and cannot retrieve it after your browser data is gone.
        </p>
      )}

      <div className={styles.actions}>
        {payload && status !== "error" && (
          <button type="button" disabled={status === "downloading"} onClick={downloadPdf}>
            {status === "downloading" ? "Assembling PDF..." : "Download my PDF"}
          </button>
        )}
        <Link href="/clicks/custom-crossword">Back to the crossword maker</Link>
      </div>

      {status === "error" && (
        <p className={styles.help}>Keep your Stripe receipt. We can use the session ID in the return URL to investigate a paid order.</p>
      )}
    </section>
  );
}
