import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Map Explorer | World Insights",
  description: "Test your geography skills! Select a continent, find famous locations on the map, and compete for the highest score.",
  keywords: ["map game", "geography quiz", "explore world", "find locations", "geography game"],
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}