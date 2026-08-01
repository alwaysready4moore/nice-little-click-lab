import type { WordSearchDifficulty, WordSearchInput, WordSearchPlacement, WordSearchResult } from "./types";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIRECTIONS: Record<WordSearchDifficulty, Array<[number, number]>> = {
  easy: [[0, 1], [1, 0], [1, 1]],
  medium: [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0]],
  hard: [[0, 1], [1, 0], [1, 1], [1, -1], [0, -1], [-1, 0], [-1, -1], [-1, 1]],
};

export function normalizeWord(value: string) {
  return value.toUpperCase().replace(/[^A-Z]/g, "");
}

function mulberry32(seed: number) {
  return function random() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function gridSize(difficulty: WordSearchDifficulty, longest: number, wordCount: number) {
  const base = difficulty === "easy" ? 15 : difficulty === "medium" ? 18 : 22;
  const densityAllowance = Math.max(0, Math.ceil((wordCount - 10) / 5));
  return Math.max(base + densityAllowance, longest + 2);
}

function canPlace(grid: string[][], word: string, row: number, col: number, dr: number, dc: number) {
  const endRow = row + dr * (word.length - 1);
  const endCol = col + dc * (word.length - 1);
  if (endRow < 0 || endRow >= grid.length || endCol < 0 || endCol >= grid.length) return false;
  for (let index = 0; index < word.length; index += 1) {
    const current = grid[row + dr * index][col + dc * index];
    if (current && current !== word[index]) return false;
  }
  return true;
}

export function wordSearchSeed(inputs: WordSearchInput[], difficulty: WordSearchDifficulty) {
  const source = `${difficulty}|${inputs.map((item) => normalizeWord(item.word)).join("|")}`;
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function generateWordSearch(inputs: WordSearchInput[], difficulty: WordSearchDifficulty, seed = wordSearchSeed(inputs, difficulty)): WordSearchResult {
  const normalized = inputs
    .map((item) => ({ ...item, normalized: normalizeWord(item.word) }))
    .filter((item) => item.normalized.length >= 2)
    .sort((a, b) => b.normalized.length - a.normalized.length);

  const size = gridSize(difficulty, normalized[0]?.normalized.length ?? 0, normalized.length);
  const random = mulberry32(seed);
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => ""));
  const placements: WordSearchPlacement[] = [];

  for (const item of normalized) {
    const candidates: Array<{ row: number; col: number; dr: number; dc: number; overlap: number }> = [];
    for (const [dr, dc] of DIRECTIONS[difficulty]) {
      for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
          if (!canPlace(grid, item.normalized, row, col, dr, dc)) continue;
          let overlap = 0;
          for (let index = 0; index < item.normalized.length; index += 1) {
            if (grid[row + dr * index][col + dc * index] === item.normalized[index]) overlap += 1;
          }
          candidates.push({ row, col, dr, dc, overlap });
        }
      }
    }
    if (candidates.length === 0) throw new Error(`Could not place ${item.word}.`);
    const bestOverlap = Math.max(...candidates.map((candidate) => candidate.overlap));
    const shortlist = candidates.filter((candidate) => candidate.overlap >= Math.max(0, bestOverlap - 1));
    const choice = shortlist[Math.floor(random() * shortlist.length)];
    for (let index = 0; index < item.normalized.length; index += 1) {
      grid[choice.row + choice.dr * index][choice.col + choice.dc * index] = item.normalized[index];
    }
    placements.push({
      id: item.id,
      word: item.word.trim(),
      normalized: item.normalized,
      startRow: choice.row,
      startCol: choice.col,
      endRow: choice.row + choice.dr * (item.normalized.length - 1),
      endCol: choice.col + choice.dc * (item.normalized.length - 1),
      deltaRow: choice.dr,
      deltaCol: choice.dc,
    });
  }

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!grid[row][col]) grid[row][col] = ALPHABET[Math.floor(random() * ALPHABET.length)];
    }
  }

  return { size, grid, placements, words: placements.map((item) => item.word).sort((a, b) => a.localeCompare(b)) };
}
