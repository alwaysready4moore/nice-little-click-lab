"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import styles from "./should-email.module.css";

type Mode = "before" | "after";
type AnswerScore = 0 | 1 | 2;
type Answers = Record<string, AnswerScore>;

type Question = {
  id: string;
  before: string;
  after: string;
  choices: readonly {
    label: string;
    score: AnswerScore;
  }[];
};

type Verdict = {
  stamp: string;
  title: string;
  summary: string;
  advice: string;
  tone: "meeting" | "trim" | "async" | "email";
};

const QUESTIONS: readonly Question[] = [
  {
    id: "live-discussion",
    before: "Will people need a real-time back-and-forth to make progress?",
    after: "Did people actually need a real-time back-and-forth?",
    choices: [
      { label: "Definitely", score: 0 },
      { label: "A little", score: 1 },
      { label: "Not really", score: 2 },
    ],
  },
  {
    id: "shared-decision",
    before: "Is there a decision the group needs to make together?",
    after: "Was there a decision the group needed to make together?",
    choices: [
      { label: "Yes", score: 0 },
      { label: "One person decides", score: 1 },
      { label: "No decision", score: 2 },
    ],
  },
  {
    id: "message-length",
    before: "Could the important information fit in a short, clear message?",
    after: "Could the important information have fit in a short, clear message?",
    choices: [
      { label: "No", score: 0 },
      { label: "Maybe", score: 1 },
      { label: "Easily", score: 2 },
    ],
  },
  {
    id: "participation",
    before: "Will everyone invited need to contribute?",
    after: "Did everyone invited need to contribute?",
    choices: [
      { label: "Yes", score: 0 },
      { label: "Some of them", score: 1 },
      { label: "Mostly observers", score: 2 },
    ],
  },
  {
    id: "purpose",
    before: "Is the purpose clear enough to explain in one sentence?",
    after: "Was the purpose clear before the meeting started?",
    choices: [
      { label: "Crystal clear", score: 0 },
      { label: "A bit fuzzy", score: 1 },
      { label: "Nope", score: 2 },
    ],
  },
  {
    id: "outcome",
    before: "Will the meeting end with a decision, owner, or concrete next step?",
    after: "Did the meeting create a decision, owner, or concrete next step?",
    choices: [
      { label: "Yes", score: 0 },
      { label: "Sort of", score: 1 },
      { label: "No", score: 2 },
    ],
  },
  {
    id: "participation-ratio",
    before: "Will most of the time be spent discussing rather than listening?",
    after: "Was most of the time spent discussing rather than listening?",
    choices: [
      { label: "Mostly discussing", score: 0 },
      { label: "Half and half", score: 1 },
      { label: "Mostly listening", score: 2 },
    ],
  },
] as const;

const MAX_SCORE = QUESTIONS.length * 2;

function getVerdict(score: number, mode: Mode): Verdict {
  if (score <= 3) {
    return {
      stamp: "CALENDAR APPROVED",
      title: mode === "before" ? "Keep the meeting." : "The meeting earned its keep.",
      summary:
        mode === "before"
          ? "This one appears to need people thinking together at the same time."
          : "This one needed people thinking together at the same time.",
      advice: "Send a short agenda anyway. Even worthy meetings appreciate boundaries.",
      tone: "meeting",
    };
  }

  if (score <= 6) {
    return {
      stamp: "TRIM THE INVITE",
      title: "A shorter meeting could work.",
      summary:
        mode === "before"
          ? "There is a reason to talk, but the calendar block may be doing too much."
          : "There was a reason to talk, but the calendar block did more work than necessary.",
      advice: "Send context first, invite only contributors, and cap the live part at 15 minutes.",
      tone: "trim",
    };
  }

  if (score <= 10) {
    return {
      stamp: "ASYNC FIRST",
      title: "Email first. Meet only if needed.",
      summary:
        mode === "before"
          ? "Most of this can travel in writing. Save a small huddle for the stubborn bits."
          : "Most of this could have traveled in writing, with a small huddle for the stubborn bits.",
      advice: "Use a clear subject line, three useful bullets, one owner, and a deadline.",
      tone: "async",
    };
  }

  return {
    stamp: "INBOX MATERIAL",
    title:
      mode === "before"
        ? "Yes. This should be an email."
        : "Yes. This should have been an email.",
    summary:
      mode === "before"
        ? "The proposed meeting appears to be a document wearing a calendar invite."
        : "That meeting appears to have been a document wearing a calendar invite.",
    advice: "Write the update, name the decision or ask, and give everyone their time back.",
    tone: "email",
  };
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });

  if (line) lines.push(line);
  return lines;
}

function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load image: ${src}`));
    image.src = src;
  });
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const lines = wrapCanvasText(context, text, maxWidth);
  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });
  return y + lines.length * lineHeight;
}

export function ShouldEmailTool() {
  const [mode, setMode] = useState<Mode>("after");
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "working" | "error"
  >("idle");
  const [shareMessage, setShareMessage] = useState("");

  const answeredCount = Object.keys(answers).length;
  const score = useMemo(
    () =>
      Object.values(answers).reduce<number>(
        (total, answer) => total + answer,
        0,
      ),
    [answers],
  );
  const emailLikelihood = Math.round((score / MAX_SCORE) * 100);
  const verdict = getVerdict(score, mode);

  const chooseMode = (nextMode: Mode) => {
    setMode(nextMode);
    setAnswers({});
    setShowResult(false);
    setShareMessage("");
  };

  const chooseAnswer = (questionId: string, answer: AnswerScore) => {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
    setShowResult(false);
    setShareMessage("");
  };

  const revealVerdict = () => {
    if (answeredCount !== QUESTIONS.length) return;
    setShowResult(true);
    setShareMessage("");
    window.requestAnimationFrame(() => {
      document
        .getElementById("meeting-verdict")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const reset = () => {
    setAnswers({});
    setShowResult(false);
    setShareMessage("");
    window.requestAnimationFrame(() => {
      document
        .getElementById("meeting-test")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const resultText = `${verdict.title} ${verdict.summary} Email likelihood: ${emailLikelihood}%.`;

  const shareVerdict = async () => {
    const shareData = {
      title: "Should This Have Been an Email?",
      text: resultText,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage("Verdict shared.");
        return;
      }

      await navigator.clipboard.writeText(`${resultText} ${window.location.href}`);
      setShareMessage("Verdict copied to your clipboard.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareMessage("Could not share automatically. The download button still works.");
    }
  };

  const downloadVerdict = async () => {
    setDownloadStatus("working");

    try {
      await Promise.all([
        document.fonts.load('400 64px "Favorite Child"'),
        document.fonts.load('400 72px "Mimosa"'),
      ]);

      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1500;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable.");

      context.fillStyle = "#f7f1e7";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = "#f4dfbb";
      context.beginPath();
      context.arc(1080, 120, 240, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = "#fffaf2";
      context.strokeStyle = "#c9b38e";
      context.lineWidth = 3;
      context.beginPath();
      context.roundRect(76, 72, 1048, 1356, 42);
      context.fill();
      context.stroke();

      context.fillStyle = "#8b481c";
      context.font = '400 34px "Favorite Child", "Segoe Print", cursive';
      context.fillText("NICE LITTLE CLICK LAB · CLICK NO. 005", 126, 142);

      context.fillStyle = "#27231f";
      context.font = '900 55px Inter, system-ui, sans-serif';
      const header = mode === "before" ? "SHOULD THIS BE AN EMAIL?" : "SHOULD THIS HAVE BEEN AN EMAIL?";
      drawWrappedText(context, header, 126, 225, 880, 62);

      context.save();
      context.translate(957, 284);
      context.rotate(-0.07);
      context.strokeStyle = "#b75c43";
      context.lineWidth = 5;
      context.setLineDash([12, 9]);
      context.strokeRect(-122, -42, 244, 84);
      context.setLineDash([]);
      context.fillStyle = "#b75c43";
      context.textAlign = "center";
      context.font = '800 22px Inter, system-ui, sans-serif';
      context.fillText(verdict.stamp, 0, 8);
      context.restore();

      context.fillStyle = "#8b481c";
      context.font = '400 76px "Mimosa", "Segoe Print", cursive';
      const verdictBottom = drawWrappedText(
        context,
        verdict.title,
        126,
        430,
        840,
        82,
      );

      context.fillStyle = "#6e665d";
      context.font = '500 31px Inter, system-ui, sans-serif';
      const summaryBottom = drawWrappedText(
        context,
        verdict.summary,
        126,
        verdictBottom + 36,
        820,
        46,
      );

      const meterY = summaryBottom + 62;
      context.fillStyle = "#27231f";
      context.font = '850 24px Inter, system-ui, sans-serif';
      context.fillText("EMAIL LIKELIHOOD", 126, meterY);
      context.textAlign = "right";
      context.fillText(`${emailLikelihood}%`, 1032, meterY);
      context.textAlign = "left";

      context.fillStyle = "#e8ded0";
      context.beginPath();
      context.roundRect(126, meterY + 25, 906, 34, 17);
      context.fill();
      context.fillStyle = "#dfa85d";
      context.beginPath();
      context.roundRect(
        126,
        meterY + 25,
        Math.max(20, (906 * emailLikelihood) / 100),
        34,
        17,
      );
      context.fill();

      context.fillStyle = "#f4dfbb";
      context.beginPath();
      context.roundRect(126, meterY + 105, 906, 230, 28);
      context.fill();
      context.fillStyle = "#8b481c";
      context.font = '400 30px "Favorite Child", "Segoe Print", cursive';
      context.fillText("BETTER NEXT TIME", 166, meterY + 160);
      context.fillStyle = "#27231f";
      context.font = '650 30px Inter, system-ui, sans-serif';
      drawWrappedText(context, verdict.advice, 166, meterY + 215, 820, 44);

      try {
        const click = await loadCanvasImage("/images/click/click-awake-receipt.png");
        const targetWidth = 190;
        const targetHeight = (click.height / click.width) * targetWidth;
        context.drawImage(click, 826, 1050, targetWidth, targetHeight);
      } catch {
        // The verdict remains useful if the decorative mascot image cannot load.
      }

      context.fillStyle = "#6e665d";
      context.font = '600 22px Inter, system-ui, sans-serif';
      context.fillText("No account. No data saved. Just one small calendar judgment.", 126, 1370);
      context.fillStyle = "#8b481c";
      context.font = '400 28px "Mimosa", "Segoe Print", cursive';
      context.fillText("nicelittleclick.com", 126, 1415);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => {
          if (value) resolve(value);
          else reject(new Error("Could not create the verdict image."));
        }, "image/png");
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "should-this-have-been-an-email-verdict.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDownloadStatus("idle");
    } catch {
      setDownloadStatus("error");
    }
  };

  return (
    <section className={styles.shell}>
      <div className={styles.hero}>
        <div>
          <p className="click-number">CLICK NO. 005 · FREE</p>
          <h1 className={styles.title}>Should This Have Been an Email?</h1>
          <p className={styles.intro}>
            Answer seven mildly incriminating questions. Click will issue a
            calendar verdict with no meeting required.
          </p>
        </div>

        <div className={styles.heroNote} aria-hidden="true">
          <span>MEETING REVIEW</span>
          <strong>Zero attendees</strong>
          <small>Already efficient.</small>
        </div>
      </div>

      <div id="meeting-test" className={styles.toolGrid}>
        <section className={styles.questionCard} aria-labelledby="test-heading">
          <div className={styles.cardHeader}>
            <div>
              <p className={styles.eyebrow}>Choose your timing</p>
              <h2 id="test-heading">
                {mode === "before" ? "Save the calendar invite." : "Review the evidence."}
              </h2>
            </div>
            <span className={styles.progressPill}>
              {answeredCount}/{QUESTIONS.length} answered
            </span>
          </div>

          <div className={styles.modeSwitch} role="group" aria-label="Meeting timing">
            <button
              type="button"
              className={mode === "before" ? styles.modeActive : ""}
              aria-pressed={mode === "before"}
              onClick={() => chooseMode("before")}
            >
              Before it starts
            </button>
            <button
              type="button"
              className={mode === "after" ? styles.modeActive : ""}
              aria-pressed={mode === "after"}
              onClick={() => chooseMode("after")}
            >
              After it ended
            </button>
          </div>

          <div className={styles.progressTrack} aria-hidden="true">
            <span style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }} />
          </div>

          <div className={styles.questions}>
            {QUESTIONS.map((question, index) => (
              <fieldset className={styles.question} key={question.id}>
                <legend>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {mode === "before" ? question.before : question.after}
                </legend>

                <div className={styles.answerGrid}>
                  {question.choices.map((choice) => {
                    const isSelected = answers[question.id] === choice.score;
                    return (
                      <button
                        type="button"
                        key={choice.label}
                        className={isSelected ? styles.answerSelected : ""}
                        aria-pressed={isSelected}
                        onClick={() => chooseAnswer(question.id, choice.score)}
                      >
                        {choice.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <div className={styles.revealRow}>
            <button
              type="button"
              className="lab-button lab-button-primary"
              disabled={answeredCount !== QUESTIONS.length}
              onClick={revealVerdict}
            >
              Issue the verdict
            </button>
            <p>
              {answeredCount === QUESTIONS.length
                ? "The evidence is complete."
                : `${QUESTIONS.length - answeredCount} question${QUESTIONS.length - answeredCount === 1 ? "" : "s"} left.`}
            </p>
          </div>
        </section>

        <aside className={styles.sideCard}>
          <div className={styles.sideStamp}>NO PRE-READ REQUIRED</div>
          <Image
            src="/images/click/click-writing.webp"
            alt="Click writing down the meeting evidence"
            width={420}
            height={320}
            className={styles.clickImage}
          />
          <h2>Click is taking notes.</h2>
          <p>
            Your answers stay in this browser. Nothing is saved, sent to AI, or
            added to a mysterious leadership deck.
          </p>
          <div className={styles.sideRule}>
            <strong>Useful rule of paw:</strong>
            <span>
              If people only need to receive information, start with writing.
              If they need to shape it together, make room to talk.
            </span>
          </div>
        </aside>
      </div>

      {showResult ? (
        <section
          id="meeting-verdict"
          className={`${styles.resultSection} ${styles[verdict.tone]}`}
          aria-live="polite"
        >
          <div className={styles.resultCard}>
            <div className={styles.resultTopline}>
              <p>{mode === "before" ? "PRE-MEETING CHECK" : "POST-MEETING AUTOPSY"}</p>
              <span>{verdict.stamp}</span>
            </div>

            <div className={styles.resultBody}>
              <div>
                <p className={styles.resultLabel}>Final verdict</p>
                <h2>{verdict.title}</h2>
                <p className={styles.resultSummary}>{verdict.summary}</p>
              </div>

              <Image
                src="/images/click/click-awake-receipt.png"
                alt="Click presenting the meeting verdict"
                width={310}
                height={260}
                className={styles.resultClick}
              />
            </div>

            <div className={styles.scorePanel}>
              <div className={styles.scoreHeading}>
                <span>Email likelihood</span>
                <strong>{emailLikelihood}%</strong>
              </div>
              <div className={styles.scoreTrack} aria-hidden="true">
                <span style={{ width: `${emailLikelihood}%` }} />
              </div>
              <p>{verdict.advice}</p>
            </div>

            <div className={styles.resultActions}>
              <button
                type="button"
                className="lab-button lab-button-primary"
                onClick={downloadVerdict}
                disabled={downloadStatus === "working"}
              >
                {downloadStatus === "working"
                  ? "Preparing image…"
                  : "Download verdict"}
              </button>
              <button
                type="button"
                className="lab-button lab-button-secondary"
                onClick={shareVerdict}
              >
                Share verdict
              </button>
              <button
                type="button"
                className={styles.resetButton}
                onClick={reset}
              >
                Judge another meeting
              </button>
            </div>

            {shareMessage ? <p className={styles.statusMessage}>{shareMessage}</p> : null}
            {downloadStatus === "error" ? (
              <p className={styles.errorMessage}>
                The image would not download this time. Your verdict is still safe on screen.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <p className={styles.disclaimer}>
        This Click is a playful meeting-design prompt, not a substitute for your
        workplace policies, accessibility needs, or professional judgment.
      </p>
    </section>
  );
}
