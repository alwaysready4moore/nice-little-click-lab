import { NextResponse } from "next/server";
import { checkRateLimit } from "../../../../lib/rateLimit";
import { retrieveCheckoutSession } from "../../../../lib/stripe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const limit = checkRateLimit(request, {
    scope: "crossword-verify",
    limit: 30,
    windowMs: 10 * 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { paid: false, error: "Too many receipt checks. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json(
      { paid: false, error: "Missing checkout session." },
      { status: 400 },
    );
  }

  try {
    const session = await retrieveCheckoutSession(sessionId);
    const paid =
      (session.payment_status === "paid" || session.payment_status === "no_payment_required") &&
      session.metadata?.product === "custom_crossword";
    return NextResponse.json({
      paid,
      puzzleHash: paid ? session.metadata?.puzzle_hash ?? null : null,
    });
  } catch (error) {
    console.error("Crossword verification error", error);
    return NextResponse.json(
      { paid: false, error: "Payment could not be verified." },
      { status: 400 },
    );
  }
}
