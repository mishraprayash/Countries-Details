import { Metadata } from "next";

export const metadata: Metadata = {
  title: "World Arena | Compare, Battle & Move Abroad",
  description: "Compare countries side-by-side, test your knowledge in Battle Mode, or simulate what it's like to live in another country.",
  keywords: ["compare countries", "country comparison", "battle mode", "geography quiz", "move abroad simulator", "country battle"],
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}