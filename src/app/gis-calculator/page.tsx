import { Metadata } from "next";
import GisCalculatorClient from "./GisCalculatorClient";

export const metadata: Metadata = {
  title: "GIS Geodesic Calculator | World Insights",
  description: "Calculate great-circle geodesic distances, compass bearings, and timezone offsets between world capitals using spatial geography tools.",
  keywords: ["geodesic distance", "haversine formula", "bearing", "gis calculator", "timezone offsets", "spatial geography"],
};

export default function GisCalculatorPage() {
  return (
    <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen">
      <GisCalculatorClient />
    </main>
  );
}
