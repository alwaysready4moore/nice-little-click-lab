"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { WordSearchPurchasePayload } from "../../../../lib/wordsearch/purchase";
import styles from "./success.module.css";

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
  const [status, setStatus] = useState<
    "checking" | "ready" | "downloading" | "error"
  >("checking");
  const [message, setMessage] = useState("Click is checking the receipt...");

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
        if (!stored) {
          throw new Error("This browser no longer has the word search details.");
        }

        if (!cancelled) {
          setPayload(JSON.parse(stored) as WordSearchPurchasePayload);
          setStatus("ready");
          setMessage("Your printable word search is ready.");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            error instanceof Error
              ? error.message
              : "The purchase could not be verified.",
          );
        }
      }
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  async function downloadPdf() {
    if (!sessionId || !payload) return;

    setStatus("downloading");
    setMessage("Click is lettering the title and checking every hiding place...");

    try {
      const titleImageDataUrl = await renderTitleImageDataUrl(payload.title);
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
      URL.revokeObjectURL(url);

      setStatus("ready");
      setMessage("Downloaded. The answer key is on page two.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "The PDF could not be downloaded.",
      );
    }
  }

  return (
    <section className={styles.card}>
      <p className={styles.eyebrow}>Click No. 004 · purchase complete</p>
      <h1>{status === "error" ? "Something wandered off." : "Your word search is ready."}</h1>
      <p className={styles.message}>{message}</p>

      {payload && status !== "error" && (
        <>
          <div className={styles.summary}>
            <span>2 printable pages</span>
            <span>{payload.words.length} hidden words</span>
            <span>Puzzle + answer key</span>
          </div>
          <p className={styles.saveNotice}>
            Save this PDF somewhere safe. The Lab does not keep a recoverable copy of your
            personalized puzzle.
          </p>
        </>
      )}

      <div className={styles.actions}>
        {payload && status !== "error" && (
          <button
            type="button"
            disabled={status === "downloading"}
            onClick={downloadPdf}
          >
            {status === "downloading" ? "Assembling PDF..." : "Download my PDF"}
          </button>
        )}
        <Link href="/clicks/custom-word-search">Back to the word search maker</Link>
      </div>
    </section>
  );
}
