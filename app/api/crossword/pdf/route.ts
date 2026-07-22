import { NextResponse } from "next/server";
import { createCrosswordPdf } from "../../../../lib/crossword/createCrosswordPdf";
import { isCrosswordPurchasePayload } from "../../../../lib/crossword/purchase";
import {
  getOrAssignCrosswordNumber,
  puzzleHash,
  retrieveCheckoutSession,
} from "../../../../lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") throw new Error("Missing download details.");
    const { sessionId, payload } = body as { sessionId?: unknown; payload?: unknown };
    if (typeof sessionId !== "string" || !isCrosswordPurchasePayload(payload)) {
      return NextResponse.json({ error: "This download request is incomplete." }, { status: 400 });
    }

    const session = await retrieveCheckoutSession(sessionId);
    const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
    if (!paid || session.metadata?.puzzle_hash !== puzzleHash(payload)) {
      return NextResponse.json({ error: "This purchase does not match this crossword." }, { status: 403 });
    }

    const puzzleNumber = await getOrAssignCrosswordNumber(session);
    const pdf = await createCrosswordPdf(payload, puzzleNumber);
    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="custom-crossword-gift.pdf"',
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Crossword PDF error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The PDF could not be assembled." },
      { status: 500 },
    );
  }
}
