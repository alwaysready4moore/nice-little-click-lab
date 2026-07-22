export type CrosswordDirection = "across" | "down";

export type CrosswordInput = {
  id: string;
  answer: string;
  clue: string;
};

export type NormalizedCrosswordEntry = CrosswordInput & {
  normalizedAnswer: string;
};

export type CrosswordCell = {
  row: number;
  col: number;
  letter: string;
  number?: number;
};

export type CrosswordPlacement = NormalizedCrosswordEntry & {
  row: number;
  col: number;
  direction: CrosswordDirection;
  number: number;
};

export type CrosswordFailureReason =
  | "too-short"
  | "too-long"
  | "no-letters"
  | "duplicate"
  | "could-not-fit";

export type CrosswordUnplacedEntry = CrosswordInput & {
  normalizedAnswer: string;
  reason: CrosswordFailureReason;
};

export type CrosswordGrid = {
  rows: number;
  cols: number;
  cells: CrosswordCell[];
};

export type CrosswordResult = {
  success: boolean;
  placements: CrosswordPlacement[];
  unplaced: CrosswordUnplacedEntry[];
  grid: CrosswordGrid;
  across: CrosswordPlacement[];
  down: CrosswordPlacement[];
  stats: {
    inputCount: number;
    placedCount: number;
    unplacedCount: number;
    intersections: number;
    density: number;
  };
};

export type GenerateCrosswordOptions = {
  minAnswerLength?: number;
  maxAnswerLength?: number;
  maxAttempts?: number;
  seed?: number;
  requireAll?: boolean;
};
