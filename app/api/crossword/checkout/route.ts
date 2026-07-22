import { NextResponse } from "next/server";
import { isCrosswordPurchasePayload } from "../../../../lib/crossword/purchase";
import { createCrosswordCheckout } from "../../../../lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload: unknown = await request.json();
    if (!isCrosswordPurchasePayload(payload)) {
      return NextResponse.json({ error: "Finish a valid crossword before checkout." }, { status: 400 });
    }
    if (JSON.stringify(payload).length > 60_000) {
      return NextResponse.json({ error: "This puzzle is too large to check out." }, { status: 413 });
    }
    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
    return NextResponse.json(await createCrosswordCheckout(payload, origin));
  } catch (error) {
    console.error("Crossword checkout error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout could not start." },
      { status: 500 },
    );
  }
}
