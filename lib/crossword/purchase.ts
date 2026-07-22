import type { CrosswordResult } from "./types";

export type CrosswordPurchasePayload = {
  title: string;
  dedication: string;
  result: CrosswordResult;
  includeClickOnAnswerKey: boolean;
};

export function isCrosswordPurchasePayload(value: unknown): value is CrosswordPurchasePayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<CrosswordPurchasePayload>;
  const result = payload.result;

  return (
    typeof payload.title === "string" &&
    payload.title.length <= 60 &&
    typeof payload.dedication === "string" &&
    payload.dedication.length <= 100 &&
    typeof payload.includeClickOnAnswerKey === "boolean" &&
    !!result &&
    Array.isArray(result.placements) &&
    Array.isArray(result.across) &&
    Array.isArray(result.down) &&
    Array.isArray(result.unplaced) &&
    !!result.grid &&
    Number.isInteger(result.grid.rows) &&
    Number.isInteger(result.grid.cols) &&
    Array.isArray(result.grid.cells) &&
    result.placements.length >= 8 &&
    result.placements.length <= 15 &&
    result.unplaced.length === 0
  );
}
