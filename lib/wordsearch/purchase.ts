import { generateWordSearch, normalizeWord, wordSearchSeed } from "./generateWordSearch";
import type { WordSearchDifficulty, WordSearchInput, WordSearchResult, WordSearchTheme } from "./types";

export type WordSearchPurchasePayload = {
  title: string;
  dedication: string;
  words: WordSearchInput[];
  difficulty: WordSearchDifficulty;
  theme: WordSearchTheme;
  includeClickOnAnswerKey: boolean;
};

export type WordSearchDocumentPayload = WordSearchPurchasePayload & { result: WordSearchResult };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseWordSearchPurchasePayload(value: unknown): WordSearchPurchasePayload | null {
  if (!isRecord(value)) return null;
  if (typeof value.title !== "string" || value.title.length > 60) return null;
  if (typeof value.dedication !== "string" || value.dedication.length > 100) return null;
  if (!(["easy", "medium", "hard"] as unknown[]).includes(value.difficulty)) return null;
  if (!(["classic", "celebration", "kids"] as unknown[]).includes(value.theme)) return null;
  if (typeof value.includeClickOnAnswerKey !== "boolean") return null;
  if (!Array.isArray(value.words) || value.words.length < 10 || value.words.length > 30) return null;

  const words: WordSearchInput[] = [];
  const seen = new Set<string>();
  for (const [index, item] of value.words.entries()) {
    if (!isRecord(item) || typeof item.word !== "string") return null;
    const word = item.word.trim();
    const normalized = normalizeWord(word);
    if (word.length > 40 || normalized.length < 2 || normalized.length > 20 || seen.has(normalized)) return null;
    seen.add(normalized);
    words.push({ id: `word-${index + 1}`, word });
  }

  return {
    title: value.title.trim() || "A Little Word Search About Us",
    dedication: value.dedication.trim(),
    words,
    difficulty: value.difficulty as WordSearchDifficulty,
    theme: value.theme as WordSearchTheme,
    includeClickOnAnswerKey: value.includeClickOnAnswerKey,
  };
}

export function createWordSearchDocument(payload: WordSearchPurchasePayload): WordSearchDocumentPayload | null {
  try {
    const result = generateWordSearch(payload.words, payload.difficulty, wordSearchSeed(payload.words, payload.difficulty));
    return { ...payload, result };
  } catch {
    return null;
  }
}
