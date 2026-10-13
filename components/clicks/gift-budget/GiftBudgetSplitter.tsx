"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  allocateGiftBudget,
  formatGiftMoney,
  GIFT_TIERS,
  parseBudgetCents,
  type GiftPerson,
  type GiftTier,
} from "@/lib/gift-budget";
import styles from "./gift-budget.module.css";

const initialPeople: GiftPerson[] = [
  { id: "gift-1", name: "", tier: "big" },
  { id: "gift-2", name: "", tier: "regular" },
  { id: "gift-3", name: "", tier: "regular" },
  { id: "gift-4", name: "", tier: "little" },
];

const reserveChoices = [
  { percent: 0, title: "Spend it all", detail: "No extra cushion" },
  { percent: 5, title: "A little wiggle room", detail: "5% for the extras" },
  { percent: 10, title: "December-proof", detail: "10% for surprises" },
] as const;

function personLabel(name: string, index: number) {
  return name.trim() || "Person " + (index + 1);
}

function giftBoxSize(amount: number, maxAmount: number) {
  if (maxAmount === 0) return 50;
  return Math.round(45 + (amount / maxAmount) * 48);
}

export function GiftBudgetSplitter() {
  const [budget, setBudget] = useState("500");
  const [reservePercent, setReservePercent] = useState(10);
  const [people, setPeople] = useState<GiftPerson[]>(initialPeople);
  const [copyStatus, setCopyStatus] = useState("Copy gift plan");
  const nextId = useRef(5);

  const budgetCents = parseBudgetCents(budget);
  const isBudgetValid = budgetCents !== null;
  const plan = allocateGiftBudget(budgetCents ?? 0, reservePercent, people);
  const largestGift = Math.max(
    0,
    ...plan.allocations.map((person) => person.amountCents),
  );

  function editPerson(id: string, changes: Partial<Pick<GiftPerson, "name" | "tier">>) {
    setPeople((current) =>
      current.map((person) => (person.id === id ? { ...person, ...changes } : person)),
    );
    setCopyStatus("Copy gift plan");
  }

  function addPerson() {
    if (people.length >= 30) return;
    const id = "gift-" + nextId.current++;
    setPeople((current) => [...current, { id, name: "", tier: "regular" }]);
    setCopyStatus("Copy gift plan");
  }

  function removePerson(id: string) {
    setPeople((current) => current.filter((person) => person.id !== id));
    setCopyStatus("Copy gift plan");
  }

  async function copyPlan() {
    if (!isBudgetValid || people.length === 0) return;

    const text = [
      "MY GIFT BUDGET PLAN",
      "Total budget: " + formatGiftMoney(plan.totalCents),
      "Set aside (" + reservePercent + "%): " + formatGiftMoney(plan.reserveCents),
      "For gifts: " + formatGiftMoney(plan.spendableCents),
      "",
      ...plan.allocations.map(
        (person, index) =>
          personLabel(person.name, index) +
          " (" + GIFT_TIERS[person.tier].label + "): " +
          formatGiftMoney(person.amountCents),
      ),
      "",
      "Made with Gift Budget Splitter at nicelittleclick.com",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied!");
    } catch {
      setCopyStatus("Copy unavailable — try Print / PDF");
    }
  }

  return (
    <main className={styles.page} aria-labelledby="gift-budget-title">
      <section className={styles.hero}>
        <p className={styles.eyebrow}>CLICK NO. 007 · FREE · MADE FOR GIFT GIVERS</p>
        <h1 className={styles.title} id="gift-budget-title">
          Gift Budget <span>Splitter.</span>
        </h1>
        <p className={styles.intro}>
          One gift budget. A whole list of people. Let&apos;s make the numbers behave.
        </p>
        <p className={styles.heroNote}>
          No spreadsheets. No awkward mental math in the checkout line.
        </p>
      </section>

      <div className={styles.layout}>
        <div className={styles.builder}>
          <section className={styles.panel} aria-labelledby="budget-section-title">
            <div className={styles.panelHead}>
              <span className={styles.stepNumber}>01</span>
              <div>
                <h2 id="budget-section-title">What&apos;s the total pot?</h2>
                <p>The whole gift budget, before any shopping happens.</p>
              </div>
            </div>

            <label className={styles.budgetField} htmlFor="gift-total-budget">
              <span className={styles.srOnly}>Total gift budget in dollars</span>
              <span aria-hidden="true" className={styles.dollarSign}>$</span>
              <input
                id="gift-total-budget"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={budget}
                aria-invalid={!isBudgetValid}
                aria-describedby={!isBudgetValid ? "gift-budget-error" : "gift-budget-help"}
                onChange={(event) => {
                  setBudget(event.target.value);
                  setCopyStatus("Copy gift plan");
                }}
              />
            </label>
            {!isBudgetValid ? (
              <p className={styles.error} role="alert" id="gift-budget-error">
                Enter a dollar amount with up to two decimals (maximum $100,000).
              </p>
            ) : (
              <p className={styles.helper} id="gift-budget-help">
                We&apos;ll divide this total, not add to it. Promise.
              </p>
            )}

            <div className={styles.reserveBlock}>
              <h3>Keep a little aside?</h3>
              <p>Wrapping, tax, shipping, or the person you nearly forgot.</p>
              <div className={styles.reserveChoices}>
                {reserveChoices.map((choice) => (
                  <button
                    key={choice.percent}
                    type="button"
                    aria-pressed={reservePercent === choice.percent}
                    onClick={() => {
                      setReservePercent(choice.percent);
                      setCopyStatus("Copy gift plan");
                    }}
                    className={[
                      styles.reserveChoice,
                      reservePercent === choice.percent ? styles.activeChoice : "",
                    ].filter(Boolean).join(" ")}
                  >
                    <strong>{choice.title}</strong>
                    <small>{choice.detail}</small>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="people-section-title">
            <div className={styles.panelHead}>
              <span className={styles.stepNumber}>02</span>
              <div>
                <h2 id="people-section-title">Who&apos;s getting a gift?</h2>
                <p>Change the names and pick how big a gift you&apos;re imagining.</p>
              </div>
            </div>

            <div className={styles.tierLegend} aria-label="How gift sizes work">
              <p><span className={styles.legendDotLittle} />Little something = 1 share</p>
              <p><span className={styles.legendDotRegular} />Regular gift = 2 shares</p>
              <p><span className={styles.legendDotBig} />Big gift = 3 shares</p>
            </div>
            <p className={styles.helper}>
              Shares are relative, so changing one gift size updates everyone&apos;s amount.
            </p>

            <div className={styles.peopleList}>
              {people.length === 0 ? (
                <div className={styles.emptyList}>
                  The gift list is empty. Click is guarding the wrapping paper.
                </div>
              ) : null}
              {people.map((person, index) => {
                const gift = plan.allocations[index];
                return (
                  <div key={person.id} className={styles.personRow}>
                    <div className={styles.personNumber}>{String(index + 1).padStart(2, "0")}</div>
                    <div className={styles.personInputs}>
                      <label htmlFor={"gift-name-" + person.id}>Name</label>
                      <input
                        type="text"
                        id={"gift-name-" + person.id}
                        autoComplete="off"
                        maxLength={42}
                        placeholder={personLabel("", index)}
                        value={person.name}
                        onChange={(event) => editPerson(person.id, { name: event.target.value })}
                      />
                      <label htmlFor={"gift-tier-" + person.id}>Gift size</label>
                      <select
                        id={"gift-tier-" + person.id}
                        value={person.tier}
                        onChange={(event) =>
                          editPerson(person.id, { tier: event.target.value as GiftTier })
                        }
                      >
                        {(Object.keys(GIFT_TIERS) as GiftTier[]).map((tier) => (
                          <option key={tier} value={tier}>{GIFT_TIERS[tier].label}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.rowActions}>
                      <strong className={styles.amount} aria-label={
                        "Budget for " + personLabel(person.name, index) + ": " +
                        formatGiftMoney(gift?.amountCents ?? 0)
                      }>
                        {isBudgetValid ? formatGiftMoney(gift?.amountCents ?? 0) : "—"}
                      </strong>
                      <button
                        type="button"
                        className={styles.remove}
                        onClick={() => removePerson(person.id)}
                        aria-label={"Remove " + personLabel(person.name, index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              className={styles.addButton}
              type="button"
              disabled={people.length >= 30}
              onClick={addPerson}
            >
              <span aria-hidden="true">+</span> Add another person
            </button>
            {people.length >= 30 ? <p className={styles.helper}>Thirty people is plenty for one tiny Click.</p> : null}
          </section>
        </div>

        <aside className={styles.preview} aria-label="Live gift budget plan">
          <div className={styles.paperCard}>
            <div className={styles.paperTop}>
              <span>THE LITTLE GIFT LEDGER</span>
              <span className={styles.stamp}>A NICE PLAN</span>
            </div>
            <div className={styles.paperHeadline}>
              <p>Your gift plan</p>
              <h2>{isBudgetValid ? formatGiftMoney(plan.totalCents) : "—"}</h2>
              <span>total to work with</span>
            </div>

            {isBudgetValid ? (
              <>
                <div className={styles.paperMath}>
                  <div>
                    <span>Saved for extras ({reservePercent}%)</span>
                    <strong>{formatGiftMoney(plan.reserveCents)}</strong>
                  </div>
                  <div>
                    <span>Ready for gifts</span>
                    <strong>{formatGiftMoney(plan.spendableCents)}</strong>
                  </div>
                </div>

                {people.length > 0 ? (
                  <>
                    <div className={styles.giftShelf} aria-label="Gift box sizes represent relative allocations">
                      {plan.allocations.map((person, index) => {
                        const size = giftBoxSize(person.amountCents, largestGift);
                        return (
                          <div key={person.id} className={styles.giftTile}>
                            <div className={styles.boxStage} aria-hidden="true">
                              <div
                                className={[
                                  styles.giftBox,
                                  styles["box" + (index % 5)],
                                ].join(" ")}
                                style={{ width: size, height: size }}
                              >
                                <span className={styles.ribbonVertical} />
                                <span className={styles.ribbonHorizontal} />
                                <span className={styles.bow}>✦</span>
                              </div>
                            </div>
                            <span className={styles.giftName} title={personLabel(person.name, index)}>
                              {personLabel(person.name, index)}
                            </span>
                            <strong>{formatGiftMoney(person.amountCents)}</strong>
                          </div>
                        );
                      })}
                    </div>
                    <p className={styles.shelfNote}>
                      Big boxes get bigger shares. Everyone still fits the budget.
                    </p>
                  </>
                ) : (
                  <p className={styles.emptyPreview}>Add someone to start filling the gift table.</p>
                )}

                <div className={styles.paperFooter}>
                  <span>Allocated to people</span>
                  <strong>{formatGiftMoney(
                    plan.allocations.reduce((sum, gift) => sum + gift.amountCents, 0),
                  )}</strong>
                </div>
                {people.length === 0 ? (
                  <p className={styles.unassigned}>
                    {formatGiftMoney(plan.unassignedCents)} waiting for a name.
                  </p>
                ) : (
                  <p className={styles.balanced}>Every penny accounted for. Nice.</p>
                )}
              </>
            ) : (
              <p className={styles.emptyPreview}>Give us a valid budget and we&apos;ll put the gifts in order.</p>
            )}

            <div className={styles.paperBrand}>NICE LITTLE CLICK LAB · CLICK NO. 007</div>
          </div>

          <div className={styles.previewActions}>
            <button
              type="button"
              disabled={!isBudgetValid || people.length === 0}
              onClick={() => { void copyPlan(); }}
              className={styles.copyButton}
            >
              {copyStatus}
            </button>
            <button
              type="button"
              disabled={!isBudgetValid || people.length === 0}
              onClick={() => window.print()}
              className={styles.printButton}
            >
              Print / save PDF
            </button>
          </div>
          <div className={styles.clickNote}>
            <Image
              src="/images/click/Click-Profile.webp"
              alt="Click, the black Lab mascot"
              width={108}
              height={108}
              className={styles.clickImage}
            />
            <p>
              Click is supervising the gift pile.
              <span> Nobody has checked his paws for ribbon.</span>
            </p>
          </div>
        </aside>
      </div>

      <p className={styles.privacy}>
        This Click runs entirely in your browser. We don&apos;t store your names, gift list, or budget.
        Copying or printing is up to you.
      </p>
    </main>
  );
}
