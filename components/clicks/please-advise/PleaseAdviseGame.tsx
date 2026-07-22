"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  pleaseAdviseEmails,
  type PanicEmail,
  type ReplyChoice,
} from "@/data/please-advise";
import styles from "./please-advise.module.css";

type Screen = "start" | "playing" | "feedback" | "results";

type AnswerRecord = {
  email: PanicEmail;
  choice: ReplyChoice;
  correct: boolean;
  feedback: string;
};

const STARTING_TIME = 8;
const MAX_MISTAKES = 3;
const PERSONAL_BEST_KEY = "nlcl-please-advise-best";

const choiceLabels: Record<ReplyChoice, string> = {
  reply: "Reply",
  "reply-all": "Reply All",
  ignore: "Spam / Ignore",
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function getRoundTime(round: number) {
  return Math.max(4.5, STARTING_TIME - Math.floor(round / 4) * 0.5);
}

function getRank(score: number, survived: number) {
  if (survived >= 25 || score >= 4300) return "Inbox Oracle";
  if (survived >= 18 || score >= 3000) return "Corporate Diplomat";
  if (survived >= 12 || score >= 1900) return "Cautious Correspondent";
  if (survived >= 7 || score >= 950) return "Inbox Professional";
  if (survived >= 3) return "Probationary Responder";
  return "Reply-All Menace";
}

function getEmploymentStatus(mistakes: number, survived: number) {
  if (mistakes === 0 && survived >= 10) return "Suspiciously promotable";
  if (mistakes <= 1) return "Secure for now";
  if (mistakes === 2) return "Technically active";
  return "Meeting with HR pending";
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });

  if (line) lines.push(line);
  return lines;
}

export function PleaseAdviseGame() {
  const [screen, setScreen] = useState<Screen>("start");
  const [deck, setDeck] = useState<PanicEmail[]>([]);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(STARTING_TIME);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [lastAnswer, setLastAnswer] = useState<AnswerRecord | null>(null);
  const [personalBest, setPersonalBest] = useState(0);
  const [shareMessage, setShareMessage] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentEmail = deck[round];
  const survived = answers.filter((answer) => answer.correct).length;
  const rank = getRank(score, survived);
  const employmentStatus = getEmploymentStatus(mistakes, survived);
  const roundSeconds = getRoundTime(round);

  const notableIncident = useMemo(() => {
    const wrongAnswer = [...answers].reverse().find((answer) => !answer.correct);
    if (wrongAnswer) return wrongAnswer.feedback;
    const rightAnswer = answers.at(-1);
    return rightAnswer?.feedback ?? "Nobody saw the draft message. Probably.";
  }, [answers]);

  useEffect(() => {
    const storedBest = Number(window.localStorage.getItem(PERSONAL_BEST_KEY) ?? 0);
    if (Number.isFinite(storedBest)) setPersonalBest(storedBest);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const endGame = useCallback(
    (finalScore: number) => {
      stopTimer();
      setScreen("results");
      if (finalScore > personalBest) {
        setPersonalBest(finalScore);
        window.localStorage.setItem(PERSONAL_BEST_KEY, String(finalScore));
      }
    },
    [personalBest, stopTimer],
  );

  const recordChoice = useCallback(
    (choice: ReplyChoice, timedOut = false) => {
      if (screen !== "playing" || !currentEmail) return;

      stopTimer();
      const correct = choice === currentEmail.correctChoice && !timedOut;
      const feedback = timedOut
        ? `Time ran out. The correct move was ${choiceLabels[currentEmail.correctChoice].toLowerCase()}. Your inbox made the decision for you.`
        : correct
          ? currentEmail.correctFeedback
          : currentEmail.wrongFeedback[choice] ??
            `That was not the move. ${choiceLabels[currentEmail.correctChoice]} would have been safer.`;

      const record: AnswerRecord = { email: currentEmail, choice, correct, feedback };
      const updatedMistakes = mistakes + (correct ? 0 : 1);
      const speedBonus = Math.max(0, Math.round(timeLeft * 18));
      const updatedScore = correct ? score + 100 + speedBonus + round * 4 : Math.max(0, score - 40);

      setLastAnswer(record);
      setAnswers((previous) => [...previous, record]);
      setMistakes(updatedMistakes);
      setScore(updatedScore);
      setScreen("feedback");

      window.setTimeout(() => {
        if (updatedMistakes >= MAX_MISTAKES || round >= deck.length - 1) {
          endGame(updatedScore);
          return;
        }
        const nextRound = round + 1;
        setRound(nextRound);
        setTimeLeft(getRoundTime(nextRound));
        setScreen("playing");
      }, 1350);
    },
    [currentEmail, deck.length, endGame, mistakes, round, score, screen, stopTimer, timeLeft],
  );

  useEffect(() => {
    if (screen !== "playing") return;

    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((previous) => {
        const next = Math.max(0, previous - 0.1);
        if (next <= 0) {
          window.setTimeout(() => recordChoice("ignore", true), 0);
          return 0;
        }
        return next;
      });
    }, 100);

    return stopTimer;
  }, [recordChoice, screen, stopTimer]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (screen !== "playing") return;
      if (event.key === "1") recordChoice("reply");
      if (event.key === "2") recordChoice("reply-all");
      if (event.key === "3") recordChoice("ignore");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [recordChoice, screen]);

  const startGame = () => {
    stopTimer();
    setDeck(shuffle(pleaseAdviseEmails));
    setRound(0);
    setScore(0);
    setMistakes(0);
    setAnswers([]);
    setLastAnswer(null);
    setShareMessage("");
    setTimeLeft(STARTING_TIME);
    setScreen("playing");
  };

  const createScorecardBlob = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Scorecard canvas could not be created.");

    context.fillStyle = "#f7f0df";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#2f2a25";
    context.font = "700 46px system-ui, sans-serif";
    context.fillText("NICE LITTLE CLICK LAB", 84, 100);

    context.fillStyle = "#d86f5b";
    context.font = "800 84px Georgia, serif";
    context.fillText("Please Advise", 84, 210);

    context.fillStyle = "#fffaf0";
    context.strokeStyle = "#dacdb8";
    context.lineWidth = 3;
    context.beginPath();
    context.roundRect(64, 270, 952, 900, 42);
    context.fill();
    context.stroke();

    context.fillStyle = "#657f74";
    context.font = "700 34px system-ui, sans-serif";
    context.fillText("EMPLOYMENT STATUS", 112, 360);
    context.fillStyle = "#2f2a25";
    context.font = "800 64px Georgia, serif";
    context.fillText(employmentStatus, 112, 440);

    context.fillStyle = "#d86f5b";
    context.font = "800 108px system-ui, sans-serif";
    context.fillText(score.toLocaleString(), 112, 590);
    context.fillStyle = "#756b60";
    context.font = "500 30px system-ui, sans-serif";
    context.fillText("POINTS", 116, 635);

    const stats = [
      ["Rank", rank],
      ["Emails survived", String(survived)],
      ["Mistakes made", `${mistakes} / ${MAX_MISTAKES}`],
      ["Personal best", Math.max(score, personalBest).toLocaleString()],
    ];

    stats.forEach(([label, value], index) => {
      const y = 730 + index * 86;
      context.fillStyle = "#756b60";
      context.font = "600 29px system-ui, sans-serif";
      context.fillText(label, 116, y);
      context.fillStyle = "#2f2a25";
      context.font = "700 31px system-ui, sans-serif";
      context.textAlign = "right";
      context.fillText(value, 950, y);
      context.textAlign = "left";
    });

    context.fillStyle = "#eef1e9";
    context.beginPath();
    context.roundRect(102, 1045, 876, 165, 24);
    context.fill();
    context.fillStyle = "#2f2a25";
    context.font = "600 28px system-ui, sans-serif";
    const incidentLines = wrapCanvasText(context, notableIncident, 800).slice(0, 3);
    incidentLines.forEach((line, index) => context.fillText(line, 140, 1100 + index * 38));

    context.fillStyle = "#657f74";
    context.font = "700 29px system-ui, sans-serif";
    context.fillText("nicelittleclick.com", 84, 1285);
    context.textAlign = "right";
    context.fillText("Run by Click. Supervised loosely.", 996, 1285);
    context.textAlign = "left";

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Scorecard image could not be generated."));
      }, "image/png");
    });
  };

  const downloadScorecard = async () => {
    try {
      const blob = await createScorecardBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `please-advise-${score}-points.png`;
      link.click();
      URL.revokeObjectURL(url);
      setShareMessage("Scorecard downloaded. Evidence secured.");
    } catch {
      setShareMessage("The scorecard printer jammed. Please try again.");
    }
  };

  const shareResult = async () => {
    const text = `I scored ${score.toLocaleString()} points in Please Advise, survived ${survived} emails, and remain ${employmentStatus.toLowerCase()}. Can you beat me?`;

    try {
      const blob = await createScorecardBlob();
      const file = new File([blob], "please-advise-scorecard.png", { type: "image/png" });
      const shareData: ShareData = {
        title: "My Please Advise result",
        text,
        url: window.location.href,
      };

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ ...shareData, files: [file] });
        setShareMessage("Result shared. Your fictional misconduct is public.");
        return;
      }

      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage("Result shared. Your inbox reputation travels.");
        return;
      }

      await navigator.clipboard.writeText(`${text} ${window.location.href}`);
      setShareMessage("Result copied. Paste it somewhere professionally questionable.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareMessage("Sharing was blocked. Download the scorecard instead.");
    }
  };

  const renderClick = (mood: "calm" | "worried" | "proud") => (
    <div className={`${styles.clickMascot} ${styles[mood]}`} aria-label={`Click looks ${mood}.`}>
      <span className={styles.clickEarLeft} />
      <span className={styles.clickEarRight} />
      <span className={styles.clickFace}>
        <span className={styles.clickEyeLeft} />
        <span className={styles.clickEyeRight} />
        <span className={styles.clickNose} />
        <span className={styles.clickMouth} />
      </span>
      <span className={styles.clickBody} />
      <span className={styles.clickCollar} />
      <span className={styles.cursorTag}>↖</span>
    </div>
  );

  return (
    <main className={styles.pageShell}>
      <div className={styles.labLabel}>CLICK NO. 003 · PLAYABLE EXPERIMENT</div>

      {screen === "start" && (
        <section className={styles.startScreen}>
          <div className={styles.startCopy}>
            <p className={styles.eyebrow}>A tiny workplace survival game</p>
            <h1>Please Advise</h1>
            <p className={styles.intro}>
              Read the email. Choose who needs your response. Protect your fictional career.
            </p>

            <div className={styles.rules}>
              <div><span>1</span><strong>Reply</strong><small>Only the sender needs it.</small></div>
              <div><span>2</span><strong>Reply All</strong><small>Everyone genuinely needs it.</small></div>
              <div><span>3</span><strong>Spam / Ignore</strong><small>No response belongs here.</small></div>
            </div>

            <button className={styles.primaryButton} type="button" onClick={startGame}>
              Open the inbox
            </button>
            <p className={styles.smallPrint}>Three mistakes and HR would like a word.</p>
          </div>

          <aside className={styles.startVisual}>
            <div className={styles.mascotHalo} aria-hidden="true" />
            <div className={styles.startMascot}>{renderClick("calm")}</div>
            <div className={styles.clickNote}>
              <span aria-hidden="true">♥</span>
              <p>I’ll be here. Judging quietly.</p>
              <small>Trying not to hyperventilate.</small>
            </div>
            <div className={styles.deskBits} aria-hidden="true">
              <span className={styles.mug}>INBOX<br />IS A<br />JUNGLE</span>
              <span className={styles.plant}>♣</span>
            </div>
          </aside>
        </section>
      )}

      {(screen === "playing" || screen === "feedback") && currentEmail && (
        <section className={styles.gameScreen}>
          <header className={styles.gameHeader}>
            <div>
              <p className={styles.eyebrow}>Choose wisely. Protect your job.</p>
              <h1>Please Advise</h1>
            </div>
            <div className={styles.hud}>
              <div><span>Time</span><strong className={timeLeft < 2.5 ? styles.dangerText : ""}>{timeLeft.toFixed(1)}</strong></div>
              <div><span>Survived</span><strong>{survived}</strong></div>
              <div><span>Mistakes</span><strong>{mistakes}/{MAX_MISTAKES}</strong></div>
              <div><span>Score</span><strong>{score.toLocaleString()}</strong></div>
            </div>
          </header>

          <div className={styles.timerTrack} aria-hidden="true">
            <span style={{ width: `${Math.max(0, (timeLeft / roundSeconds) * 100)}%` }} />
          </div>

          <article className={styles.emailCard} aria-live="polite">
            <div className={styles.avatar}>{currentEmail.from.charAt(0).toUpperCase()}</div>
            <dl className={styles.emailMeta}>
              <div><dt>From</dt><dd>{currentEmail.from}</dd></div>
              <div><dt>To</dt><dd>{currentEmail.to}</dd></div>
              {currentEmail.cc && <div><dt>CC</dt><dd>{currentEmail.cc}</dd></div>}
              <div className={styles.subjectRow}><dt>Subject</dt><dd>{currentEmail.subject}</dd></div>
            </dl>
            <p className={styles.emailBody}>{currentEmail.body}</p>
          </article>

          <div className={styles.choiceGrid} aria-label="Choose an email action">
            <button type="button" disabled={screen !== "playing"} onClick={() => recordChoice("reply")}>
              <span className={styles.keyHint}>1</span><span aria-hidden="true">↩</span> Reply
            </button>
            <button className={styles.replyAllButton} type="button" disabled={screen !== "playing"} onClick={() => recordChoice("reply-all")}>
              <span className={styles.keyHint}>2</span><span aria-hidden="true">👥</span> Reply All
            </button>
            <button className={styles.ignoreButton} type="button" disabled={screen !== "playing"} onClick={() => recordChoice("ignore")}>
              <span className={styles.keyHint}>3</span><span aria-hidden="true">⊘</span> Spam / Ignore
            </button>
          </div>

          <div className={`${styles.feedbackPanel} ${lastAnswer?.correct ? styles.feedbackCorrect : styles.feedbackWrong}`} aria-live="assertive">
            {screen === "feedback" && lastAnswer ? (
              <>
                <strong>{lastAnswer.correct ? "Correct." : "Inbox incident."}</strong>
                <span>{lastAnswer.feedback}</span>
              </>
            ) : (
              <span>Tip: If in doubt, check who actually needs the answer.</span>
            )}
          </div>

          <div className={styles.gameMascot}>
            {renderClick(timeLeft < 2.5 || screen === "feedback" && !lastAnswer?.correct ? "worried" : "calm")}
          </div>
        </section>
      )}

      {screen === "results" && (
        <section className={styles.resultsScreen}>
          <header className={styles.resultsHeader}>
            <p className={styles.eyebrow}>Your performance review has arrived.</p>
            <h1>Please Advise</h1>
          </header>

          <div className={styles.resultsCard}>
            <div className={styles.confetti} aria-hidden="true">✦ · ✧ · ✦ · ✧</div>
            <p className={styles.statusLabel}>Employment status</p>
            <h2>{employmentStatus}</h2>
            <div className={styles.rankBadge}><span>Final rank</span><strong>{rank}</strong></div>

            <div className={styles.scoreRow}>
              <div><span>Your score</span><strong>{score.toLocaleString()}</strong><small>points</small></div>
              <dl>
                <div><dt>Emails survived</dt><dd>{survived}</dd></div>
                <div><dt>Mistakes made</dt><dd>{mistakes}</dd></div>
                <div><dt>Personal best</dt><dd>{Math.max(score, personalBest).toLocaleString()}</dd></div>
                <div><dt>Inbox condition</dt><dd>{mistakes === 0 ? "Pristine" : mistakes === 1 ? "Rumpled" : "Concerning"}</dd></div>
              </dl>
            </div>

            <div className={styles.incidentBox}>
              <strong>Notable incident</strong>
              <p>{notableIncident}</p>
            </div>

            <div className={styles.resultsActions}>
              <button type="button" onClick={startGame}>↻ Play Again</button>
              <button className={styles.shareButton} type="button" onClick={shareResult}>↗ Share Result</button>
              <button className={styles.downloadButton} type="button" onClick={downloadScorecard}>↓ Download Scorecard</button>
            </div>

            <p className={styles.shareStatus} aria-live="polite">{shareMessage || "Nobody saw the draft message. Probably."}</p>
          </div>

          <div className={styles.resultsMascot}>
            {renderClick(mistakes < 2 ? "proud" : "calm")}
            <span>Click has reviewed your file.</span>
          </div>
        </section>
      )}
    </main>
  );
}
