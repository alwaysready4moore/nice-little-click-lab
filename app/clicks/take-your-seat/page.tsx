import type { Metadata } from "next";
import { SeatingChartBuilder } from "@/components/clicks/seating/SeatingChartBuilder";

export const metadata: Metadata = {
  title: "Take Your Seat | Custom Seating Chart Builder",
  description: "Arrange wedding tables or classroom desks, assign seats, and print your seating chart. Free, private, and no account required.",
  alternates: { canonical: "/clicks/take-your-seat" },
  robots: { index: true, follow: true },
};

export default function TakeYourSeatPage() {
  return <SeatingChartBuilder />;
}
