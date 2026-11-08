"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { WordSearchPurchasePayload } from "../../../../lib/wordsearch/purchase";
import styles from "./success.module.css";
import { readMatchingPurchaseBackup } from "../../../../lib/purchase-backup";

const TITLE_FONT_FAMILY = "NLCL Word Search Mailman";
const TITLE_RASTER_SCALE = 4;
let titleFontPromise: Promise<FontFace> | null = null;

function loadTitleFont() {
  if (!titleFontPromise) {
    const font = new FontFace(
      TITLE_FONT_FAMILY,
      'url("/fonts/MailmanRegular.otf") format("opentype")',
      { style: "normal", weight: "400" },
    );

    titleFontPromise = font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
      return loadedFont;
    });
  }

  return titleFontPromise;
}

async function renderTitleImageDataUrl(rawTitle: string) {
  const title =
    rawTitle.replace(/[\r\n]+/g, " ").trim().slice(0, 60) ||
    "A Little Word Search About Us";

  await loadTitleFont();

  const maxPdfWidth = 528;
  const padding = 24;
  let fontSize = 29 * TITLE_RASTER_SCALE;
  const minimumFontSize = 20 * TITLE_RASTER_SCALE;
  const measuringCanvas = document.createElement("canvas");
  const measuringContext = measuringCanvas.getContext("2d");

  if (!measuringContext) {
    throw new Error("The title could not be prepared in this browser.");
  }

  await document.fonts.load(`400 ${fontSize}px "${TITLE_FONT_FAMILY}"`, title);

  measuringContext.font = `400 ${fontSize}px "${TITLE_FONT_FAMILY}"`;
  let metrics = measuringContext.measureText(title);

  while (true) {
    const measuredWidth =
      Math.max(0, metrics.actualBoundingBoxLeft) +
      Math.max(metrics.width, metrics.actualBoundingBoxRight);

    if (
      measuredWidth <= maxPdfWidth * TITLE_RASTER_SCALE - padding * 2 ||
      fontSize <= minimumFontSize
    ) {
      break;
    }

    fontSize -= TITLE_RASTER_SCALE;
    measuringContext.font = `400 ${fontSize}px "${TITLE_FONT_FAMILY}"`;
    metrics = measuringContext.measureText(title);
  }

  const left = Math.ceil(Math.max(0, metrics.actualBoundingBoxLeft));
  const right = Math.ceil(Math.max(metrics.width, metrics.actualBoundingBoxRight));
  const ascent = Math.ceil(metrics.actualBoundingBoxAscent || fontSize * 0.9);
  const descent = Math.ceil(metrics.actualBoundingBoxDescent || fontSize * 0.25);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, left + right + padding * 2);
  canvas.height = Math.max(1, ascent + descent + padding * 2);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("The title could not be prepared in this browser.");
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = `400 ${fontSize}px "${TITLE_FONT_FAMILY}"`;
  context.textAlign = "left";
  context.textBaseline = "alphabetic";
  context.fillStyle = "#2b2621";
  context.fillText(title, padding + left, padding + ascent);

  return canvas.toDataURL("image/png");
}

export function WordSearchSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [payload, setPayload] = useState<WordSearchPurchasePayload | null>(null);
  const [paidPuzzleHash, setPaidPuzzleHash] = useState<string | null>(null);
  const [status, setStatus] = useState<"checking" | "ready" | "downloading" | "needs-backup" | "error">("checking");
  const [verifyAttempt, setVerifyAttempt] = useState(0);
  const [message, setMessage] = useState("Click is checking the receipt...");
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function verify() {
      try {
        if (!sessionId) throw new Error("The checkout receipt is missing.");
        const response = await fetch(
          `/api/wordsearch/verify?session_id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" },
        );
        const data = (await response.json()) as {
          paid?: boolean;
          puzzleHash?: string | null;
          error?: string;
        };
        if (!response.ok || !data.paid || !data.puzzleHash) {
          throw new Error(data.error || "Payment could not be verified.");
        }

        const stored = sessionStorage.getItem(`nlcl-wordsearch:${data.puzzleHash}`);
        if (!cancelled) {
          setPaidPuzzleHash(data.puzzleHash);
          setDownloadError(null);
          if (!stored) {
            setStatus("needs-backup");
            setMessage("Payment confirmed. This browser no longer has the word search details. Restore your purchase backup to download it.");
          } else {
            setPayload(JSON.parse(stored) as WordSearchPurchasePayload);
            setStatus("ready");
            setMessage("Your printable word search is ready.");
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
      const restored = await readMatchingPurchaseBackup<WordSearchPurchasePayload>(
        file, "wordsearch", paidPuzzleHash,
      );
      sessionStorage.setItem(`nlcl-wordsearch:${paidPuzzleHash}`, JSON.stringify(restored));
      setPayload(restored);
      setStatus("ready");
      setMessage("Your matching backup is restored. You can download the word search.");
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "Could not open that backup.");
    }
  }

  async function downloadPdf() {
    if (!sessionId || !payload) return;
    setStatus("downloading");
    setDownloadError(null);
    setMessage("Click is lettering the title and checking every hiding place...");

    try {
      // If the custom font is unavailable, the server can use its native PDF title.
      let titleImageDataUrl: string | undefined;
      try {
        titleImageDataUrl = await renderTitleImageDataUrl(payload.title);
      } catch {
        titleImageDataUrl = undefined;
      }

      const response = await fetch("/api/wordsearch/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, payload, titleImageDataUrl }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "The PDF could not be assembled.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "custom-word-search-gift.pdf";
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
      <p className={styles.eyebrow}>Click No. 004 · purchase complete</p>
      <h1>{status === "error" ? "We couldn't check that receipt." : status === "needs-backup" ? "Your purchase is confirmed." : "Your word search is ready."}</h1>
      <p className={styles.message} role="status">{message}</p>
      {payload && status !== "error" && (
        <>
          <div className={styles.summary}>
            <span>2 printable pages</span>
            <span>{payload.words.length} hidden words</span>
            <span>Puzzle + answer key</span>
          </div>
          <p className={styles.saveNotice}>
            Save this PDF somewhere safe. The Lab does not keep a recoverable copy of your personalized puzzle.
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
        <Link href="/clicks/custom-word-search">Back to the word search maker</Link>
      </div>
      {status === "error" && <p className={styles.help}>Keep your Stripe receipt. Contact the Lab with the receipt reference if payment went through.</p>}
    </section>
  );
}
