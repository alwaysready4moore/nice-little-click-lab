import { NextResponse } from "next/server";
import { createCrosswordPdf } from "../../../../lib/crossword/createCrosswordPdf";
import {
  createCrosswordDocument,
  parseCrosswordPurchasePayload,
} from "../../../../lib/crossword/purchase";
import { readJsonBody, RequestBodyError } from "../../../../lib/http";
import { checkRateLimit } from "../../../../lib/rateLimit";
import {
  crosswordReference,
  puzzleHash,
  retrieveCheckoutSession,
} from "../../../../lib/stripe";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 26_000;

export async function POST(request: Request) {
  const limit = checkRateLimit(request, {
    scope: "crossword-pdf",
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many download attempts. Please try again in a few minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  try {
    const body = await readJsonBody(request, MAX_BODY_BYTES);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "This download request is incomplete." }, { status: 400 });
    }

    const { sessionId, payload: rawPayload } = body as {
      sessionId?: unknown;
      payload?: unknown;
    };
    const payload = parseCrosswordPurchasePayload(rawPayload);

    if (typeof sessionId !== "string" || !payload) {
      return NextResponse.json({ error: "This download request is incomplete." }, { status: 400 });
    }

    const session = await retrieveCheckoutSession(sessionId);
    const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
    const isCrossword = session.metadata?.product === "custom_crossword";
    if (!paid || !isCrossword || session.metadata?.puzzle_hash !== puzzleHash(payload)) {
      return NextResponse.json({ error: "This purchase does not match this crossword." }, { status: 403 });
    }

    const document = createCrosswordDocument(payload);
    if (!document) {
      return NextResponse.json(
        { error: "This crossword could not be rebuilt safely." },
        { status: 400 },
      );
    }

    const reference = crosswordReference(session.id ?? sessionId);
    const pdf = await createCrosswordPdf(document, reference);
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="custom-crossword-gift.pdf"',
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Crossword PDF error", error);
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "The PDF could not be assembled. Please try again." },
      { status: 500 },
    );
  }
}
