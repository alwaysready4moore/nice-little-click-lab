import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import {
  PDFDocument,
  rgb,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "pdf-lib";
import type { WordSearchDocumentPayload } from "./purchase";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const TITLE_RASTER_SCALE = 4;
const INK = rgb(0.17, 0.15, 0.13);
const MUTED = rgb(0.42, 0.37, 0.32);
const ACCENT = rgb(0.58, 0.34, 0.18);
const PAPER = rgb(1, 0.99, 0.96);
const HIGHLIGHT = rgb(0.96, 0.79, 0.48);

function safeTitle(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, 60);
}

async function requiredFont(document: PDFDocument, filename: string) {
  try {
    const bytes = await readFile(path.join(process.cwd(), "public", "fonts", filename));
    return await document.embedFont(bytes, { subset: false });
  } catch {
    throw new Error(`The PDF needs public/fonts/${filename}.`);
  }
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
    x: Math.max(42, (PAGE_WIDTH - width) / 2),
    y,
    size,
    font,
    color,
  });
}

function drawTitle(
  page: PDFPage,
  titleImage: PDFImage | null,
  title: string,
  fallbackFont: PDFFont,
) {
  if (!titleImage) {
    let size = 27;
    while (fallbackFont.widthOfTextAtSize(title, size) > PAGE_WIDTH - 84 && size > 19) {
      size -= 1;
    }
    drawCentered(page, title, 730, fallbackFont, size);
    return;
  }

  const naturalWidth = titleImage.width / TITLE_RASTER_SCALE;
  const naturalHeight = titleImage.height / TITLE_RASTER_SCALE;
  const maxWidth = PAGE_WIDTH - 84;
  const maxHeight = 46;
  const fit = Math.min(1, maxWidth / naturalWidth, maxHeight / naturalHeight);
  const width = naturalWidth * fit;
  const height = naturalHeight * fit;

  page.drawImage(titleImage, {
    x: (PAGE_WIDTH - width) / 2,
    y: 756 - height,
    width,
    height,
  });
}

export async function createWordSearchPdf(
  document: WordSearchDocumentPayload,
  reference: string,
  titlePngBytes?: Uint8Array,
) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(document.title || "Custom Word Search Gift");
  pdf.setAuthor("Nice Little Click Lab");
  pdf.setCreator("Nice Little Click Lab");

  const mimosa = await requiredFont(pdf, "Mimosa.otf");
  const titleImage = titlePngBytes ? await pdf.embedPng(titlePngBytes) : null;

  function drawPage(answerKey: boolean) {
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      color: PAPER,
    });

    const title = safeTitle(document.title) || "A Little Word Search About Us";
    drawTitle(page, titleImage, title, mimosa);

    page.drawText(answerKey ? "ANSWER KEY" : "CUSTOM WORD SEARCH", {
      x: 42,
      y: 704,
      size: 12,
      font: mimosa,
      color: ACCENT,
    });

    if (document.dedication) {
      const line = safeTitle(document.dedication).slice(0, 90);
      drawCentered(page, line, 681, mimosa, 13, MUTED);
    }

    const size = document.result.size;
    const maxGrid = 420;
    const cell = Math.min(maxGrid / size, 24);
    const gridWidth = cell * size;
    const startX = (PAGE_WIDTH - gridWidth) / 2;
    const startY = 650;
    const highlighted = new Set<string>();

    if (answerKey) {
      for (const placement of document.result.placements) {
        for (let index = 0; index < placement.normalized.length; index += 1) {
          highlighted.add(
            `${placement.startRow + placement.deltaRow * index},${placement.startCol + placement.deltaCol * index}`,
          );
        }
      }
    }

    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const x = startX + col * cell;
        const y = startY - (row + 1) * cell;

        if (answerKey && highlighted.has(`${row},${col}`)) {
          page.drawRectangle({
            x,
            y,
            width: cell,
            height: cell,
            color: HIGHLIGHT,
            opacity: 0.6,
          });
        }

        page.drawRectangle({
          x,
          y,
          width: cell,
          height: cell,
          borderColor: rgb(0.78, 0.74, 0.69),
          borderWidth: 0.5,
        });

        const letter = document.result.grid[row][col];
        const fontSize = Math.max(8, cell * 0.5);
        const width = mimosa.widthOfTextAtSize(letter, fontSize);
        page.drawText(letter, {
          x: x + (cell - width) / 2,
          y: y + (cell - fontSize) / 2 + 2,
          size: fontSize,
          font: mimosa,
          color: INK,
        });
      }
    }

    const listTop = startY - gridWidth - 28;
    page.drawText(answerKey ? "Hidden words" : "Find these words", {
      x: 54,
      y: listTop,
      size: 16,
      font: mimosa,
      color: INK,
    });

    const columns = 3;
    const colWidth = (PAGE_WIDTH - 108) / columns;
    document.result.words.forEach((word, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      page.drawText(word.toUpperCase(), {
        x: 54 + col * colWidth,
        y: listTop - 23 - row * 19,
        size: 11.5,
        font: mimosa,
        color: MUTED,
      });
    });

    page.drawText(`Nice Little Click Lab · Click No. 004 · Ref ${reference}`, {
      x: 42,
      y: 28,
      size: 9.5,
      font: mimosa,
      color: MUTED,
    });

    if (answerKey && document.includeClickOnAnswerKey) {
      const note = "Click checked every hiding place.";
      const noteWidth = mimosa.widthOfTextAtSize(note, 9.5);
      page.drawText(note, {
        x: PAGE_WIDTH - 42 - noteWidth,
        y: 28,
        size: 9.5,
        font: mimosa,
        color: ACCENT,
      });
    }
  }

  drawPage(false);
  drawPage(true);
  return pdf.save();
}
