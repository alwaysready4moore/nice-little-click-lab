import { NextResponse } from "next/server";
import { createWordSearchDocument, parseWordSearchPurchasePayload } from "../../../../lib/wordsearch/purchase";
import { readJsonBody, RequestBodyError } from "../../../../lib/http";
import { checkRateLimit } from "../../../../lib/rateLimit";
import { createWordSearchCheckout } from "../../../../lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limit = checkRateLimit(request, { scope: "wordsearch-checkout", limit: 10, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) return NextResponse.json({ error: "Too many checkout attempts. Give Click a few minutes." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  try {
    const payload = parseWordSearchPurchasePayload(await readJsonBody(request, 20_000));
    if (!payload || !createWordSearchDocument(payload)) return NextResponse.json({ error: "Finish a valid word search before checkout." }, { status: 400 });
    return NextResponse.json(await createWordSearchCheckout(payload));
  } catch (error) {
    if (error instanceof RequestBodyError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Word search checkout error", error);
    return NextResponse.json({ error: "Checkout could not start. Please try again." }, { status: 500 });
  }
}
