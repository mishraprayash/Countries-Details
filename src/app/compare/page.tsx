import { Suspense } from "react";
import CompareClient from "./CompareClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Compare Countries | Atlas",
  description: "Compare up to 5 countries side-by-side.",
};

export default function ComparePage() {
  return (
    <main className="flex-1 bg-atlas-950 text-text-primary min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary font-instrument-serif">
            Compare Countries
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted font-sora">
            Select 2-5 countries to compare side-by-side with visual charts.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-glow" />
            </div>
          }
        >
          <CompareClient />
        </Suspense>
      </div>
    </main>
  );
}
