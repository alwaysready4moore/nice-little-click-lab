import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { ShareCard } from "@/lib/share-card";

export const shareImageSize = { width: 1200, height: 630 };
export const shareImageContentType = "image/png";

const cream = "#FFF3D8";
const honey = "#F5C76B";
const evergreen = "#315F5B";
const sage = "#6FA7A3";
const terracotta = "#C96F59";
const charcoal = "#222222";

let assetsPromise: Promise<{
  display: Buffer;
  text: Buffer;
  mascot: string;
}> | undefined;

function loadAssets() {
  if (!assetsPromise) {
    const root = process.cwd();
    assetsPromise = Promise.all([
      readFile(path.join(root, "docs/brand/favorite-child.ttf")),
      readFile(path.join(root, "public/fonts/Mimosa.otf")),
      readFile(path.join(root, "public/images/click/click-sitting.png")),
    ]).then(([display, text, mascot]) => ({
      display,
      text,
      mascot: `data:image/png;base64,${mascot.toString("base64")}`,
    }));
  }
  return assetsPromise;
}

function titleSize(title: string) {
  if (title.length > 64) return 40;
  if (title.length > 46) return 46;
  if (title.length > 32) return 52;
  return 60;
}

function taglineSize(tagline: string) {
  if (tagline.length > 140) return 26;
  if (tagline.length > 100) return 28;
  return 30;
}

export function renderShareCard(card: ShareCard) {
  return loadAssets().then(({ display, text, mascot }) => {
    const heading = titleSize(card.title);
    const detail = taglineSize(card.tagline);

    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: "flex",
            flexDirection: "column",
            backgroundColor: cream,
            color: charcoal,
          }}
        >
          <div style={{ display: "flex", width: 1200, height: 548 }}>
            <div style={{ display: "flex", width: 470, height: 548, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: 48,
                  top: 78,
                  width: 372,
                  height: 372,
                  borderRadius: 186,
                  backgroundColor: honey,
                  border: `12px solid ${sage}`,
                  display: "flex",
                }}
              />
              {/* The sitting pose is an existing transparent mascot export. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mascot}
                alt=""
                width={430}
                height={447}
                style={{ position: "absolute", left: 22, top: 62 }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: 730,
                height: 548,
                padding: "48px 56px 28px 8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    fontFamily: "Favorite Child",
                    fontSize: 38,
                    color: charcoal,
                    lineHeight: 1,
                  }}
                >
                  nice little click
                </div>
                <div
                  style={{
                    fontFamily: "Mimosa",
                    fontSize: 20,
                    color: sage,
                    marginLeft: 14,
                    letterSpacing: 2,
                  }}
                >
                  LAB
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 18,
                  fontFamily: "Mimosa",
                  fontSize: 22,
                  letterSpacing: 1.5,
                  color: terracotta,
                }}
              >
                {card.eyebrow.toUpperCase()}
              </div>
              <div
                style={{
                  display: "flex",
                  width: 640,
                  marginTop: 12,
                  fontFamily: "Mimosa",
                  fontSize: heading,
                  lineHeight: 1.05,
                  color: charcoal,
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  display: "flex",
                  width: 640,
                  marginTop: 16,
                  fontFamily: "Mimosa",
                  fontSize: detail,
                  lineHeight: 1.3,
                  color: evergreen,
                }}
              >
                {card.tagline}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              width: 1200,
              height: 82,
              backgroundColor: evergreen,
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 48px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "Mimosa",
                fontSize: 22,
                color: cream,
              }}
            >
              {card.footer}
            </div>
            {card.badge ? (
              <div
                style={{
                  display: "flex",
                  backgroundColor: honey,
                  color: evergreen,
                  fontFamily: "Mimosa",
                  fontSize: 26,
                  lineHeight: 1,
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: `3px solid ${terracotta}`,
                }}
              >
                {card.badge}
              </div>
            ) : null}
          </div>
        </div>
      ),
      {
        ...shareImageSize,
        fonts: [
          { name: "Favorite Child", data: display, weight: 400, style: "normal" },
          { name: "Mimosa", data: text, weight: 400, style: "normal" },
        ],
      },
    );
  });
}
