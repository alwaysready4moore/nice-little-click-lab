import { clickShareCard } from "@/lib/share-card";
import { renderShareCard } from "@/lib/share-image";

const card = clickShareCard("should-have-been-an-email");

export const alt = card.alt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderShareCard(card);
}
