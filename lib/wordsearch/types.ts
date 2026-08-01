export type WordSearchDifficulty = "easy" | "medium" | "hard";
export type WordSearchTheme = "classic" | "celebration" | "kids";

export type WordSearchInput = {
  id: string;
  word: string;
};

export type WordSearchPlacement = {
  id: string;
  word: string;
  normalized: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  deltaRow: number;
  deltaCol: number;
};

export type WordSearchResult = {
  size: number;
  grid: string[][];
  placements: WordSearchPlacement[];
  words: string[];
};
