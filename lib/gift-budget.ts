export type GiftTier = "little" | "regular" | "big";

export type GiftPerson = {
  id: string;
  name: string;
  tier: GiftTier;
};

export type GiftAllocation = GiftPerson & {
  amountCents: number;
};

export type GiftPlan = {
  totalCents: number;
  reserveCents: number;
  spendableCents: number;
  unassignedCents: number;
  allocations: GiftAllocation[];
};

export const GIFT_TIERS: Record<
  GiftTier,
  { label: string; description: string; weight: number }
> = {
  little: { label: "Little something", description: "A thoughtful token", weight: 1 },
  regular: { label: "Regular gift", description: "The usual lovely gift", weight: 2 },
  big: { label: "Big gift", description: "Someone gets spoiled", weight: 3 },
};

const MAX_BUDGET_CENTS = 10_000_000;

/**
 * Parse whole dollars or up to two decimal places without floating-point
 * rounding. Returns null for invalid input or a budget over $100,000.
 */
export function parseBudgetCents(input: string): number | null {
  const normalized = input.trim().replace(/^\$/, "");
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;

  const [dollars, cents = ""] = normalized.split(".");
  const amount = Number(dollars) * 100 + Number(cents.padEnd(2, "0"));
  return Number.isSafeInteger(amount) && amount <= MAX_BUDGET_CENTS
    ? amount
    : null;
}

/**
 * Allocate exact cents using the largest-remainder method. Every penny
 * belongs either to a gift, the reserve, or (with no people) the unassigned
 * balance. Equal remainders follow the original person order.
 */
export function allocateGiftBudget(
  totalCents: number,
  reservePercent: number,
  people: readonly GiftPerson[],
): GiftPlan {
  const safeTotal = Number.isSafeInteger(totalCents)
    ? Math.max(0, Math.min(MAX_BUDGET_CENTS, totalCents))
    : 0;
  const safeReserve = Number.isFinite(reservePercent)
    ? Math.max(0, Math.min(20, reservePercent))
    : 0;
  const reserveCents = Math.round((safeTotal * safeReserve) / 100);
  const spendableCents = safeTotal - reserveCents;

  if (!people.length) {
    return {
      totalCents: safeTotal,
      reserveCents,
      spendableCents,
      unassignedCents: spendableCents,
      allocations: [],
    };
  }

  const weights = people.map((person) => GIFT_TIERS[person.tier].weight);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const portions = people.map((person, index) => {
    const exact = (spendableCents * weights[index]) / totalWeight;
    const floor = Math.floor(exact);
    return { ...person, amountCents: floor, remainder: exact - floor, index };
  });

  const pennies = spendableCents -
    portions.reduce((sum, person) => sum + person.amountCents, 0);
  const order = portions
    .map((person) => ({ index: person.index, remainder: person.remainder }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);

  for (let index = 0; index < pennies; index += 1) {
    portions[order[index].index].amountCents += 1;
  }

  return {
    totalCents: safeTotal,
    reserveCents,
    spendableCents,
    unassignedCents: 0,
    allocations: portions.map(({ id, name, tier, amountCents }) => ({
      id, name, tier, amountCents,
    })),
  };
}

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatGiftMoney(cents: number): string {
  return moneyFormatter.format(cents / 100);
}
