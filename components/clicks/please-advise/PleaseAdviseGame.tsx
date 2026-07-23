"use client";

import Image from "next/image";
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
const SESSION_LENGTHS = [10, 20] as const;
type SessionLength = (typeof SESSION_LENGTHS)[number];
const PERSONAL_BEST_KEY = "nlcl-please-advise-best";
const SOUND_PREFERENCE_KEY = "nlcl-please-advise-sound";

type SoundEffect = "open" | "correct" | "wrong" | "game-over" | "button";

const soundFiles: Record<SoundEffect, string> = {
  open: "/sounds/please-advise/inbox-open.mp3",
  correct: "/sounds/please-advise/correct.mp3",
  wrong: "/sounds/please-advise/wrong.mp3",
  "game-over": "/sounds/please-advise/game-over.mp3",
  button: "/sounds/please-advise/button.mp3",
};

function playFallbackSound(kind: SoundEffect) {
  const AudioContextClass = window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  const settings: Record<SoundEffect, [number, number, OscillatorType]> = {
    open: [420, 620, "sine"],
    correct: [620, 880, "sine"],
    wrong: [230, 150, "triangle"],
    "game-over": [260, 110, "sawtooth"],
    button: [520, 480, "sine"],
  };
  const [startFrequency, endFrequency, type] = settings[kind];

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(startFrequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(60, endFrequency), now + 0.16);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(kind === "wrong" ? 0.025 : kind === "game-over" ? 0.045 : 0.07, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.2);
  oscillator.addEventListener("ended", () => void context.close());
}

function playSoundEffect(kind: SoundEffect, enabled: boolean) {
  if (!enabled) return;
  const audio = new Audio(soundFiles[kind]);
  audio.preload = "auto";
  audio.volume = kind === "wrong" ? 0.16 : kind === "game-over" ? 0.28 : 0.34;
  let usedFallback = false;
  const fallback = () => {
    if (usedFallback) return;
    usedFallback = true;
    playFallbackSound(kind);
  };
  audio.addEventListener("error", fallback, { once: true });
  void audio.play().catch(fallback);
}

function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image: ${src}`));
    image.src = src;
  });
}

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
  return "Inbox Liability";
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

function setMimosaCanvasFont(
  context: CanvasRenderingContext2D,
  size: number,
  weight = 400,
) {
  context.font = `${weight} ${size}px "Mimosa", "Segoe Print", cursive`;
}

function fitMimosaCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startingSize: number,
  minimumSize = 17,
  weight = 700,
) {
  let size = startingSize;
  setMimosaCanvasFont(context, size, weight);
  while (context.measureText(text).width > maxWidth && size > minimumSize) {
    size -= 1;
    setMimosaCanvasFont(context, size, weight);
  }
  return size;
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionLength, setSessionLength] = useState<SessionLength>(10);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentEmail = deck[round];
  const emailsReviewed = answers.length;
  const survived = answers.filter((answer) => answer.correct).length;
  const accuracy = emailsReviewed > 0 ? Math.round((survived / emailsReviewed) * 100) : 0;
  const rank = getRank(score, survived);
  const employmentStatus = getEmploymentStatus(mistakes, survived);
  const roundSeconds = getRoundTime(round);
  const currentEmailNumber = Math.min(round + 1, sessionLength);

  const notableIncident = useMemo(() => {
    const wrongAnswer = [...answers].reverse().find((answer) => !answer.correct);
    if (wrongAnswer) return wrongAnswer.feedback;
    const rightAnswer = answers.at(-1);
    return rightAnswer?.feedback ?? "Nobody saw the draft message. Probably.";
  }, [answers]);

  useEffect(() => {
    const storedBest = Number(window.localStorage.getItem(PERSONAL_BEST_KEY) ?? 0);
    if (Number.isFinite(storedBest)) setPersonalBest(storedBest);
    const storedSound = window.localStorage.getItem(SOUND_PREFERENCE_KEY);
    if (storedSound !== null) setSoundEnabled(storedSound === "on");
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
      playSoundEffect("game-over", soundEnabled);
      setScreen("results");
      if (finalScore > personalBest) {
        setPersonalBest(finalScore);
        window.localStorage.setItem(PERSONAL_BEST_KEY, String(finalScore));
      }
    },
    [personalBest, soundEnabled, stopTimer],
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

      playSoundEffect(correct ? "correct" : "wrong", soundEnabled);
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
    [currentEmail, deck.length, endGame, mistakes, round, score, screen, soundEnabled, stopTimer, timeLeft],
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
    playSoundEffect("open", soundEnabled);
    stopTimer();
    setDeck(shuffle(pleaseAdviseEmails).slice(0, sessionLength));
    setRound(0);
    setScore(0);
    setMistakes(0);
    setAnswers([]);
    setLastAnswer(null);
    setShareMessage("");
    setTimeLeft(STARTING_TIME);
    setScreen("playing");
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    window.localStorage.setItem(SOUND_PREFERENCE_KEY, next ? "on" : "off");
    if (next) playSoundEffect("button", true);
  };

  const createScorecardBlob = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Scorecard canvas could not be created.");

    await document.fonts?.ready;
    await document.fonts?.load('48px "Mimosa"');

    const drawContainedImage = (
      image: HTMLImageElement,
      x: number,
      y: number,
      width: number,
      height: number,
    ) => {
      const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      context.drawImage(
        image,
        x + (width - drawWidth) / 2,
        y + (height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
    };

    context.fillStyle = "#f7f0df";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the compact Lab wordmark directly on the canvas.
    // Using the full raster logo here caused a browser-specific black strip
    // to appear at the image boundary in some downloaded reports.
    context.textAlign = "center";
    context.textBaseline = "alphabetic";
    context.fillStyle = "#2f2a25";
    setMimosaCanvasFont(context, 48);
    context.fillText("nice little click", 520, 105);
    context.fillStyle = "#8b481c";
    setMimosaCanvasFont(context, 21, 800);
    context.fillText("LAB", 705, 104);
    context.textAlign = "left";

    context.fillStyle = "#d86f5b";
    setMimosaCanvasFont(context, 112);
    context.textAlign = "center";
    context.fillText("Please Advise", 540, 225);
    context.textAlign = "left";

    context.fillStyle = "#fffaf0";
    context.strokeStyle = "#dacdb8";
    context.lineWidth = 3;
    context.beginPath();
    context.roundRect(64, 265, 952, 980, 42);
    context.fill();
    context.stroke();

    context.fillStyle = "#657f74";
    setMimosaCanvasFont(context, 28, 700);
    context.fillText("EMPLOYMENT STATUS", 112, 345);

    context.fillStyle = "#2f2a25";
    setMimosaCanvasFont(context, 72);
    const statusLines = wrapCanvasText(context, employmentStatus, 590).slice(0, 2);
    statusLines.forEach((line, index) => context.fillText(line, 112, 420 + index * 66));

    context.save();
    context.translate(815, 360);
    context.rotate(-0.08);
    context.strokeStyle = "rgba(216, 111, 91, 0.6)";
    context.lineWidth = 5;
    context.setLineDash([14, 10]);
    context.strokeRect(0, 0, 150, 82);
    context.setLineDash([]);
    context.fillStyle = "rgba(216, 111, 91, 0.78)";
    setMimosaCanvasFont(context, 23, 800);
    context.textAlign = "center";
    context.fillText("REVIEWED", 75, 34);
    setMimosaCanvasFont(context, 20, 700);
    context.fillText("✓ CLICK", 75, 64);
    context.restore();
    context.textAlign = "left";

    context.fillStyle = "#d86f5b";
    setMimosaCanvasFont(context, 108, 800);
    context.fillText(score.toLocaleString(), 112, 585);
    context.fillStyle = "#756b60";
    setMimosaCanvasFont(context, 27, 600);
    context.fillText("POINTS", 116, 627);

    try {
      const clickImage = await loadCanvasImage("/images/click/Click-Profile.png");
      context.save();
      context.beginPath();
      context.arc(858, 562, 104, 0, Math.PI * 2);
      context.clip();
      context.fillStyle = "#f7f0df";
      context.fillRect(754, 458, 208, 208);
      drawContainedImage(clickImage, 754, 458, 208, 208);
      context.restore();
      context.strokeStyle = "#dacdb8";
      context.lineWidth = 4;
      context.beginPath();
      context.arc(858, 562, 106, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = "#756b60";
      setMimosaCanvasFont(context, 21, 600);
      context.textAlign = "center";
      context.fillText("Reviewed by Click", 858, 696);
      setMimosaCanvasFont(context, 18, 500);
      context.fillText("Office Quality Assurance", 858, 723);
      context.textAlign = "left";
    } catch {
      // The report remains downloadable even if the mascot asset cannot load.
    }

    const stats = [
      ["Final verdict", rank],
      ["Emails reviewed", String(emailsReviewed)],
      ["Correct decisions", String(survived)],
      ["Mistakes made", `${mistakes} / ${emailsReviewed}`],
      ["Accuracy", `${accuracy}%`],
      ["Personal best", Math.max(score, personalBest).toLocaleString()],
    ];

    stats.forEach(([label, value], index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = column === 0 ? 116 : 575;
      const valueX = column === 0 ? 500 : 950;
      const y = 785 + row * 82;

      context.fillStyle = "#756b60";
      setMimosaCanvasFont(context, 22, 600);
      context.fillText(label, x, y);
      context.fillStyle = "#2f2a25";
      context.textAlign = "right";
      const valueStartX = x + 160;
      fitMimosaCanvasText(
        context,
        value,
        Math.max(120, valueX - valueStartX),
        27,
        17,
        700,
      );
      context.fillText(value, valueX, y);
      context.textAlign = "left";

      context.strokeStyle = "#e3d8c6";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(x, y + 20);
      context.lineTo(valueX, y + 20);
      context.stroke();
    });

    context.fillStyle = "#fffaf0";
    context.strokeStyle = "#d9cdb9";
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(102, 1035, 876, 150, 22);
    context.fill();
    context.stroke();

    context.fillStyle = "#657f74";
    setMimosaCanvasFont(context, 23, 800);
    context.fillText("CLICK'S NOTES", 140, 1082);

    context.fillStyle = "#2f2a25";
    setMimosaCanvasFont(context, 27, 600);
    const incidentLines = wrapCanvasText(context, notableIncident, 790).slice(0, 3);
    incidentLines.forEach((line, index) => context.fillText(line, 140, 1125 + index * 34));

    context.fillStyle = "#657f74";
    setMimosaCanvasFont(context, 26, 700);
    context.fillText("nicelittleclick.com", 84, 1302);
    context.textAlign = "right";
    context.fillText("Run by Click. Supervised loosely.", 996, 1302);
    context.textAlign = "left";

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Scorecard image could not be generated."));
      }, "image/png");
    });
  };

  const downloadScorecard = async () => {
    playSoundEffect("button", soundEnabled);
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
    playSoundEffect("button", soundEnabled);
    const text = `I scored ${score.toLocaleString()} points in Please Advise, reviewed ${emailsReviewed} emails, and finished with “${employmentStatus}.” Can you beat me?`;

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
    <div
      className={`${styles.clickPortrait} ${styles[mood]}`}
      aria-label={`Click looks ${mood}.`}
    >
      <Image
        src="/images/click/Click-Profile.png"
        alt="Click, the Nice Little Click Lab mascot, wearing goggles and a cursor tag"
        width={640}
        height={640}
        className={styles.clickPortraitImage}
        priority={screen === "start"}
      />
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

            <fieldset className={styles.sessionPicker}>
              <legend>How long is this shift?</legend>
              <div>
                {SESSION_LENGTHS.map((length) => (
                  <button
                    key={length}
                    type="button"
                    className={sessionLength === length ? styles.sessionChoiceActive : ""}
                    onClick={() => setSessionLength(length)}
                    aria-pressed={sessionLength === length}
                  >
                    <strong>{length} emails</strong>
                    <span>{length === 10 ? "A quick inbox emergency" : "The full office experience"}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <button className={styles.primaryButton} type="button" onClick={startGame}>
              Open the inbox
            </button>
            <button className={`${styles.soundToggle} ${styles.startSoundToggle}`} type="button" onClick={toggleSound} aria-pressed={soundEnabled}>
              <span aria-hidden="true">{soundEnabled ? "🔊" : "🔇"}</span>
              Sound {soundEnabled ? "on" : "off"}
            </button>
            <p className={styles.smallPrint}>{sessionLength} emails. Three mistakes and HR would like a word.</p>
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
            <div>
              <div className={styles.hud}>
                <div><span>Time</span><strong className={timeLeft < 2.5 ? styles.dangerText : ""}>{timeLeft.toFixed(1)}</strong></div>
                <div><span>Email</span><strong>{currentEmailNumber}/{sessionLength}</strong></div>
                <div><span>Mistakes</span><strong>{mistakes}/{MAX_MISTAKES}</strong></div>
                <div><span>Score</span><strong>{score.toLocaleString()}</strong></div>
              </div>
              <button className={styles.soundToggle} type="button" onClick={toggleSound} aria-pressed={soundEnabled}>
                <span aria-hidden="true">{soundEnabled ? "🔊" : "🔇"}</span>
                Sound {soundEnabled ? "on" : "off"}
              </button>
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
                <strong>{lastAnswer.correct ? "Good call." : "Oh, dear."}</strong>
                <span>{lastAnswer.feedback}</span>
              </>
            ) : (
              <span>Tip: Picture the exact people who need this. Everyone else deserves peace.</span>
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
            <div className={styles.reportStamp} aria-hidden="true">
              <span>Reviewed</span>
              <strong>✓ Click</strong>
            </div>

            <div className={styles.reportHero}>
              <div>
                <p className={styles.statusLabel}>Employment status</p>
                <h2>{employmentStatus}</h2>
                <div className={styles.rankBadge}>
                  <span>Final verdict</span>
                  <strong>{rank}</strong>
                </div>
              </div>

              <div className={styles.reportClick}>
                {renderClick(mistakes < 2 ? "proud" : "calm")}
                <span>Reviewed by Click</span>
                <small>Office Quality Assurance</small>
              </div>
            </div>

            <div className={styles.scoreRow}>
              <div className={styles.scoreBlock}>
                <span>Your score</span>
                <strong>{score.toLocaleString()}</strong>
                <small>points</small>
              </div>

              <dl className={styles.reportStats}>
                <div><dt>Emails reviewed</dt><dd>{emailsReviewed}</dd></div>
                <div><dt>Correct decisions</dt><dd>{survived}</dd></div>
                <div><dt>Mistakes made</dt><dd>{mistakes} / {emailsReviewed}</dd></div>
                <div><dt>Accuracy</dt><dd>{accuracy}%</dd></div>
                <div><dt>Personal best</dt><dd>{Math.max(score, personalBest).toLocaleString()}</dd></div>
              </dl>
            </div>

            <div className={styles.clickNotes}>
              <strong>Click&apos;s Notes</strong>
              <p>{notableIncident}</p>
            </div>

            <div className={styles.resultsActions}>
              <button type="button" onClick={startGame}>↻ Play Again</button>
              <button className={styles.shareButton} type="button" onClick={shareResult}>↗ Share Results</button>
              <button className={styles.downloadButton} type="button" onClick={downloadScorecard}>↓ Download Report</button>
            </div>

            <p className={styles.shareStatus} aria-live="polite">
              {shareMessage || "Nobody saw the draft message. Probably."}
            </p>

            <div className={styles.resultsSoundToggle}>
              <button className={styles.soundToggle} type="button" onClick={toggleSound} aria-pressed={soundEnabled}>
                <span aria-hidden="true">{soundEnabled ? "🔊" : "🔇"}</span>
                Sound {soundEnabled ? "on" : "off"}
              </button>
            </div>

            <footer className={styles.reportFooter}>
              <span>nicelittleclick.com</span>
              <span>Run by Click. Supervised loosely.</span>
            </footer>
          </div>
        </section>
      )}
    </main>
  );
}
