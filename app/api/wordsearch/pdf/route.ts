import { NextResponse } from "next/server";
import { createWordSearchPdf } from "../../../../lib/wordsearch/createWordSearchPdf";
import {
  createWordSearchDocument,
  parseWordSearchPurchasePayload,
} from "../../../../lib/wordsearch/purchase";
import { readJsonBody, RequestBodyError } from "../../../../lib/http";
import { checkRateLimit } from "../../../../lib/rateLimit";
import {
  crosswordReference,
  puzzleHash,
  retrieveCheckoutSession,
} from "../../../../lib/stripe";

export const runtime = "nodejs";

function parseTitlePng(value: unknown): Uint8Array | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new RequestBodyError("The title image is invalid.", 400);
  }

  const match = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(value);
  if (!match) {
    throw new RequestBodyError("The title image is invalid.", 400);
  }

  const bytes = Buffer.from(match[1], "base64");
  if (bytes.byteLength === 0 || bytes.byteLength > 500_000) {
    throw new RequestBodyError("The title image is too large.", 413);
  }

  const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (pngSignature.some((byte, index) => bytes[index] !== byte)) {
    throw new RequestBodyError("The title image is invalid.", 400);
  }

  return bytes;
}

export async function POST(request: Request) {
  const limit = checkRateLimit(request, {
    scope: "wordsearch-pdf",
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many download attempts." }, { status: 429 });
  }

  try {
    const body = (await readJsonBody(request, 750_000)) as {
      sessionId?: unknown;
      payload?: unknown;
      titleImageDataUrl?: unknown;
    };
    const payload = parseWordSearchPurchasePayload(body?.payload);

    if (typeof body?.sessionId !== "string" || !payload) {
      return NextResponse.json(
        { error: "This download request is incomplete." },
        { status: 400 },
      );
    }

    const session = await retrieveCheckoutSession(body.sessionId);
    const paid =
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required";

    if (
      !paid ||
      session.metadata?.product !== "custom_word_search" ||
      session.metadata?.puzzle_hash !== puzzleHash(payload)
    ) {
      return NextResponse.json(
        { error: "This purchase does not match this word search." },
        { status: 403 },
      );
    }

    const document = createWordSearchDocument(payload);
    if (!document) {
      return NextResponse.json(
        { error: "This word search could not be rebuilt safely." },
        { status: 400 },
      );
    }

    const titlePngBytes = parseTitlePng(body.titleImageDataUrl);
    const pdf = await createWordSearchPdf(
      document,
      crosswordReference(session.id ?? body.sessionId),
      titlePngBytes,
    );

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="custom-word-search-gift.pdf"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Word search PDF error", error);
    return NextResponse.json(
      { error: "The PDF could not be assembled. Please try again." },
      { status: 500 },
    );
  }
}
