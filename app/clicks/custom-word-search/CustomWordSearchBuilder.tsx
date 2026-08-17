"use client";

import { useEffect, useMemo, useState } from "react";
import { generateWordSearch, normalizeWord, type WordSearchDifficulty, type WordSearchInput, type WordSearchResult, type WordSearchTheme } from "../../../lib/wordsearch";
import type { WordSearchPurchasePayload } from "../../../lib/wordsearch/purchase";
import styles from "./custom-word-search.module.css";

const starters: WordSearchInput[] = Array.from({ length: 10 }, (_, index) => ({ id: `word-${index + 1}`, word: "" }));
const exampleWords = ["Peaches", "Bookshop", "Sunday", "Baltimore", "Honey", "Museum", "Pancakes", "Garden", "Josie", "Chapter One", "Road Trip", "Blueberries"].map((word, index) => ({ id: `example-${index + 1}`, word }));

function makeId() { return `word-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

export function CustomWordSearchBuilder() {
  const [title, setTitle] = useState("A Little Word Search About Us");
  const [dedication, setDedication] = useState("");
  const [words, setWords] = useState<WordSearchInput[]>(starters);
  const [difficulty, setDifficulty] = useState<WordSearchDifficulty>("medium");
  const [theme, setTheme] = useState<WordSearchTheme>("classic");
  const [includeClickOnAnswerKey, setIncludeClickOnAnswerKey] = useState(true);
  const [result, setResult] = useState<WordSearchResult | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [checkoutState, setCheckoutState] = useState<"idle" | "loading">("idle");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const completed = useMemo(() => words.filter((item) => normalizeWord(item.word).length >= 2), [words]);
  const errors = useMemo(() => {
    const seen = new Map<string, number>();
    completed.forEach((item) => seen.set(normalizeWord(item.word), (seen.get(normalizeWord(item.word)) ?? 0) + 1));
    return new Map(words.map((item) => {
      const normalized = normalizeWord(item.word);
      let message = "";
      if (item.word.trim() && normalized.length < 2) message = "Use at least two letters.";
      else if (normalized.length > 20) message = "Keep this to 20 letters or fewer.";
      else if (normalized && (seen.get(normalized) ?? 0) > 1) message = "This word is already hiding in the list.";
      return [item.id, message];
    }));
  }, [words, completed]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = sessionStorage.getItem("nlcl-wordsearch:draft");
      if (!stored) return;

      try {
        const payload = JSON.parse(stored) as WordSearchPurchasePayload;
        setTitle(payload.title);
        setDedication(payload.dedication);
        setWords(payload.words);
        setDifficulty(payload.difficulty);
        setTheme(payload.theme);
        setIncludeClickOnAnswerKey(payload.includeClickOnAnswerKey);
        setResult(generateWordSearch(payload.words, payload.difficulty));

        if (new URLSearchParams(window.location.search).get("checkout") === "cancelled") {
          setNotice("Checkout cancelled. Your word search is still here.");
        }
      } catch {
        sessionStorage.removeItem("nlcl-wordsearch:draft");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function updateWord(id: string, value: string) {
    setWords((current) => current.map((item) => item.id === id ? { ...item, word: value } : item));
    setResult(null); setNotice(null); setCheckoutError(null);
  }
  function addWord() { if (words.length < 30) setWords((current) => [...current, { id: makeId(), word: "" }]); }
  function removeWord(id: string) { if (words.length > 10) setWords((current) => current.filter((item) => item.id !== id)); setResult(null); }
  function loadExample() { setWords(exampleWords); setTitle("Our Favorite Things"); setDedication("A small puzzle made from very good memories."); setResult(null); setNotice("Example words loaded. Replace anything you like."); }

  function buildPuzzle() {
    const ready = words.filter((item) => normalizeWord(item.word).length >= 2);
    const hasErrors = [...errors.values()].some(Boolean);
    if (ready.length < 10) { setNotice("Add at least ten valid words before Click starts hiding them."); return; }
    if (hasErrors) { setNotice("Fix the highlighted words first. Click is strict about duplicates and very long hiding places."); return; }
    try {
      setResult(generateWordSearch(ready, difficulty));
      setNotice("Click found a hiding place for every word.");
    } catch { setNotice("One of these words needs a shorter hiding place. Try trimming the longest one."); }
  }

  async function startCheckout() {
    if (!result) return;
    const payload: WordSearchPurchasePayload = { title: title.trim() || "A Little Word Search About Us", dedication: dedication.trim(), words: completed, difficulty, theme, includeClickOnAnswerKey };
    setCheckoutState("loading"); setCheckoutError(null);
    try {
      const response = await fetch("/api/wordsearch/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { url?: string; puzzleHash?: string; error?: string };
      if (!response.ok || !data.url || !data.puzzleHash) throw new Error(data.error || "Checkout could not start.");
      sessionStorage.setItem(`nlcl-wordsearch:${data.puzzleHash}`, JSON.stringify(payload));
      sessionStorage.setItem("nlcl-wordsearch:draft", JSON.stringify(payload));
      window.location.assign(data.url);
    } catch (error) { setCheckoutState("idle"); setCheckoutError(error instanceof Error ? error.message : "Checkout could not start."); }
  }

  return <div className={`${styles.page} ${styles[theme]}`}>
    <section className={styles.hero}>
      <p className={styles.eyebrow}>Click No. 004 · $3 gift</p>
      <h1>Hide your favorite people, places, and nonsense in a word search.</h1>
      <p>Make a printable puzzle from names, memories, inside jokes, and the oddly specific things your person loves.</p>
    </section>

    <div className={styles.workspace}>
      <section className={styles.editor} aria-labelledby="words-heading">
        <div className={styles.sectionHeading}><div><p className={styles.step}>Step 1</p><h2 id="words-heading">Your words</h2></div><button className={styles.textButton} type="button" onClick={loadExample}>Try an example</button></div>
        <div className={styles.giftDetails}>
          <label>Puzzle title<input value={title} maxLength={60} onChange={(event) => { setTitle(event.target.value); setResult(null); }} /></label>
          <label>Short dedication <span>(optional)</span><input value={dedication} maxLength={100} placeholder="For Maya, finder of everything" onChange={(event) => setDedication(event.target.value)} /></label>
        </div>
        <div className={styles.wordList}>
          {words.map((item, index) => <div className={styles.wordRow} key={item.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <label><span className={styles.visuallyHidden}>Word {index + 1}</span><input value={item.word} maxLength={40} placeholder={index === 0 ? "A name, place, memory, or favorite thing" : ""} aria-invalid={Boolean(errors.get(item.id))} onChange={(event) => updateWord(item.id, event.target.value)} />{errors.get(item.id) && <small>{errors.get(item.id)}</small>}</label>
            {words.length > 10 && <button type="button" aria-label={`Remove word ${index + 1}`} onClick={() => removeWord(item.id)}>×</button>}
          </div>)}
        </div>
        <div className={styles.editorFooter}><button className={styles.secondaryButton} type="button" disabled={words.length >= 30} onClick={addWord}>+ Add another word</button><span>{completed.length} ready · 10 minimum · 30 maximum</span></div>

        <fieldset className={styles.options}><legend>Difficulty</legend>{(["easy", "medium", "hard"] as WordSearchDifficulty[]).map((value) => <label key={value}><input type="radio" name="difficulty" checked={difficulty === value} onChange={() => { setDifficulty(value); setResult(null); }} /><strong>{value}</strong><span>{value === "easy" ? "Forward only" : value === "medium" ? "Some words run backward" : "Every direction is fair game"}</span></label>)}</fieldset>
        <fieldset className={styles.options}><legend>Paper mood</legend>{(["classic", "celebration", "kids"] as WordSearchTheme[]).map((value) => <label key={value}><input type="radio" name="theme" checked={theme === value} onChange={() => setTheme(value)} /><strong>{value}</strong><span>{value === "classic" ? "Warm and quietly giftable" : value === "celebration" ? "Confetti without the cleanup" : "Bright, friendly, still printable"}</span></label>)}</fieldset>
        <button className={styles.primaryButton} type="button" onClick={buildPuzzle}>Make my word search</button>
        {notice && <p className={styles.notice} role="status">{notice}</p>}
      </section>

      <section className={styles.preview} aria-labelledby="preview-heading">
        <div className={styles.sectionHeading}><div><p className={styles.step}>Step 2</p><h2 id="preview-heading">Your puzzle</h2></div>{result && <span className={styles.previewNote}>Watermarked preview</span>}</div>
        {!result ? <div className={styles.emptyState}><div className={styles.letterCloud} aria-hidden="true">W O R D<br/>S E A R<br/>C H ! !</div><p>Your puzzle will appear once ten words are ready to disappear.</p></div> : <div className={styles.paper}>
          <div className={styles.watermark} aria-hidden="true">PREVIEW · PURCHASE TO PRINT</div>
          <header><p>CUSTOM WORD SEARCH</p><h3>{title || "A Little Word Search About Us"}</h3>{dedication && <span>{dedication}</span>}</header>
          <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${result.size}, 1fr)` }}>{result.grid.flatMap((row, rowIndex) => row.map((letter, colIndex) => <span key={`${rowIndex}-${colIndex}`}>{letter}</span>))}</div>
          <div className={styles.wordBank}>{result.words.map((word) => <span key={word}>{word}</span>)}</div>
          <footer>Nice Little Click Lab · Click No. 004</footer>
        </div>}
        {result && <div className={styles.purchaseBox}><label className={styles.checkLabel}><input type="checkbox" checked={includeClickOnAnswerKey} onChange={(event) => setIncludeClickOnAnswerKey(event.target.checked)} />Let Click sign the answer key</label><p>The $3 download includes the printable puzzle and a separate answer key.</p><button className={styles.buyButton} type="button" disabled={checkoutState === "loading"} onClick={startCheckout}>{checkoutState === "loading" ? "Opening checkout..." : "Get the printable PDF · $3"}</button>{checkoutError && <p className={styles.error}>{checkoutError}</p>}<small>Your words are used only to build this purchase. The Lab does not keep a recoverable copy.</small></div>}
      </section>
    </div>
  </div>;
}
