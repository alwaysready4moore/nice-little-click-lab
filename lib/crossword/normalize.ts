import type {
  CrosswordFailureReason,
  CrosswordInput,
  CrosswordUnplacedEntry,
  NormalizedCrosswordEntry,
} from "./types";

export function normalizeAnswer(answer: string): string {
  return answer
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

export function validateEntries(
  entries: CrosswordInput[],
  minAnswerLength: number,
  maxAnswerLength: number,
): {
  valid: NormalizedCrosswordEntry[];
  invalid: CrosswordUnplacedEntry[];
} {
  const seen = new Set<string>();
  const valid: NormalizedCrosswordEntry[] = [];
  const invalid: CrosswordUnplacedEntry[] = [];

  for (const entry of entries) {
    const normalizedAnswer = normalizeAnswer(entry.answer);
    let reason: CrosswordFailureReason | null = null;

    if (!normalizedAnswer) reason = "no-letters";
    else if (normalizedAnswer.length < minAnswerLength) reason = "too-short";
    else if (normalizedAnswer.length > maxAnswerLength) reason = "too-long";
    else if (seen.has(normalizedAnswer)) reason = "duplicate";

    if (reason) {
      invalid.push({ ...entry, normalizedAnswer, reason });
      continue;
    }

    seen.add(normalizedAnswer);
    valid.push({ ...entry, normalizedAnswer });
  }

  return { valid, invalid };
}
