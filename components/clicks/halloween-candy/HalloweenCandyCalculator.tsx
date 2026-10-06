"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./halloween-candy.module.css";

type EstimateMode = "known" | "unknown";
type TrafficLevel = "trickle" | "steady" | "chaos";

const trafficOptions: Array<{
  id: TrafficLevel;
  label: string;
  note: string;
  rate: number;
}> = [
  { id: "trickle", label: "A trickle", note: "About 10 kids/hour", rate: 10 },
  { id: "steady", label: "Pretty steady", note: "About 30 kids/hour", rate: 30 },
  { id: "chaos", label: "Porch chaos", note: "About 60 kids/hour", rate: 60 },
];

const generosityOptions = [
  { pieces: 1, label: "One each", note: "Disciplined. Controlled. A system." },
  { pieces: 2, label: "Two each", note: "The respectable middle." },
  { pieces: 3, label: "Three each", note: "Generous neighbor behavior." },
  { pieces: 4, label: "Handful goblin", note: "Numbers have lost all meaning." },
] as const;

const bufferOptions = [
  { value: 0, label: "Living dangerously", note: "No backup candy." },
  { value: 0.1, label: "A little breathing room", note: "10% just-in-case candy." },
  { value: 0.2, label: "Nobody is egging this house", note: "20% backup candy." },
] as const;

function wholeNumber(value: string, fallback = 0, min = 0, max = 5000) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function verdictFor(piecesPerVisitor: number, buffer: number, recommended: number) {
  if (piecesPerVisitor === 4) {
    return {
      title: "Handful Goblin",
      copy: "You have chosen abundance. Click respects the commitment.",
    };
  }

  if (recommended >= 500) {
    return {
      title: "Neighborhood Legend",
      copy: "At this volume, children may begin telling other children about your house.",
    };
  }

  if (buffer === 0) {
    return {
      title: "Candy Optimist",
      copy: "This works beautifully unless everyone brings a cousin.",
    };
  }

  if (buffer === 0.2) {
    return {
      title: "Porch Quartermaster",
      copy: "There are spreadsheets with less logistical planning than this.",
    };
  }

  return {
    title: "Prepared Neighbor",
    copy: "You have accounted for the tiny hordes without buying a candy bunker.",
  };
}

export function HalloweenCandyCalculator() {
  const [estimateMode, setEstimateMode] = useState<EstimateMode>("known");
  const [knownVisitorsInput, setKnownVisitorsInput] = useState("75");
  const [hours, setHours] = useState(3);
  const [traffic, setTraffic] = useState<TrafficLevel>("steady");
  const [piecesPerVisitor, setPiecesPerVisitor] = useState(2);
  const [buffer, setBuffer] = useState(0.1);
  const [piecesPerBagInput, setPiecesPerBagInput] = useState("");
  const [shareState, setShareState] = useState("Share this plan");

  const trafficRate =
    trafficOptions.find((option) => option.id === traffic)?.rate ?? 30;
  const knownVisitors = wholeNumber(knownVisitorsInput, 0, 0, 5000);
  const expectedVisitors =
    estimateMode === "known" ? knownVisitors : hours * trafficRate;

  const baseCandy = expectedVisitors * piecesPerVisitor;
  const bufferCandy = Math.ceil(baseCandy * buffer);
  const recommendedCandy = baseCandy + bufferCandy;

  const bagSize = wholeNumber(piecesPerBagInput, 0, 0, 5000);
  const bagsNeeded =
    bagSize > 0 && recommendedCandy > 0
      ? Math.ceil(recommendedCandy / bagSize)
      : null;
  const purchasedCandy = bagsNeeded ? bagsNeeded * bagSize : null;
  const leftovers =
    purchasedCandy !== null ? purchasedCandy - recommendedCandy : null;

  const verdict = verdictFor(piecesPerVisitor, buffer, recommendedCandy);
  const candyCount =
    recommendedCandy === 0
      ? 0
      : Math.min(48, Math.max(9, Math.round(recommendedCandy / 12)));

  const estimateLabel =
    estimateMode === "known"
      ? String(expectedVisitors)
      : "about " + expectedVisitors;

  async function sharePlan() {
    const summary = [
      "My Halloween candy plan:",
      recommendedCandy + " pieces",
      "for " + estimateLabel + " trick-or-treaters",
      "(" + piecesPerVisitor + " each + " + Math.round(buffer * 100) + "% backup).",
    ].join(" ");

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My Halloween candy plan",
          text: summary,
          url: window.location.href,
        });
        setShareState("Shared!");
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(summary + " " + window.location.href);
        setShareState("Copied!");
        return;
      }

      setShareState("Screenshot away");
    } catch {
      setShareState("Screenshot away");
    }
  }

  return (
    <main className={styles.page} aria-labelledby="halloween-candy-title">
      <div className={styles.stars} aria-hidden="true" />

      <section className={styles.hero}>
        <p className={styles.eyebrow}>CLICK NO. 006 · FREE · NO SIGN-UP</p>
        <h1 id="halloween-candy-title" className={styles.title}>
          How Much Halloween Candy Do I Need?
        </h1>
        <p className={styles.subtitle}>
          Avoid the 7:43 PM candy emergency.
        </p>
      </section>

      <div className={styles.layout}>
        <section className={styles.controls} aria-label="Halloween candy settings">
          <fieldset className={styles.fieldset}>
            <legend>1. How many trick-or-treaters?</legend>

            <div className={styles.modeSwitch}>
              <button
                type="button"
                className={[
                  styles.modeButton,
                  estimateMode === "known" ? styles.selected : "",
                ].filter(Boolean).join(" ")}
                aria-pressed={estimateMode === "known"}
                onClick={() => setEstimateMode("known")}
              >
                I have a pretty good idea
              </button>
              <button
                type="button"
                className={[
                  styles.modeButton,
                  estimateMode === "unknown" ? styles.selected : "",
                ].filter(Boolean).join(" ")}
                aria-pressed={estimateMode === "unknown"}
                onClick={() => setEstimateMode("unknown")}
              >
                I genuinely have no clue
              </button>
            </div>

            {estimateMode === "known" ? (
              <label className={styles.numberField}>
                <span>Expected trick-or-treaters</span>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  inputMode="numeric"
                  value={knownVisitorsInput}
                  onChange={(event) => setKnownVisitorsInput(event.target.value)}
                />
                <small>Last year&apos;s count is your best cheat code.</small>
              </label>
            ) : (
              <div className={styles.unknownGrid}>
                <label className={styles.numberField}>
                  <span>Porch-light hours</span>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    inputMode="numeric"
                    value={hours}
                    onChange={(event) =>
                      setHours(wholeNumber(event.target.value, 3, 1, 8))
                    }
                  />
                  <small>We cannot see the future. Tragically.</small>
                </label>

                <div>
                  <p className={styles.miniLabel}>Planning traffic</p>
                  <div className={styles.choiceGrid}>
                    {trafficOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={[
                          styles.choice,
                          traffic === option.id ? styles.selected : "",
                        ].filter(Boolean).join(" ")}
                        aria-pressed={traffic === option.id}
                        onClick={() => setTraffic(option.id)}
                      >
                        <strong>{option.label}</strong>
                        <span>{option.note}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend>2. How generous are we being?</legend>
            <div className={styles.choiceGrid}>
              {generosityOptions.map((option) => (
                <button
                  key={option.pieces}
                  type="button"
                  className={[
                    styles.choice,
                    piecesPerVisitor === option.pieces ? styles.selected : "",
                  ].filter(Boolean).join(" ")}
                  aria-pressed={piecesPerVisitor === option.pieces}
                  onClick={() => setPiecesPerVisitor(option.pieces)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.note}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend>3. How afraid are you of running out?</legend>
            <div className={styles.choiceGrid}>
              {bufferOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={[
                    styles.choice,
                    buffer === option.value ? styles.selected : "",
                  ].filter(Boolean).join(" ")}
                  aria-pressed={buffer === option.value}
                  onClick={() => setBuffer(option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.note}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <p className={styles.privacyNote}>
            Everything stays in this browser. No account, no neighborhood lookup,
            no candy surveillance.
          </p>
        </section>

        <aside className={styles.preview} aria-label="Your Halloween candy plan">
          <div className={styles.porchScene} aria-hidden="true">
            <div className={styles.moon} />
            <div className={styles.porchLight}>✦</div>
            <div className={styles.candyPile}>
              {Array.from({ length: candyCount }, (_, index) => (
                <span
                  key={index}
                  className={[
                    styles.candy,
                    styles["candy" + ((index % 6) + 1)],
                  ].join(" ")}
                />
              ))}
            </div>
            <div className={styles.bowl}>
              <span>TRICK OR TREAT</span>
            </div>
          </div>

          <article className={styles.resultCard} aria-live="polite">
            <p className={styles.resultEyebrow}>YOU NEED ABOUT</p>
            <p className={styles.bigNumber}>
              {recommendedCandy.toLocaleString()}
            </p>
            <p className={styles.piecesLabel}>pieces of candy</p>

            <div className={styles.math}>
              <div>
                <span>{estimateLabel} trick-or-treaters</span>
                <strong>{baseCandy.toLocaleString()} pieces</strong>
              </div>
              <div>
                <span>{Math.round(buffer * 100)}% backup candy</span>
                <strong>+ {bufferCandy.toLocaleString()}</strong>
              </div>
              <div className={styles.totalRow}>
                <span>Porch total</span>
                <strong>{recommendedCandy.toLocaleString()}</strong>
              </div>
            </div>

            <div className={styles.verdict}>
              <p>{verdict.title}</p>
              <span>{verdict.copy}</span>
            </div>

            <div className={styles.bagHelper}>
              <label htmlFor="pieces-per-bag">
                Want the bag count too?
                <span>Enter the piece count printed on one bag.</span>
              </label>
              <input
                id="pieces-per-bag"
                type="number"
                min="1"
                max="5000"
                inputMode="numeric"
                placeholder="e.g. 120"
                value={piecesPerBagInput}
                onChange={(event) => setPiecesPerBagInput(event.target.value)}
              />

              {bagsNeeded !== null && leftovers !== null ? (
                <div className={styles.bagResult}>
                  <strong>Buy {bagsNeeded} {bagsNeeded === 1 ? "bag" : "bags"}.</strong>
                  <span>
                    That gives you {purchasedCandy?.toLocaleString()} pieces with
                    about {leftovers.toLocaleString()} left over.
                  </span>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className={styles.shareButton}
              onClick={sharePlan}
            >
              {shareState}
            </button>

            <p className={styles.attribution}>
              Calculated at Nice Little Click Lab
            </p>
          </article>

          <div className={styles.clickNote}>
            <Image
              src="/images/click/Click-Profile.webp"
              alt=""
              width={128}
              height={128}
              className={styles.clickImage}
            />
            <div className={styles.witchHat} aria-hidden="true" />
            <p>Click recommends hiding one emergency bag from the household.</p>
          </div>
        </aside>
      </div>

      <section className={styles.formula}>
        <p className={styles.formulaLabel}>The extremely secret formula</p>
        <p>
          expected visitors × pieces each + your chosen backup percentage
        </p>
        <span>
          Unknown-turnout mode uses the traffic rate you choose as a planning
          assumption, not a prediction.
        </span>
      </section>
    </main>
  );
}
