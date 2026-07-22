import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFImage, type PDFPage, type PDFFont } from "pdf-lib";
import type { CrosswordPlacement, CrosswordResult } from "./types";
import type { CrosswordPurchasePayload } from "./purchase";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const SIDE_MARGIN = 48;
const SAFE_WIDTH = PAGE_WIDTH - SIDE_MARGIN * 2;
const INK = rgb(0.16, 0.14, 0.12);
const MUTED_INK = rgb(0.42, 0.38, 0.34);
const ACCENT = rgb(0.55, 0.28, 0.11);
const PAPER = rgb(0.995, 0.985, 0.955);
const BLOCK = rgb(0.18, 0.16, 0.14);
const HAIRLINE = rgb(0.82, 0.75, 0.63);

async function requiredFont(doc: PDFDocument, filename: string) {
  try {
    const bytes = await readFile(path.join(process.cwd(), "public", "fonts", filename));
    return await doc.embedFont(bytes, { subset: false });
  } catch {
    throw new Error(`The PDF needs public/fonts/${filename}.`);
  }
}

async function optionalClickImage(doc: PDFDocument): Promise<PDFImage | null> {
  try {
    const bytes = await readFile(
      path.join(process.cwd(), "public", "images", "click", "click-awake-receipt.png"),
    );
    return await doc.embedPng(bytes);
  } catch {
    return null;
  }
}

function wrapText(font: PDFFont, text: string, size: number, maxWidth: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxWidth || !current) current = test;
    else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawCentered(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color = INK,
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: Math.max(SIDE_MARGIN, (PAGE_WIDTH - width) / 2),
    y,
    font,
    size,
    color,
  });
}

function drawPageFrame(page: PDFPage) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: PAPER });
  page.drawRectangle({
    x: 22,
    y: 22,
    width: PAGE_WIDTH - 44,
    height: PAGE_HEIGHT - 44,
    borderColor: HAIRLINE,
    borderWidth: 0.65,
  });
}

function drawHeader(
  page: PDFPage,
  payload: CrosswordPurchasePayload,
  mailman: PDFFont,
  mimosa: PDFFont,
  pageLabel: string,
) {
  drawCentered(page, pageLabel.toUpperCase(), 744, mimosa, 10.5, ACCENT);

  const ruleWidth = 52;
  page.drawLine({
    start: { x: (PAGE_WIDTH - ruleWidth) / 2, y: 731 },
    end: { x: (PAGE_WIDTH + ruleWidth) / 2, y: 731 },
    thickness: 0.65,
    color: HAIRLINE,
  });

  const title = payload.title.trim() || "Our Story, One Clue at a Time";
  let size = 28;
  let lines = wrapText(mailman, title, size, SAFE_WIDTH - 40);
  while (lines.length > 2 && size > 21) {
    size -= 1;
    lines = wrapText(mailman, title, size, SAFE_WIDTH - 40);
  }

  const visibleLines = lines.slice(0, 2);
  visibleLines.forEach((line, index) =>
    drawCentered(page, line, 696 - index * 33, mailman, size),
  );

  const titleBottom = 696 - Math.max(1, visibleLines.length) * 33;
  if (payload.dedication.trim()) {
    wrapText(mimosa, payload.dedication.trim(), 13, SAFE_WIDTH - 52)
      .slice(0, 2)
      .forEach((line, index) =>
        drawCentered(page, line, titleBottom + 7 - index * 17, mimosa, 13, MUTED_INK),
      );
  }
}

function drawGrid(
  page: PDFPage,
  result: CrosswordResult,
  options: { yTop: number; maxHeight: number; maxWidth?: number; answers: boolean; font: PDFFont },
) {
  const maxWidth = options.maxWidth ?? SAFE_WIDTH;
  const maxCellByWidth = maxWidth / result.grid.cols;
  const maxCellByHeight = options.maxHeight / result.grid.rows;
  const cell = Math.max(8.5, Math.min(maxCellByWidth, maxCellByHeight, 27));
  const width = cell * result.grid.cols;
  const height = cell * result.grid.rows;
  const x = (PAGE_WIDTH - width) / 2;
  const yBottom = options.yTop - height;
  const map = new Map(result.grid.cells.map((item) => [`${item.row},${item.col}`, item]));

  page.drawRectangle({ x, y: yBottom, width, height, color: BLOCK });
  for (let row = 0; row < result.grid.rows; row += 1) {
    for (let col = 0; col < result.grid.cols; col += 1) {
      const item = map.get(`${row},${col}`);
      if (!item) continue;
      const cellX = x + col * cell;
      const cellY = options.yTop - (row + 1) * cell;
      page.drawRectangle({
        x: cellX,
        y: cellY,
        width: cell,
        height: cell,
        color: PAPER,
        borderColor: BLOCK,
        borderWidth: Math.max(0.55, cell * 0.032),
      });
      if (item.number) {
        page.drawText(String(item.number), {
          x: cellX + 1.8,
          y: cellY + cell - Math.max(6.3, cell * 0.24),
          font: options.font,
          size: Math.max(4.6, cell * 0.17),
          color: INK,
        });
      }
      if (options.answers) {
        const size = Math.max(7, cell * 0.4);
        const letterWidth = options.font.widthOfTextAtSize(item.letter, size);
        page.drawText(item.letter, {
          x: cellX + (cell - letterWidth) / 2,
          y: cellY + (cell - size) / 2 + 1,
          font: options.font,
          size,
          color: INK,
        });
      }
    }
  }
  return yBottom;
}

function clueColumnHeight(
  placements: CrosswordPlacement[],
  width: number,
  mimosa: PDFFont,
  size: number,
  lineHeight: number,
) {
  return placements.reduce((height, placement) => {
    const prefix = `${placement.number}. `;
    const prefixWidth = mimosa.widthOfTextAtSize(prefix, size);
    const lines = wrapText(mimosa, placement.clue, size, width - prefixWidth);
    return height + Math.max(1, lines.length) * lineHeight + 6;
  }, 25);
}

function drawClueColumn(
  page: PDFPage,
  heading: string,
  placements: CrosswordPlacement[],
  x: number,
  y: number,
  width: number,
  mimosa: PDFFont,
  availableHeight: number,
) {
  let size = 11.5;
  let lineHeight = 14.5;
  while (
    clueColumnHeight(placements, width, mimosa, size, lineHeight) > availableHeight &&
    size > 9.5
  ) {
    size -= 0.5;
    lineHeight -= 0.55;
  }

  page.drawText(heading.toUpperCase(), { x, y, font: mimosa, size: 15.5, color: ACCENT });
  page.drawLine({
    start: { x, y: y - 7 },
    end: { x: x + Math.min(width, 72), y: y - 7 },
    thickness: 0.65,
    color: HAIRLINE,
  });

  let cursor = y - 27;
  for (const placement of placements) {
    const prefix = `${placement.number}. `;
    const prefixWidth = mimosa.widthOfTextAtSize(prefix, size);
    const lines = wrapText(mimosa, placement.clue, size, width - prefixWidth);
    page.drawText(prefix, { x, y: cursor, font: mimosa, size, color: ACCENT });
    lines.forEach((line, index) => {
      page.drawText(line, {
        x: x + prefixWidth,
        y: cursor - index * lineHeight,
        font: mimosa,
        size,
        color: INK,
      });
    });
    cursor -= Math.max(1, lines.length) * lineHeight + 6;
  }
}

function drawFooter(
  page: PDFPage,
  puzzleNumber: number,
  mimosa: PDFFont,
) {
  page.drawText(`Puzzle No. ${String(puzzleNumber).padStart(6, "0")}`, {
    x: SIDE_MARGIN,
    y: 39,
    font: mimosa,
    size: 8.5,
    color: ACCENT,
  });

  const signature = "Assembled with care by Click.";
  const signatureWidth = mimosa.widthOfTextAtSize(signature, 8.5);
  page.drawText(signature, {
    x: PAGE_WIDTH - SIDE_MARGIN - signatureWidth,
    y: 39,
    font: mimosa,
    size: 8.5,
    color: ACCENT,
  });
}

function drawClick(page: PDFPage, image: PDFImage | null) {
  if (!image) return;
  const maxWidth = 102;
  const maxHeight = 82;
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  page.drawImage(image, {
    x: PAGE_WIDTH - SIDE_MARGIN - width,
    y: 57,
    width,
    height,
    opacity: 0.97,
  });
}

function drawAnswerNote(page: PDFPage, mimosa: PDFFont, hasClick: boolean) {
  const note = "Psst... hide this page until they're done.";
  const maxWidth = hasClick ? 315 : SAFE_WIDTH;
  const lines = wrapText(mimosa, note, 13, maxWidth);
  const x = hasClick ? SIDE_MARGIN + 12 : SIDE_MARGIN;
  lines.forEach((line, index) => {
    page.drawText(line, {
      x,
      y: 94 - index * 17,
      font: mimosa,
      size: 13,
      color: MUTED_INK,
    });
  });
}

export async function createCrosswordPdf(
  payload: CrosswordPurchasePayload,
  puzzleNumber: number,
) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(payload.title || "Our Story, One Clue at a Time");
  doc.setAuthor("Nice Little Click Lab");
  doc.setCreator("Nice Little Click Lab");

  // These are intentionally the only two fonts embedded in the exported PDF.
  const mailman = await requiredFont(doc, "MailmanRegular.otf");
  const mimosa = await requiredFont(doc, "Mimosa.otf");
  const click = payload.includeClickOnAnswerKey ? await optionalClickImage(doc) : null;

  const puzzlePage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawPageFrame(puzzlePage);
  drawHeader(puzzlePage, payload, mailman, mimosa, "A little puzzle for...");
  const gridBottom = drawGrid(puzzlePage, payload.result, {
    yTop: 618,
    maxHeight: 326,
    maxWidth: SAFE_WIDTH - 6,
    answers: false,
    font: mimosa,
  });
  const clueTop = Math.min(gridBottom - 25, 273);
  const clueBottom = 62;
  const clueHeight = clueTop - clueBottom;
  const columnGap = 34;
  const columnWidth = (SAFE_WIDTH - columnGap) / 2;
  drawClueColumn(
    puzzlePage,
    "Across",
    payload.result.across,
    SIDE_MARGIN,
    clueTop,
    columnWidth,
    mimosa,
    clueHeight,
  );
  drawClueColumn(
    puzzlePage,
    "Down",
    payload.result.down,
    SIDE_MARGIN + columnWidth + columnGap,
    clueTop,
    columnWidth,
    mimosa,
    clueHeight,
  );
  drawFooter(puzzlePage, puzzleNumber, mimosa);

  const answerPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  drawPageFrame(answerPage);
  drawHeader(answerPage, payload, mailman, mimosa, "Answer key");
  drawGrid(answerPage, payload.result, {
    yTop: 618,
    maxHeight: payload.includeClickOnAnswerKey ? 430 : 486,
    maxWidth: SAFE_WIDTH - 6,
    answers: true,
    font: mimosa,
  });
  drawAnswerNote(answerPage, mimosa, Boolean(click));
  drawClick(answerPage, click);
  drawFooter(answerPage, puzzleNumber, mimosa);

  return doc.save();
}
