import { validateEntries } from "./normalize";
import type {
  CrosswordCell,
  CrosswordDirection,
  CrosswordGrid,
  CrosswordInput,
  CrosswordPlacement,
  CrosswordResult,
  GenerateCrosswordOptions,
  NormalizedCrosswordEntry,
} from "./types";

type Coordinate = { row: number; col: number };
type DraftPlacement = Omit<CrosswordPlacement, "number">;
type CellState = {
  letter: string;
  across: boolean;
  down: boolean;
};
type Candidate = Coordinate & {
  direction: CrosswordDirection;
  intersections: number;
  compactness: number;
};

type Attempt = {
  placements: DraftPlacement[];
  cells: Map<string, CellState>;
  intersections: number;
  score: number;
};

const keyOf = (row: number, col: number) => `${row},${col}`;

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], rng: () => number): T[] {
  return [...items].sort(() => rng() - 0.5);
}

function cellAt(
  cells: Map<string, CellState>,
  row: number,
  col: number,
): CellState | undefined {
  return cells.get(keyOf(row, col));
}

function boundsOfPlacements(placements: DraftPlacement[]) {
  if (placements.length === 0) {
    return { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0, area: 0 };
  }

  let minRow = Infinity;
  let maxRow = -Infinity;
  let minCol = Infinity;
  let maxCol = -Infinity;

  for (const placement of placements) {
    const endRow =
      placement.direction === "down"
        ? placement.row + placement.normalizedAnswer.length - 1
        : placement.row;
    const endCol =
      placement.direction === "across"
        ? placement.col + placement.normalizedAnswer.length - 1
        : placement.col;

    minRow = Math.min(minRow, placement.row, endRow);
    maxRow = Math.max(maxRow, placement.row, endRow);
    minCol = Math.min(minCol, placement.col, endCol);
    maxCol = Math.max(maxCol, placement.col, endCol);
  }

  return {
    minRow,
    maxRow,
    minCol,
    maxCol,
    area: (maxRow - minRow + 1) * (maxCol - minCol + 1),
  };
}

function validatePlacement(
  entry: NormalizedCrosswordEntry,
  row: number,
  col: number,
  direction: CrosswordDirection,
  cells: Map<string, CellState>,
): { valid: boolean; intersections: number } {
  const word = entry.normalizedAnswer;
  const rowStep = direction === "down" ? 1 : 0;
  const colStep = direction === "across" ? 1 : 0;
  const before = cellAt(cells, row - rowStep, col - colStep);
  const after = cellAt(
    cells,
    row + rowStep * word.length,
    col + colStep * word.length,
  );

  if (before || after) return { valid: false, intersections: 0 };

  let intersections = 0;

  for (let index = 0; index < word.length; index += 1) {
    const currentRow = row + rowStep * index;
    const currentCol = col + colStep * index;
    const existing = cellAt(cells, currentRow, currentCol);

    if (existing) {
      if (existing.letter !== word[index]) {
        return { valid: false, intersections: 0 };
      }

      if (
        (direction === "across" && existing.across) ||
        (direction === "down" && existing.down)
      ) {
        return { valid: false, intersections: 0 };
      }

      intersections += 1;
      continue;
    }

    if (direction === "across") {
      if (
        cellAt(cells, currentRow - 1, currentCol) ||
        cellAt(cells, currentRow + 1, currentCol)
      ) {
        return { valid: false, intersections: 0 };
      }
    } else if (
      cellAt(cells, currentRow, currentCol - 1) ||
      cellAt(cells, currentRow, currentCol + 1)
    ) {
      return { valid: false, intersections: 0 };
    }
  }

  return { valid: intersections > 0, intersections };
}

function placeWord(
  entry: NormalizedCrosswordEntry,
  row: number,
  col: number,
  direction: CrosswordDirection,
  cells: Map<string, CellState>,
): void {
  const rowStep = direction === "down" ? 1 : 0;
  const colStep = direction === "across" ? 1 : 0;

  for (let index = 0; index < entry.normalizedAnswer.length; index += 1) {
    const currentRow = row + rowStep * index;
    const currentCol = col + colStep * index;
    const key = keyOf(currentRow, currentCol);
    const existing = cells.get(key);

    cells.set(key, {
      letter: entry.normalizedAnswer[index],
      across: existing?.across || direction === "across",
      down: existing?.down || direction === "down",
    });
  }
}

function getCandidates(
  entry: NormalizedCrosswordEntry,
  placements: DraftPlacement[],
  cells: Map<string, CellState>,
): Candidate[] {
  const candidates = new Map<string, Candidate>();

  for (let wordIndex = 0; wordIndex < entry.normalizedAnswer.length; wordIndex += 1) {
    const letter = entry.normalizedAnswer[wordIndex];

    for (const placement of placements) {
      for (
        let placedIndex = 0;
        placedIndex < placement.normalizedAnswer.length;
        placedIndex += 1
      ) {
        if (placement.normalizedAnswer[placedIndex] !== letter) continue;

        const crossingRow =
          placement.row + (placement.direction === "down" ? placedIndex : 0);
        const crossingCol =
          placement.col + (placement.direction === "across" ? placedIndex : 0);
        const direction: CrosswordDirection =
          placement.direction === "across" ? "down" : "across";
        const row = crossingRow - (direction === "down" ? wordIndex : 0);
        const col = crossingCol - (direction === "across" ? wordIndex : 0);
        const validation = validatePlacement(
          entry,
          row,
          col,
          direction,
          cells,
        );

        if (!validation.valid) continue;

        const draft: DraftPlacement = { ...entry, row, col, direction };
        const area = boundsOfPlacements([...placements, draft]).area;
        const candidate: Candidate = {
          row,
          col,
          direction,
          intersections: validation.intersections,
          compactness: area,
        };
        const candidateKey = `${row},${col},${direction}`;
        const prior = candidates.get(candidateKey);

        if (!prior || candidate.intersections > prior.intersections) {
          candidates.set(candidateKey, candidate);
        }
      }
    }
  }

  return [...candidates.values()].sort((a, b) => {
    if (b.intersections !== a.intersections) {
      return b.intersections - a.intersections;
    }
    return a.compactness - b.compactness;
  });
}

function runAttempt(
  entries: NormalizedCrosswordEntry[],
  rng: () => number,
): Attempt {
  const cells = new Map<string, CellState>();
  const placements: DraftPlacement[] = [];
  const sorted = [...entries].sort((a, b) => {
    const lengthDelta = b.normalizedAnswer.length - a.normalizedAnswer.length;
    return lengthDelta !== 0 ? lengthDelta : rng() - 0.5;
  });

  const first = sorted.shift();
  if (!first) return { placements, cells, intersections: 0, score: 0 };

  const firstPlacement: DraftPlacement = {
    ...first,
    row: 0,
    col: 0,
    direction: "across",
  };
  placements.push(firstPlacement);
  placeWord(first, 0, 0, "across", cells);

  let remaining = sorted;
  let intersections = 0;
  let madeProgress = true;

  while (remaining.length > 0 && madeProgress) {
    madeProgress = false;
    const nextRemaining: NormalizedCrosswordEntry[] = [];

    for (const entry of shuffled(remaining, rng)) {
      const candidates = getCandidates(entry, placements, cells);
      if (candidates.length === 0) {
        nextRemaining.push(entry);
        continue;
      }

      const bestIntersectionCount = candidates[0].intersections;
      const bestArea = candidates[0].compactness;
      const shortlist = candidates.filter(
        (candidate) =>
          candidate.intersections === bestIntersectionCount &&
          candidate.compactness <= bestArea * 1.12,
      );
      const chosen = shortlist[Math.floor(rng() * shortlist.length)];

      placements.push({
        ...entry,
        row: chosen.row,
        col: chosen.col,
        direction: chosen.direction,
      });
      placeWord(entry, chosen.row, chosen.col, chosen.direction, cells);
      intersections += chosen.intersections;
      madeProgress = true;
    }

    remaining = nextRemaining;
  }

  const { area } = boundsOfPlacements(placements);
  const score = placements.length * 10000 + intersections * 200 - area;
  return { placements, cells, intersections, score };
}

function numberAndTrim(
  draftPlacements: DraftPlacement[],
  cells: Map<string, CellState>,
): { placements: CrosswordPlacement[]; grid: CrosswordGrid } {
  if (draftPlacements.length === 0) {
    return { placements: [], grid: { rows: 0, cols: 0, cells: [] } };
  }

  const bounds = boundsOfPlacements(draftPlacements);
  const starts = [...new Set(draftPlacements.map((item) => keyOf(item.row, item.col)))]
    .map((key) => {
      const [row, col] = key.split(",").map(Number);
      return { key, row, col };
    })
    .sort((a, b) => a.row - b.row || a.col - b.col);
  const numbers = new Map(starts.map((start, index) => [start.key, index + 1]));

  const placements = draftPlacements
    .map((placement) => ({
      ...placement,
      row: placement.row - bounds.minRow,
      col: placement.col - bounds.minCol,
      number: numbers.get(keyOf(placement.row, placement.col)) ?? 0,
    }))
    .sort((a, b) => a.number - b.number || a.direction.localeCompare(b.direction));

  const gridCells: CrosswordCell[] = [...cells.entries()]
    .map(([key, state]) => {
      const [row, col] = key.split(",").map(Number);
      return {
        row: row - bounds.minRow,
        col: col - bounds.minCol,
        letter: state.letter,
        number: numbers.get(key),
      };
    })
    .sort((a, b) => a.row - b.row || a.col - b.col);

  return {
    placements,
    grid: {
      rows: bounds.maxRow - bounds.minRow + 1,
      cols: bounds.maxCol - bounds.minCol + 1,
      cells: gridCells,
    },
  };
}

export function generateCrossword(
  entries: CrosswordInput[],
  options: GenerateCrosswordOptions = {},
): CrosswordResult {
  const minAnswerLength = options.minAnswerLength ?? 2;
  const maxAnswerLength = options.maxAnswerLength ?? 24;
  const maxAttempts = Math.max(1, options.maxAttempts ?? 160);
  const requireAll = options.requireAll ?? false;
  const seed = options.seed ?? Date.now();
  const { valid, invalid } = validateEntries(
    entries,
    minAnswerLength,
    maxAnswerLength,
  );

  let best: Attempt = {
    placements: [],
    cells: new Map(),
    intersections: 0,
    score: -Infinity,
  };

  for (let attemptIndex = 0; attemptIndex < maxAttempts; attemptIndex += 1) {
    const rng = createRng(seed + attemptIndex * 9973);
    const attempt = runAttempt(valid, rng);
    if (attempt.score > best.score) best = attempt;
    if (attempt.placements.length === valid.length) break;
  }

  const placedIds = new Set(best.placements.map((placement) => placement.id));
  const couldNotFit = valid
    .filter((entry) => !placedIds.has(entry.id))
    .map((entry) => ({ ...entry, reason: "could-not-fit" as const }));
  const unplaced = [...invalid, ...couldNotFit];
  const { placements, grid } = numberAndTrim(best.placements, best.cells);
  const occupiedCells = grid.cells.length;
  const gridArea = grid.rows * grid.cols;
  const success =
    placements.length >= 2 && (!requireAll || unplaced.length === 0);

  return {
    success,
    placements,
    unplaced,
    grid,
    across: placements.filter((item) => item.direction === "across"),
    down: placements.filter((item) => item.direction === "down"),
    stats: {
      inputCount: entries.length,
      placedCount: placements.length,
      unplacedCount: unplaced.length,
      intersections: best.intersections,
      density: gridArea === 0 ? 0 : occupiedCells / gridArea,
    },
  };
}
