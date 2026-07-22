import { NextResponse } from "next/server";
import { retrieveCheckoutSession } from "../../../../lib/stripe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ paid: false, error: "Missing checkout session." }, { status: 400 });

  try {
    const session = await retrieveCheckoutSession(sessionId);
    const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
    return NextResponse.json({
      paid,
      puzzleHash: paid ? session.metadata?.puzzle_hash ?? null : null,
    });
  } catch (error) {
    return NextResponse.json(
      { paid: false, error: error instanceof Error ? error.message : "Payment could not be verified." },
      { status: 400 },
    );
  }
}
