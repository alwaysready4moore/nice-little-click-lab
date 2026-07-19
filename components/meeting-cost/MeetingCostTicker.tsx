"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ROLE_SALARIES } from "@/data/role-salaries";

type MeetingStatus = "ready" | "running" | "paused" | "ended";

type Participant = {
  id: string;
  role: string;
  annualSalary: number;
  quantity: number;
};

const WORK_HOURS_PER_YEAR = 2080;
const MAX_MEETING_MS = 8 * 60 * 60 * 1000;

const MEETING_PHRASES = [
  "Can everyone see my screen?",
  "Let’s circle back.",
  "Quick question…",
  "You’re on mute.",
  "Let’s take this offline.",
  "Can we double-click on that?",
  "Just a quick gut check.",
  "Let's put a pin in that.",
];

function createParticipant(index = 0, id?: string): Participant {
  const preset = ROLE_SALARIES[index % ROLE_SALARIES.length];
  return {
    id: id ?? globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    role: preset.role,
    annualSalary: preset.salary,
    quantity: 1,
  };
}

function calculateTeamHourlyCost(participants: Participant[]) {
  return participants.reduce(
    (total, participant) =>
      total +
      (Math.max(0, participant.annualSalary) / WORK_HOURS_PER_YEAR) *
        Math.max(1, participant.quantity),
    0,
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatElapsed(totalMilliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(totalMilliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => part.toString().padStart(2, "0"))
    .join(":");
}

function formatStartedAt(timestamp: number | null) {
  const date = timestamp ? new Date(timestamp) : new Date();

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export function MeetingCostTicker() {
  const initialParticipants = useMemo(() => [createParticipant(115, "participant-1")], []);
  const [meetingName, setMeetingName] = useState("Monday planning meeting");
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [status, setStatus] = useState<MeetingStatus>("ready");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [currentCost, setCurrentCost] = useState(0);
  const [meetingStartedAt, setMeetingStartedAt] = useState<number | null>(null);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

  const startedAtRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef(0);
  const accumulatedCostRef = useRef(0);
  const lastCostUpdateRef = useRef<number | null>(null);
  const teamHourlyCostRef = useRef(calculateTeamHourlyCost(initialParticipants));

  const teamHourlyCost = useMemo(() => calculateTeamHourlyCost(participants), [participants]);

  const attendeeCount = useMemo(
    () =>
      participants.reduce(
        (total, participant) => total + Math.max(1, participant.quantity),
        0,
      ),
    [participants],
  );

  const costPerMinute = teamHourlyCost / 60;

  useEffect(() => {
    teamHourlyCostRef.current = teamHourlyCost;
  }, [teamHourlyCost]);

  function settleRunningCost(now = Date.now()) {
    if (status !== "running" || lastCostUpdateRef.current === null) return;

    accumulatedCostRef.current +=
      (teamHourlyCostRef.current * (now - lastCostUpdateRef.current)) / 3_600_000;
    lastCostUpdateRef.current = now;
    setCurrentCost(accumulatedCostRef.current);
  }

  function finalizeMeeting(now = Date.now(), forcedElapsedMs?: number) {
    if (status === "running") {
      const startedAt = startedAtRef.current;
      settleRunningCost(now);

      if (startedAt !== null) {
        accumulatedMsRef.current =
          forcedElapsedMs ?? accumulatedMsRef.current + (now - startedAt);
      }
    } else if (typeof forcedElapsedMs === "number") {
      accumulatedMsRef.current = forcedElapsedMs;
    }

    startedAtRef.current = null;
    lastCostUpdateRef.current = null;
    setElapsedMs(accumulatedMsRef.current);
    setCurrentCost(accumulatedCostRef.current);
    setStatus("ended");
  }

  useEffect(() => {
    if (status !== "running") return;

    const updateTicker = () => {
      const now = Date.now();
      const startedAt = startedAtRef.current;
      const lastCostUpdate = lastCostUpdateRef.current;

      if (startedAt !== null) {
        const liveElapsed = accumulatedMsRef.current + (now - startedAt);

        if (liveElapsed >= MAX_MEETING_MS) {
          const capTime = startedAt + Math.max(0, MAX_MEETING_MS - accumulatedMsRef.current);
          finalizeMeeting(capTime, MAX_MEETING_MS);
          return;
        }

        setElapsedMs(liveElapsed);
      }

      if (lastCostUpdate !== null) {
        const liveCost =
          accumulatedCostRef.current +
          (teamHourlyCostRef.current * (now - lastCostUpdate)) / 3_600_000;
        setCurrentCost(liveCost);
      }
    };

    updateTicker();
    const intervalId = window.setInterval(updateTicker, 250);
    return () => window.clearInterval(intervalId);
  }, [status]);

  function updateParticipants(updater: (current: Participant[]) => Participant[]) {
    settleRunningCost();
    setParticipants((current) => {
      const next = updater(current);
      teamHourlyCostRef.current = calculateTeamHourlyCost(next);
      return next;
    });
  }

  function updateParticipant(id: string, patch: Partial<Omit<Participant, "id">>) {
    updateParticipants((current) =>
      current.map((participant) =>
        participant.id === id ? { ...participant, ...patch } : participant,
      ),
    );
  }

  function changeRole(id: string, role: string) {
    const preset = ROLE_SALARIES.find((item) => item.role === role);
    updateParticipant(id, {
      role,
      annualSalary: preset?.salary ?? 0,
    });
  }

  function addParticipant() {
    updateParticipants((current) => [...current, createParticipant(current.length)]);
  }

  function removeParticipant(id: string) {
    updateParticipants((current) =>
      current.length === 1 ? current : current.filter((participant) => participant.id !== id),
    );
  }

  function startMeeting() {
    const now = Date.now();
    accumulatedMsRef.current = elapsedMs;
    startedAtRef.current = now;
    lastCostUpdateRef.current = now;
    if (meetingStartedAt === null) {
      setMeetingStartedAt(now);
    }
    setStatus("running");
  }

  function pauseMeeting() {
    const now = Date.now();
    const startedAt = startedAtRef.current;

    settleRunningCost(now);
    if (startedAt !== null) {
      accumulatedMsRef.current += now - startedAt;
      setElapsedMs(accumulatedMsRef.current);
    }

    startedAtRef.current = null;
    lastCostUpdateRef.current = null;
    setStatus("paused");
  }

  function endMeeting() {
    finalizeMeeting(Date.now());
  }

  function resetMeeting() {
    startedAtRef.current = null;
    accumulatedMsRef.current = 0;
    accumulatedCostRef.current = 0;
    lastCostUpdateRef.current = null;
    setElapsedMs(0);
    setCurrentCost(0);
    setMeetingStartedAt(null);
    setStatus("ready");
  }

  async function downloadReceipt() {
    if (typeof window === "undefined") return;

    setIsDownloadingReceipt(true);

    try {
      if ("fonts" in document) {
        await document.fonts.ready;
      }

      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1600;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const receiptClick = await loadImage("/images/click/click-awake-receipt.png").catch(
        () => null,
      );

      const w = canvas.width;
      const h = canvas.height;
      const pad = 72;
      const contentRight = w - pad;
      const lineColor = "rgba(139, 72, 28, 0.16)";
      const borderColor = "#d7b27a";
      const paper = "#fbf6ec";
      const ink = "#27231f";
      const muted = "#756d64";
      const accent = "#a45e24";

      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(164, 94, 36, 0.055)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      ctx.setLineDash([10, 8]);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(20, 20, w - 40, h - 40, 28);
      ctx.stroke();
      ctx.setLineDash([]);

      // header left
      ctx.fillStyle = accent;
      ctx.font = '700 26px "Favorite Child", "Segoe UI", sans-serif';
      ctx.fillText("NICE LITTLE CLICK LAB", pad, 96);

      ctx.fillStyle = ink;
      ctx.font = '800 60px Inter, Arial, sans-serif';
      ctx.fillText("Meeting receipt", pad, 168);

      ctx.fillStyle = muted;
      ctx.font = '400 26px "Mimosa", "Segoe Print", cursive';
      ctx.fillText("Every second counts. Literally.", pad, 212);

      // compact scene card on the right
      const sceneW = 430;
      const sceneH = 270;
      const sceneX = contentRight - sceneW;
      const sceneY = 82;
      ctx.fillStyle = "rgba(255,255,255,0.76)";
      ctx.beginPath();
      ctx.roundRect(sceneX, sceneY, sceneW, sceneH, 26);
      ctx.fill();
      ctx.strokeStyle = lineColor;
      ctx.stroke();

      const inset = 20;
      ctx.fillStyle = "#f6ebdc";
      ctx.beginPath();
      ctx.roundRect(sceneX + inset, sceneY + inset, sceneW - inset * 2, sceneH - inset * 2, 20);
      ctx.fill();

      // mini room illustration
      ctx.fillStyle = "#bcd2d3";
      ctx.fillRect(sceneX + 28, sceneY + 34, 92, 58);
      ctx.strokeStyle = "rgba(70, 92, 92, 0.24)";
      ctx.beginPath();
      ctx.moveTo(sceneX + 74, sceneY + 34);
      ctx.lineTo(sceneX + 74, sceneY + 92);
      ctx.stroke();
      ctx.strokeStyle = "#fffaf1";
      ctx.lineWidth = 6;
      ctx.strokeRect(sceneX + 26, sceneY + 32, 96, 62);
      ctx.lineWidth = 1;

      ctx.fillStyle = "#cbb18d";
      ctx.fillRect(sceneX + 20, sceneY + sceneH - 76, sceneW - 40, 40);
      ctx.fillStyle = "#876750";
      ctx.beginPath();
      ctx.ellipse(sceneX + 122, sceneY + 157, 120, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      const smallPeople = Math.min(Math.max(attendeeCount, 3), 4);
      const colors = ["#738b82", "#bd8769", "#8b7f9b", "#b39d63"];
      for (let index = 0; index < smallPeople; index += 1) {
        const px = sceneX + 92 + index * 54;
        const py = sceneY + 153;
        ctx.fillStyle = colors[index % colors.length];
        ctx.beginPath();
        ctx.ellipse(px, py, 13, 19, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py - 22, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      if (receiptClick) {
        ctx.drawImage(receiptClick, sceneX + 248, sceneY + 52, 136, 192);
      }

      ctx.fillStyle = "rgba(255,255,255,0.98)";
      ctx.beginPath();
      ctx.roundRect(sceneX + 24, sceneY + 98, 168, 48, 18);
      ctx.fill();
      ctx.strokeStyle = lineColor;
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.font = '700 18px Inter, Arial, sans-serif';
      ctx.fillText("One quick thing...", sceneX + 44, sceneY + 128);

      // divider below header block
      ctx.strokeStyle = borderColor;
      ctx.beginPath();
      ctx.moveTo(pad, 304);
      ctx.lineTo(contentRight, 304);
      ctx.stroke();

      const rows = [
        ["Meeting", meetingName.trim() || "Untitled meeting"],
        ["Started", formatStartedAt(meetingStartedAt)],
        ["Duration", formatElapsed(elapsedMs)],
        ["Attendees", attendeeCount.toString()],
        ["Team cost per hour", formatMoney(teamHourlyCost)],
        ["Total estimated cost", formatMoney(currentCost)],
      ];

      let rowY = 384;
      ctx.textBaseline = "middle";
      rows.forEach(([label, value]) => {
        ctx.strokeStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(pad, rowY + 36);
        ctx.lineTo(contentRight, rowY + 36);
        ctx.stroke();

        ctx.fillStyle = muted;
        ctx.font = '400 24px Inter, Arial, sans-serif';
        ctx.fillText(label, pad, rowY);
        ctx.fillStyle = ink;
        ctx.font = '700 28px Inter, Arial, sans-serif';
        const metrics = ctx.measureText(value);
        ctx.fillText(value, contentRight - metrics.width, rowY);
        rowY += 72;
      });

      ctx.fillStyle = accent;
      ctx.font = '700 24px "Favorite Child", "Segoe UI", sans-serif';
      ctx.fillText("ATTENDEE BREAKDOWN", pad, rowY + 28);

      rowY += 70;
      participants.forEach((participant) => {
        ctx.strokeStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(pad, rowY + 42);
        ctx.lineTo(contentRight, rowY + 42);
        ctx.stroke();

        const label = `${participant.role} × ${participant.quantity}`;
        const value = `${formatMoney(participant.annualSalary).replace(/\.00$/, "")} annual salary`;
        ctx.fillStyle = ink;
        ctx.font = '700 26px Inter, Arial, sans-serif';
        ctx.fillText(label, pad, rowY);
        ctx.fillStyle = muted;
        ctx.font = '400 22px Inter, Arial, sans-serif';
        const metrics = ctx.measureText(value);
        ctx.fillText(value, contentRight - metrics.width, rowY);
        rowY += 62;
      });

      const footerY = h - 124;
      ctx.fillStyle = muted;
      ctx.font = '400 22px Inter, Arial, sans-serif';
      ctx.fillText(
        `Estimate based on annual salary ÷ ${WORK_HOURS_PER_YEAR.toLocaleString()} working hours.`,
        pad,
        footerY,
      );
      ctx.fillText("Nothing entered was saved or sent anywhere.", pad, footerY + 34);

      ctx.fillStyle = accent;
      ctx.font = '400 28px "Mimosa", "Segoe Print", cursive';
      ctx.fillText("nicelittleclick.com", pad, h - 54);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${sanitizeFileName(meetingName || "meeting") || "meeting"}-receipt.png`;
      link.click();
    } finally {
      setIsDownloadingReceipt(false);
    }
  }


  const fieldsLocked = status === "ended";
  const visiblePeople = Math.min(attendeeCount, 8);
  const speechCycle = Math.floor(elapsedMs / 6000);
  const showSpeechBubbles = status === "running" && elapsedMs >= 4000;
  const visibleSpeechBubbles = showSpeechBubbles
    ? Array.from({ length: 1 + (speechCycle % 3) }, (_, index) => ({
        phrase: MEETING_PHRASES[(speechCycle + index * 2) % MEETING_PHRASES.length],
        position: (speechCycle + index * 2) % 6,
      }))
    : [];

  return (
    <div className="meeting-tool">
      <section className="meeting-setup lab-card" aria-labelledby="meeting-setup-title">
        <div className="meeting-section-heading">
          <div>
            <p className="lab-label">Meeting details</p>
            <h2 id="meeting-setup-title">Who is in the room?</h2>
          </div>
          <span className="meeting-count">
            {attendeeCount} {attendeeCount === 1 ? "attendee" : "attendees"}
          </span>
        </div>

        <label className="meeting-field">
          <span>
            Meeting name <small>(optional)</small>
          </span>
          <input
            className="lab-input"
            type="text"
            value={meetingName}
            onChange={(event) => setMeetingName(event.target.value)}
            placeholder="Monday planning meeting"
            disabled={fieldsLocked}
          />
        </label>

        <div className="participant-list" aria-label="Meeting attendees">
          {participants.map((participant, index) => (
            <article className="participant-card" key={participant.id}>
              <div className="participant-card-topline">
                <h3>Attendee group {index + 1}</h3>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => removeParticipant(participant.id)}
                  disabled={participants.length === 1 || fieldsLocked}
                  aria-label={`Remove attendee group ${index + 1}`}
                >
                  Remove
                </button>
              </div>

              <div className="participant-fields">
                <label className="meeting-field">
                  <span>Job title</span>
                  <select
                    className="lab-input"
                    value={participant.role}
                    onChange={(event) => changeRole(participant.id, event.target.value)}
                    disabled={fieldsLocked}
                  >
                    {ROLE_SALARIES.map((item) => (
                      <option value={item.role} key={item.role}>
                        {item.role}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="meeting-field">
                  <span>Annual salary</span>
                  <div className="money-input">
                    <span aria-hidden="true">$</span>
                    <input
                      className="lab-input"
                      type="text"
                      inputMode="numeric"
                      value={participant.annualSalary.toLocaleString("en-US")}
                      onChange={(event) => {
                        const digitsOnly = event.target.value.replace(/\D/g, "");
                        updateParticipant(participant.id, {
                          annualSalary: Math.max(0, Number(digitsOnly || 0)),
                        });
                      }}
                      disabled={fieldsLocked}
                      aria-label={`Annual salary for ${participant.role}`}
                    />
                  </div>
                </label>

                <label className="meeting-field">
                  <span>People</span>
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        updateParticipant(participant.id, {
                          quantity: Math.max(1, participant.quantity - 1),
                        })
                      }
                      disabled={participant.quantity <= 1 || fieldsLocked}
                      aria-label={`Decrease number of ${participant.role} attendees`}
                    >
                      −
                    </button>
                    <output aria-live="polite">{participant.quantity}</output>
                    <button
                      type="button"
                      onClick={() =>
                        updateParticipant(participant.id, {
                          quantity: Math.min(99, participant.quantity + 1),
                        })
                      }
                      disabled={participant.quantity >= 99 || fieldsLocked}
                      aria-label={`Increase number of ${participant.role} attendees`}
                    >
                      +
                    </button>
                  </div>
                </label>
              </div>
            </article>
          ))}
        </div>

        <button
          className="lab-button lab-button-secondary add-attendee-button"
          type="button"
          onClick={addParticipant}
          disabled={fieldsLocked}
        >
          + Add attendee group
        </button>

        <p className="salary-note">
          Salary estimates are editable U.S. defaults. Add, remove, or update attendees while the meeting runs. Meetings automatically stop after eight hours. Nothing you enter is saved or sent anywhere.
        </p>
      </section>

      <section className={`ticker-card ticker-${status}`} aria-labelledby="ticker-title">
        <div className="ticker-topline">
          <div>
            <p className="lab-label">Live estimate</p>
            <h2 id="ticker-title">{meetingName.trim() || "Your meeting"}</h2>
          </div>
          <span className="ticker-status" aria-live="polite">
            {status === "ready" && "Ready"}
            {status === "running" && "Running"}
            {status === "paused" && "Paused"}
            {status === "ended" && "Complete"}
          </span>
        </div>

        <div className="ticker-display" aria-live="off">
          <p>Estimated meeting cost</p>
          <output className="ticker-money" aria-label={`${formatMoney(currentCost)} estimated meeting cost`}>
            {formatMoney(currentCost)}
          </output>
          <output className="ticker-time" aria-label={`${formatElapsed(elapsedMs)} elapsed`}>
            {formatElapsed(elapsedMs)}
          </output>
        </div>

        <div className={`meeting-room room-${status}`} aria-hidden="true">
          <div className="meeting-room-window">
            <span />
            <span />
          </div>
          <div className="meeting-room-table">
            {Array.from({ length: visiblePeople }).map((_, index) => (
              <span className={`meeting-person meeting-person-${(index % 6) + 1}`} key={index} />
            ))}
          </div>
          <div className="meeting-speech-layer">
            {visibleSpeechBubbles.map((bubble, index) => (
              <p
                className={`meeting-speech-bubble meeting-speech-bubble-${bubble.position}`}
                key={`${speechCycle}-${index}-${bubble.phrase}`}
              >
                {bubble.phrase}
              </p>
            ))}
          </div>
          <div className="meeting-room-click">
            <Image
              src="/images/click/click-sleeping-labcoat.webp"
              alt=""
              width={250}
              height={188}
              sizes="(max-width: 640px) 88px, 102px"
            />
          </div>
        </div>

        <dl className="ticker-stats">
          <div>
            <dt>Cost per minute</dt>
            <dd>{formatMoney(costPerMinute)}</dd>
          </div>
          <div>
            <dt>Team cost per hour</dt>
            <dd>{formatMoney(teamHourlyCost)}</dd>
          </div>
          <div>
            <dt>People in meeting</dt>
            <dd>{attendeeCount}</dd>
          </div>
        </dl>

        <div className="ticker-controls">
          {status === "ready" && (
            <button className="lab-button lab-button-primary" type="button" onClick={startMeeting}>
              Start meeting
            </button>
          )}
          {status === "running" && (
            <>
              <button className="lab-button lab-button-primary" type="button" onClick={pauseMeeting}>
                Pause
              </button>
              <button className="lab-button lab-button-secondary" type="button" onClick={endMeeting}>
                End meeting
              </button>
            </>
          )}
          {status === "paused" && (
            <>
              <button className="lab-button lab-button-primary" type="button" onClick={startMeeting}>
                Resume
              </button>
              <button className="lab-button lab-button-secondary" type="button" onClick={endMeeting}>
                End meeting
              </button>
            </>
          )}
          {status === "ended" && (
            <>
              <button
                className="lab-button lab-button-primary"
                type="button"
                onClick={downloadReceipt}
                disabled={isDownloadingReceipt}
              >
                {isDownloadingReceipt ? "Preparing receipt…" : "Download receipt"}
              </button>
              <button className="lab-button lab-button-secondary" type="button" onClick={resetMeeting}>
                Start another meeting
              </button>
            </>
          )}
        </div>

        {status === "ended" && (
          <div className="meeting-receipt">
            <p className="lab-label">Meeting summary</p>
            <dl>
              <div>
                <dt>Meeting</dt>
                <dd>{meetingName.trim() || "Your meeting"}</dd>
              </div>
              <div>
                <dt>Started</dt>
                <dd>{formatStartedAt(meetingStartedAt)}</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{formatElapsed(elapsedMs)}</dd>
              </div>
              <div>
                <dt>Attendees</dt>
                <dd>{attendeeCount}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{formatMoney(currentCost)}</dd>
              </div>
            </dl>
          </div>
        )}

        <p className="ticker-footnote">
          Estimate based on annual salary ÷ {WORK_HOURS_PER_YEAR.toLocaleString()} working hours.
        </p>
      </section>
    </div>
  );
}
