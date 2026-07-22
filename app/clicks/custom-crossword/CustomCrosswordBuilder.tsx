"use client";

import { useEffect, useMemo, useState } from "react";
import { generateCrossword } from "../../../lib/crossword";
import type {
  CrosswordInput,
  CrosswordPlacement,
  CrosswordResult,
} from "../../../lib/crossword";
import type { CrosswordPurchasePayload } from "../../../lib/crossword/purchase";
import styles from "./custom-crossword.module.css";

type DraftEntry = CrosswordInput;

const starterEntries: DraftEntry[] = [
  { id: "memory-1", answer: "", clue: "" },
  { id: "memory-2", answer: "", clue: "" },
  { id: "memory-3", answer: "", clue: "" },
  { id: "memory-4", answer: "", clue: "" },
  { id: "memory-5", answer: "", clue: "" },
  { id: "memory-6", answer: "", clue: "" },
  { id: "memory-7", answer: "", clue: "" },
  { id: "memory-8", answer: "", clue: "" },
];

const examples: DraftEntry[] = [
  { id: "example-1", answer: "Peaches", clue: "The fruit we bought at every roadside stand" },
  { id: "example-2", answer: "Baltimore", clue: "Where our story officially began" },
  { id: "example-3", answer: "Bees", clue: "Tiny guests at the garden wedding" },
  { id: "example-4", answer: "Bookshop", clue: "Our favorite accidental three-hour date" },
  { id: "example-5", answer: "Josie", clue: "The smallest member of the wedding party" },
  { id: "example-6", answer: "ChapterOne", clue: "What we call our first apartment" },
  { id: "example-7", answer: "Honey", clue: "A nickname and a pantry staple" },
  { id: "example-8", answer: "Lorraine", clue: "A middle name worth passing down" },
  { id: "example-9", answer: "Sunday", clue: "Our unofficial pancake holiday" },
  { id: "example-10", answer: "Museum", clue: "Where the rain rescued our afternoon" },
];

const failureCopy: Record<string, string> = {
  "too-short": "Use at least two letters.",
  "too-long": "Shorten this answer to 24 letters or fewer.",
  "no-letters": "Add an answer containing letters.",
  duplicate: "This answer already appears in the puzzle.",
  "could-not-fit": "This one could not mingle with the others. Try a shorter answer or a synonym.",
};

function makeId() {
  return `memory-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function CustomCrosswordBuilder() {
  const [title, setTitle] = useState("A Little Puzzle About Us");
  const [dedication, setDedication] = useState("");
  const [entries, setEntries] = useState<DraftEntry[]>(starterEntries);
  const [result, setResult] = useState<CrosswordResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [checkoutState, setCheckoutState] = useState<"idle" | "loading">("idle");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [includeClickOnAnswerKey, setIncludeClickOnAnswerKey] = useState(true);

  const completedCount = useMemo(
    () => entries.filter((entry) => entry.answer.trim() && entry.clue.trim()).length,
    [entries],
  );

  const cellMap = useMemo(() => {
    const map = new Map<string, CrosswordResult["grid"]["cells"][number]>();
    result?.grid.cells.forEach((cell) => map.set(`${cell.row},${cell.col}`, cell));
    return map;
  }, [result]);

  useEffect(() => {
    const stored = sessionStorage.getItem("nlcl-crossword:draft");
    if (!stored) return;
    try {
      const payload = JSON.parse(stored) as CrosswordPurchasePayload;
      setTitle(payload.title);
      setDedication(payload.dedication);
      setResult(payload.result);
      setIncludeClickOnAnswerKey(payload.includeClickOnAnswerKey ?? true);
      setEntries(
        payload.result.placements.map((placement) => ({
          id: placement.id,
          answer: placement.answer,
          clue: placement.clue,
        })),
      );
      if (new URLSearchParams(window.location.search).get("checkout") === "cancelled") {
        setNotice("Checkout cancelled. Your crossword is still here.");
      }
    } catch {
      sessionStorage.removeItem("nlcl-crossword:draft");
    }
  }, []);

  function updateEntry(id: string, field: "answer" | "clue", value: string) {
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)),
    );
    setResult(null);
    setNotice(null);
  }

  function addEntry() {
    if (entries.length >= 15) return;
    setEntries((current) => [...current, { id: makeId(), answer: "", clue: "" }]);
  }

  function removeEntry(id: string) {
    if (entries.length <= 8) return;
    setEntries((current) => current.filter((entry) => entry.id !== id));
    setResult(null);
  }

  function loadExample() {
    setEntries(examples);
    setTitle("Our Story, One Clue at a Time");
    setDedication("For the person who remembers every chapter.");
    setResult(null);
    setNotice("Example memories loaded. Change anything you like.");
  }

  function buildPuzzle() {
    const completeEntries = entries.filter(
      (entry) => entry.answer.trim().length > 0 && entry.clue.trim().length > 0,
    );

    if (completeEntries.length < 8) {
      setNotice("Add at least eight complete answers and clues before Click starts arranging things.");
      return;
    }

    const nextResult = generateCrossword(completeEntries, {
      maxAttempts: 240,
      requireAll: false,
    });

    setResult(nextResult);
    setNotice(
      nextResult.stats.placedCount === completeEntries.length
        ? "Click found a place for everything."
        : `${nextResult.stats.placedCount} of ${completeEntries.length} memories made it into this version.`,
    );
  }

  async function startCheckout() {
    if (!result || result.unplaced.length > 0) return;

    const payload: CrosswordPurchasePayload = {
      title: title.trim() || "A Little Puzzle About Us",
      dedication: dedication.trim(),
      result,
      includeClickOnAnswerKey,
    };

    setCheckoutState("loading");
    setCheckoutError(null);

    try {
      const response = await fetch("/api/crossword/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        url?: string;
        puzzleHash?: string;
        error?: string;
      };
      if (!response.ok || !data.url || !data.puzzleHash) {
        throw new Error(data.error || "Checkout could not start.");
      }

      sessionStorage.setItem(`nlcl-crossword:${data.puzzleHash}`, JSON.stringify(payload));
      sessionStorage.setItem("nlcl-crossword:draft", JSON.stringify(payload));
      window.location.assign(data.url);
    } catch (error) {
      setCheckoutState("idle");
      setCheckoutError(error instanceof Error ? error.message : "Checkout could not start.");
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Click No. 002 · paid experiment</p>
        <h1>Make a crossword out of the things only you two know.</h1>
        <p>
          Add names, places, ridiculous quotes, and tiny pieces of shared history. Click will arrange
          them into a giftable little puzzle.
        </p>
      </section>

      <div className={styles.workspace}>
        <section className={styles.editor} aria-labelledby="memory-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.step}>Step 1</p>
              <h2 id="memory-heading">Your memories</h2>
            </div>
            <button className={styles.textButton} type="button" onClick={loadExample}>
              Try an example
            </button>
          </div>

          <div className={styles.giftDetails}>
            <label>
              Puzzle title
              <input
                value={title}
                maxLength={60}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label>
              Short dedication <span>(optional)</span>
              <input
                value={dedication}
                maxLength={100}
                placeholder="For Maya, who remembers everything"
                onChange={(event) => setDedication(event.target.value)}
              />
            </label>
          </div>

          <div className={styles.entryList}>
            {entries.map((entry, index) => (
              <div className={styles.entryCard} key={entry.id}>
                <div className={styles.entryNumber}>{String(index + 1).padStart(2, "0")}</div>
                <label>
                  Answer
                  <textarea
                    className={styles.answerInput}
                    value={entry.answer}
                    maxLength={30}
                    rows={1}
                    placeholder={index === 0 ? "The answer in the grid" : ""}
                    onChange={(event) => updateEntry(entry.id, "answer", event.target.value)}
                  />
                </label>
                <label>
                  Clue
                  <textarea
                    className={styles.clueInput}
                    value={entry.clue}
                    maxLength={110}
                    rows={1}
                    placeholder={index === 0 ? "A clue only they will understand" : ""}
                    onChange={(event) => updateEntry(entry.id, "clue", event.target.value)}
                  />
                </label>
                {entries.length > 8 && (
                  <button
                    className={styles.removeButton}
                    type="button"
                    aria-label={`Remove answer ${index + 1}`}
                    onClick={() => removeEntry(entry.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className={styles.editorFooter}>
            <button
              className={styles.secondaryButton}
              type="button"
              disabled={entries.length >= 15}
              onClick={addEntry}
            >
              + Add another memory
            </button>
            <span>{completedCount} complete · 8 minimum · 15 maximum</span>
          </div>

          <button className={styles.primaryButton} type="button" onClick={buildPuzzle}>
            Make my crossword
          </button>

          {notice && <p className={styles.notice} role="status">{notice}</p>}
        </section>

        <section className={styles.preview} aria-labelledby="preview-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.step}>Step 2</p>
              <h2 id="preview-heading">Your puzzle</h2>
            </div>
            {result && <span className={styles.previewNote}>Watermarked preview</span>}
          </div>

          {!result ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyGrid} aria-hidden="true">
                {Array.from({ length: 36 }, (_, index) => <span key={index} />)}
              </div>
              <p>Your crossword will appear here once eight memories are ready to mingle.</p>
            </div>
          ) : (
            <div
              className={styles.paper}
              onContextMenu={(event) => event.preventDefault()}
              aria-label="Low-resolution watermarked crossword preview"
            >
              <div className={styles.previewWatermarks} aria-hidden="true">
                {Array.from({ length: 5 }, (_, index) => (
                  <span key={index}>PREVIEW · PURCHASE TO PRINT</span>
                ))}
              </div>
              <header className={styles.paperHeader}>
                <p>made especially for you</p>
                <h3>{title.trim() || "A Little Puzzle About Us"}</h3>
                {dedication.trim() && <span>{dedication}</span>}
              </header>

              <div
                className={styles.grid}
                style={{
                  gridTemplateColumns: `repeat(${result.grid.cols}, minmax(0, 1fr))`,
                }}
                aria-label="Crossword puzzle grid preview"
              >
                {Array.from({ length: result.grid.rows * result.grid.cols }, (_, index) => {
                  const row = Math.floor(index / result.grid.cols);
                  const col = index % result.grid.cols;
                  const cell = cellMap.get(`${row},${col}`);
                  return cell ? (
                    <span className={styles.openCell} key={`${row}-${col}`}>
                      {cell.number && <small>{cell.number}</small>}
                    </span>
                  ) : (
                    <span className={styles.blockCell} key={`${row}-${col}`} />
                  );
                })}
              </div>

              <div className={styles.clues}>
                <ClueList title="Across" placements={result.across} />
                <ClueList title="Down" placements={result.down} />
              </div>

              <footer className={styles.paperFooter}>nicelittleclick.com · assembled by Click</footer>
            </div>
          )}

          {result && result.unplaced.length > 0 && (
            <div className={styles.unplaced}>
              <h3>A few memories are refusing to mingle.</h3>
              <ul>
                {result.unplaced.map((entry) => (
                  <li key={entry.id}>
                    <strong>{entry.answer || "Untitled answer"}</strong>
                    <span>{failureCopy[entry.reason]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result && (
            <div className={styles.purchaseCard}>
              <div>
                <p className={styles.purchaseLabel}>Printable gift</p>
                <h3>Download the finished crossword</h3>
                <p>Two-page PDF: the puzzle first, then a separate answer key.</p>
              </div>
              <label
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  padding: "0.75rem 0.9rem",
                  border: "1px solid rgba(143, 74, 31, 0.22)",
                  borderRadius: "14px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={includeClickOnAnswerKey}
                  onChange={(event) => setIncludeClickOnAnswerKey(event.target.checked)}
                  style={{ width: "1.1rem", height: "1.1rem", accentColor: "#8f4a1f" }}
                />
                <span>Include Click on the answer-key page</span>
              </label>
              <div className={styles.purchaseAction}>
                <strong>$4</strong>
                <button
                  className={styles.checkoutButton}
                  type="button"
                  disabled={checkoutState === "loading" || result.unplaced.length > 0}
                  onClick={startCheckout}
                >
                  {checkoutState === "loading" ? "Opening checkout..." : "Buy & download PDF"}
                </button>
              </div>
              <p className={styles.checkoutHint}>
                No AI reads your entries. Your puzzle details stay in this browser
                for checkout and download, and they are not saved to a customer
                account. Please save the finished PDF somewhere safe.
              </p>
              {result.unplaced.length > 0 && (
                <p className={styles.checkoutHint}>Get every memory into the grid before checkout.</p>
              )}
              {checkoutError && <p className={styles.checkoutError} role="alert">{checkoutError}</p>}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ClueList({ title, placements }: { title: string; placements: CrosswordPlacement[] }) {
  return (
    <div>
      <h4>{title}</h4>
      {placements.length > 0 ? (
        <ol>
          {placements.map((placement) => (
            <li key={`${placement.id}-${placement.direction}`}>
              <span className={styles.clueNumber}>{placement.number}.</span>
              <span>{placement.clue}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p>No clues in this direction.</p>
      )}
    </div>
  );
}
