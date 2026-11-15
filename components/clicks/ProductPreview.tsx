import { generateCrossword } from "@/lib/crossword/generateCrossword";
import { generateWordSearch } from "@/lib/wordsearch/generateWordSearch";
import { createProject, seatPositions } from "@/lib/seating";
import styles from "./product-preview.module.css";

const words = ["PEACHES", "BALTIMORE", "BEES", "BOOKSHOP", "JOSIE", "HONEY", "SUNDAY", "MUSEUM", "GARDEN", "PICNIC"];
// Fixed examples use the same layout engines as the tools, without client JavaScript.
const crossword = generateCrossword(words.slice(0, 8).map((answer, index) => ({
  id: String(index), answer, clue: `Memory ${index + 1}`,
})), { seed: 42, maxAttempts: 20 });
const wordSearch = generateWordSearch(words.map((word, index) => ({ id: String(index), word })), "easy", 42);
const room = createProject("wedding");

export function ProductPreview({ slug }: { slug: string }) {
  if (!["custom-crossword", "custom-word-search", "take-your-seat"].includes(slug)) return null;
  const seating = slug === "take-your-seat";
  const search = slug === "custom-word-search";
  return (
    <figure className={styles.preview}>
      <figcaption className={styles.caption}>
        <span>{seating ? "Everyone has a place" : "A little puzzle about us"}</span>
        <span className={styles.sample}>Sample {seating ? "layout" : "puzzle"}</span>
      </figcaption>
      {seating ? (
        <svg viewBox="0 0 1200 800" className={styles.room} role="img" aria-label="Example wedding room with six round tables and eight seats at each table">
          {room.furniture.map((table, index) => (
            <g key={table.id}>
              {seatPositions(table).map((seat, i) => <rect key={i} x={seat.x - seat.width / 2} y={seat.y - seat.height / 2} width={seat.width} height={seat.height} rx="10" fill="#fffaf2" stroke="#315f5b" strokeWidth="3" />)}
              <ellipse cx={table.x} cy={table.y} rx="59" ry="48" fill={index % 2 ? "#d6e8d9" : "#f6d3c8"} stroke="#39352f" strokeWidth="4" />
              <text x={table.x} y={table.y + 5} textAnchor="middle" fontSize="22" fill="#222">{index + 1}</text>
            </g>
          ))}
        </svg>
      ) : search ? (
        <svg viewBox={`0 0 ${wordSearch.size * 20} ${wordSearch.size * 20}`} className={styles.puzzle} role="img" aria-label="Example word search generated with names, places, and shared memories">
          {wordSearch.grid.flatMap((row, r) => row.map((letter, c) => <text key={`${r}-${c}`} x={c * 20 + 10} y={r * 20 + 14} textAnchor="middle" fontSize="12" fill="#315f5b" fontFamily="monospace">{letter}</text>))}
        </svg>
      ) : (
        <svg viewBox={`-1 -1 ${crossword.grid.cols * 20 + 2} ${crossword.grid.rows * 20 + 2}`} className={styles.puzzle} role="img" aria-label="Example connected crossword grid generated from eight shared memories">
          {crossword.grid.cells.map(cell => <g key={`${cell.row}-${cell.col}`}>
            <rect x={cell.col * 20} y={cell.row * 20} width="20" height="20" fill="#fff" stroke="#7c746b" strokeWidth="0.8" />
            {cell.number && <text x={cell.col * 20 + 2} y={cell.row * 20 + 6} fontSize="5" fill="#222">{cell.number}</text>}
          </g>)}
        </svg>
      )}
      {!seating && <p className={styles.words}>{search ? "PEACHES · BOOKSHOP · SUNDAY" : "Names, places, and the stories behind them."}</p>}
    </figure>
  );
}
