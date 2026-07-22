import { createHash } from "node:crypto";
import type { CrosswordPurchasePayload } from "./crossword/purchase";

const STRIPE_API = "https://api.stripe.com/v1";

export function puzzleHash(payload: CrosswordPurchasePayload) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function stripeKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return key;
}

export async function createCrosswordCheckout(payload: CrosswordPurchasePayload, origin: string) {
  const hash = puzzleHash(payload);
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("success_url", `${origin}/clicks/custom-crossword/success?session_id={CHECKOUT_SESSION_ID}`);
  body.set("cancel_url", `${origin}/clicks/custom-crossword?checkout=cancelled`);
  body.set("line_items[0][price_data][currency]", "usd");
  body.set("line_items[0][price_data][unit_amount]", "400");
  body.set("line_items[0][price_data][product_data][name]", "Instant Custom Crossword Gift");
  body.set("line_items[0][price_data][product_data][description]", "Printable crossword PDF with answer key");
  body.set("line_items[0][quantity]", "1");
  body.set("metadata[puzzle_hash]", hash);
  body.set("metadata[product]", "custom_crossword");
  body.set("payment_intent_data[metadata][puzzle_hash]", hash);
  body.set("payment_intent_data[metadata][product]", "custom_crossword");

  const response = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const data = (await response.json()) as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !data.id || !data.url) {
    throw new Error(data.error?.message || "Stripe could not create the checkout session.");
  }
  return { id: data.id, url: data.url, puzzleHash: hash };
}

export async function retrieveCheckoutSession(sessionId: string) {
  if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) {
    throw new Error("Invalid checkout session.");
  }
  const response = await fetch(`${STRIPE_API}/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${stripeKey()}` },
    cache: "no-store",
  });
  const data = (await response.json()) as {
    id?: string;
    created?: number;
    payment_status?: string;
    status?: string;
    metadata?: Record<string, string>;
    error?: { message?: string };
  };
  if (!response.ok || !data.id) throw new Error(data.error?.message || "Could not verify payment.");
  return data;
}


type StripeCheckoutSession = Awaited<ReturnType<typeof retrieveCheckoutSession>>;

async function listNumberedCrosswordSessions() {
  const sessions: Array<{ metadata?: Record<string, string> }> = [];
  let startingAfter: string | undefined;

  do {
    const params = new URLSearchParams({ limit: "100" });
    if (startingAfter) params.set("starting_after", startingAfter);

    const response = await fetch(`${STRIPE_API}/checkout/sessions?${params.toString()}`, {
      headers: { Authorization: `Bearer ${stripeKey()}` },
      cache: "no-store",
    });
    const data = (await response.json()) as {
      data?: Array<{ id: string; metadata?: Record<string, string> }>;
      has_more?: boolean;
      error?: { message?: string };
    };

    if (!response.ok || !data.data) {
      throw new Error(data.error?.message || "Could not read the crossword sequence.");
    }

    sessions.push(...data.data);
    startingAfter = data.has_more ? data.data.at(-1)?.id : undefined;
  } while (startingAfter);

  return sessions;
}

export async function getOrAssignCrosswordNumber(session: StripeCheckoutSession) {
  const existing = Number.parseInt(session.metadata?.crossword_number ?? "", 10);
  if (Number.isSafeInteger(existing) && existing > 0) return existing;

  const sessions = await listNumberedCrosswordSessions();
  const highest = sessions.reduce((max, item) => {
    const value = Number.parseInt(item.metadata?.crossword_number ?? "", 10);
    return Number.isSafeInteger(value) && value > max ? value : max;
  }, 0);
  const next = highest + 1;

  const body = new URLSearchParams();
  body.set("metadata[crossword_number]", String(next));
  body.set("metadata[product]", "custom_crossword");

  const response = await fetch(`${STRIPE_API}/checkout/sessions/${encodeURIComponent(session.id!)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const data = (await response.json()) as { id?: string; error?: { message?: string } };
  if (!response.ok || !data.id) {
    throw new Error(data.error?.message || "Could not reserve a crossword number.");
  }

  return next;
}
