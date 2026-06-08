import { Metadata } from "next";
import BudgetPlanner from "@/components/BudgetPlanner";
import { Calculator } from "lucide-react";

export const metadata: Metadata = {
  title: "Travel Budget Planner | World Insights",
  description: "Calculate and plan your expenses for any country. Customize trip duration, travelers, travel style, and view detailed costs in your home currency.",
};

export default function BudgetPlannerPage() {
  return (
    <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-glow/10 border border-cyan-glow/20">
                <Calculator className="h-6 w-6 text-cyan-glow animate-pulse" />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-instrument-serif sm:text-4xl">
                Travel Budget Planner
              </h1>
            </div>
            <p className="text-sm text-text-secondary font-sora mt-2 max-w-2xl">
              Estimate travel costs for lodging, food, transit, and sights for any destination worldwide, adjusted dynamically to your home currency and trip duration.
            </p>
          </div>
        </div>

        {/* Budget Planner component */}
        <BudgetPlanner />

      </div>
    </main>
  );
}
