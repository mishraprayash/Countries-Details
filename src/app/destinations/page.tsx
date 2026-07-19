import { Metadata } from "next";
import PopularDestinations from "@/components/PopularDestinations";
import { Landmark } from "lucide-react";

export const metadata: Metadata = {
  title: "Top Popular Destinations | World Insights",
  description: "Explore top popular destinations, landmarks, cities, mountains, and beaches across the globe with live Wikipedia summaries and interactive maps.",
};

export default function DestinationsPage() {
  return (
    <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-glow/10 border border-cyan-glow/20">
                <Landmark className="h-6 w-6 text-cyan-glow animate-pulse" />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-instrument-serif sm:text-4xl">
                Global Travel Destinations
              </h1>
            </div>
            <p className="text-sm text-text-secondary font-sora mt-2 max-w-2xl">
              Browse top landmarks, natural wonders, historic monuments, and popular cities across dozens of countries, integrated with live Wikipedia information.
            </p>
          </div>
        </div>

        {/* Popular Destinations component */}
        <PopularDestinations />

      </div>
    </main>
  );
}
