import { createHash } from "node:crypto";
import type { CrosswordPurchasePayload } from "./crossword/purchase";
import type { WordSearchPurchasePayload } from "./wordsearch/purchase";

const STRIPE_API = "https://api.stripe.com/v1";

export function puzzleHash(payload: CrosswordPurchasePayload | WordSearchPurchasePayload) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export function crosswordReference(sessionId: string) {
  return createHash("sha256").update(sessionId).digest("hex").slice(0, 8).toUpperCase();
}

function stripeKey() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured.");
  return key;
}

function siteOrigin() {
  const configured = process.env.SITE_URL;

  if (!configured) {
    if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
    throw new Error("The production site URL is not configured.");
  }

  const url = new URL(configured);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (!isLocal && url.protocol !== "https:") {
    throw new Error("The production site URL must use HTTPS.");
  }

  return url.origin;
}

export async function createCrosswordCheckout(payload: CrosswordPurchasePayload) {
  const hash = puzzleHash(payload);
  const origin = siteOrigin();
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

export async function createWordSearchCheckout(payload: WordSearchPurchasePayload) {
  const hash = puzzleHash(payload);
  const origin = siteOrigin();
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("success_url", `${origin}/clicks/custom-word-search/success?session_id={CHECKOUT_SESSION_ID}`);
  body.set("cancel_url", `${origin}/clicks/custom-word-search?checkout=cancelled`);
  body.set("line_items[0][price_data][currency]", "usd");
  body.set("line_items[0][price_data][unit_amount]", "300");
  body.set("line_items[0][price_data][product_data][name]", "Custom Word Search Gift");
  body.set("line_items[0][price_data][product_data][description]", "Printable custom word search PDF with answer key");
  body.set("line_items[0][quantity]", "1");
  body.set("metadata[puzzle_hash]", hash);
  body.set("metadata[product]", "custom_word_search");
  body.set("payment_intent_data[metadata][puzzle_hash]", hash);
  body.set("payment_intent_data[metadata][product]", "custom_word_search");

  const response = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${stripeKey()}`, "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  const data = (await response.json()) as { id?: string; url?: string; error?: { message?: string } };
  if (!response.ok || !data.id || !data.url) throw new Error(data.error?.message || "Stripe could not create the checkout session.");
  return { id: data.id, url: data.url, puzzleHash: hash };
}

export async function retrieveCheckoutSession(sessionId: string) {
  if (!/^cs_(test_|live_)?[A-Za-z0-9]{8,200}$/.test(sessionId)) {
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
