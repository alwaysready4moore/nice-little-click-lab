import { NextResponse } from "next/server";
import {
  createCrosswordDocument,
  parseCrosswordPurchasePayload,
} from "../../../../lib/crossword/purchase";
import { readJsonBody, RequestBodyError } from "../../../../lib/http";
import { checkRateLimit } from "../../../../lib/rateLimit";
import { createCrosswordCheckout } from "../../../../lib/stripe";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 24_000;

export async function POST(request: Request) {
  const limit = checkRateLimit(request, {
    scope: "crossword-checkout",
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Give Click a few minutes to catch up." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  try {
    const body = await readJsonBody(request, MAX_BODY_BYTES);
    const payload = parseCrosswordPurchasePayload(body);
    if (!payload) {
      return NextResponse.json(
        { error: "Finish a valid crossword before checkout." },
        { status: 400 },
      );
    }

    // Rebuild on the server so Stripe never trusts a browser-supplied grid.
    if (!createCrosswordDocument(payload)) {
      return NextResponse.json(
        { error: "Click could not fit every answer. Adjust one or two entries and try again." },
        { status: 400 },
      );
    }

    return NextResponse.json(await createCrosswordCheckout(payload));
  } catch (error) {
    console.error("Crossword checkout error", error);
    if (error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: "Checkout could not start. Please try again." },
      { status: 500 },
    );
  }
}
