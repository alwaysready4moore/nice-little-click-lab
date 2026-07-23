import { generateCrossword } from "./generateCrossword";
import { validateEntries } from "./normalize";
import type { CrosswordInput, CrosswordResult } from "./types";

const MIN_ENTRIES = 8;
const MAX_ENTRIES = 15;
const MAX_ANSWER_INPUT_LENGTH = 30;
const MAX_NORMALIZED_ANSWER_LENGTH = 24;
const MAX_CLUE_LENGTH = 110;

export type CrosswordPurchasePayload = {
  title: string;
  dedication: string;
  entries: CrosswordInput[];
  includeClickOnAnswerKey: boolean;
};

export type CrosswordDocumentPayload = CrosswordPurchasePayload & {
  result: CrosswordResult;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function canonicalizeEntries(value: unknown): CrosswordInput[] | null {
  if (!Array.isArray(value) || value.length < MIN_ENTRIES || value.length > MAX_ENTRIES) {
    return null;
  }

  const entries: CrosswordInput[] = [];

  for (const [index, item] of value.entries()) {
    if (!isRecord(item)) return null;
    if (typeof item.answer !== "string" || typeof item.clue !== "string") return null;

    const answer = item.answer.trim();
    const clue = item.clue.trim();

    if (!answer || answer.length > MAX_ANSWER_INPUT_LENGTH) return null;
    if (!clue || clue.length > MAX_CLUE_LENGTH) return null;

    // IDs are regenerated so untrusted client identifiers never flow into the PDF.
    entries.push({
      id: `memory-${index + 1}`,
      answer,
      clue,
    });
  }

  const { valid, invalid } = validateEntries(entries, 2, MAX_NORMALIZED_ANSWER_LENGTH);
  if (invalid.length > 0 || valid.length !== entries.length) return null;

  return entries;
}

export function parseCrosswordPurchasePayload(value: unknown): CrosswordPurchasePayload | null {
  if (!isRecord(value)) return null;
  if (typeof value.title !== "string" || value.title.length > 60) return null;
  if (typeof value.dedication !== "string" || value.dedication.length > 100) return null;
  if (typeof value.includeClickOnAnswerKey !== "boolean") return null;

  const entries = canonicalizeEntries(value.entries);
  if (!entries) return null;

  return {
    title: value.title.trim() || "A Little Puzzle About Us",
    dedication: value.dedication.trim(),
    entries,
    includeClickOnAnswerKey: value.includeClickOnAnswerKey,
  };
}

export function crosswordSeed(entries: CrosswordInput[]): number {
  const source = entries
    .map((entry) => `${entry.answer.trim().toUpperCase()}\u0000${entry.clue.trim()}`)
    .join("\u0001");
  let hash = 2166136261;

  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createCrosswordDocument(
  payload: CrosswordPurchasePayload,
): CrosswordDocumentPayload | null {
  const result = generateCrossword(payload.entries, {
    maxAttempts: 360,
    requireAll: true,
    seed: crosswordSeed(payload.entries),
  });

  if (
    !result.success ||
    result.unplaced.length > 0 ||
    result.placements.length !== payload.entries.length
  ) {
    return null;
  }

  return { ...payload, result };
}
