import { Metadata } from "next";
import Link from "next/link";
import { Globe, BrainCircuit, Map, BarChart3, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About | World Insights",
  description: "Learn more about World Insights Hub.",
};

export default function AboutPage() {
  return (
    <main className="flex-1 bg-atlas-950 text-text-primary">
      <div className="relative overflow-hidden border-b border-white/5 bg-white/[0.02]">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-glow/10 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-violet-glow/10 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-glow/10 ring-1 ring-cyan-glow/20">
            <Globe className="h-8 w-8 text-cyan-glow" />
          </div>
          <h1 className="text-3xl font-black text-text-primary sm:text-5xl font-instrument-serif">About World Insights</h1>
          <p className="mt-4 text-lg text-text-secondary sm:text-xl leading-relaxed font-sora">
            A free, interactive platform for exploring global data, testing geography knowledge, and discovering the world&apos;s most fascinating countries.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="space-y-12 text-text-secondary leading-relaxed font-sora">
          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4 font-instrument-serif">Our Mission</h2>
            <p>
              World Insights Hub was built to make global data accessible, engaging, and fun. We believe that understanding the world&apos;s countries, their demographics, and their unique characteristics helps people become more informed global citizens. Whether you&apos;re a student, traveler, educator, or simply curious about the world, our platform provides the tools to explore and learn.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4 font-instrument-serif">What We Offer</h2>
            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              {[
                { icon: BarChart3, title: "Data Dashboard", desc: "Interactive charts showing population distribution, demographics, and regional statistics." },
                { icon: Globe, title: "Country Explorer", desc: "Browse and search 250+ countries with detailed demographic and geographic data." },
                { icon: BrainCircuit, title: "Quiz & Battle Mode", desc: "Test your geography knowledge with flag quizzes, capital challenges, and competitive games." },
                { icon: Map, title: "Map Explorer", desc: "Interactive map game — find famous locations and earn points based on accuracy." },
                { icon: Heart, title: "Favorites & Tracking", desc: "Save your favorite countries and track your learning progress over time." },
                { icon: Globe, title: "Life Comparator", desc: "Compare two countries side-by-side to see what life would be like if you moved." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-xl border border-white/5 bg-white/[0.03] glass-card p-5">
                    <Icon className="h-6 w-6 text-cyan-glow mb-3" />
                    <h3 className="text-base font-bold text-text-primary mb-1 font-sora">{item.title}</h3>
                    <p className="text-sm text-muted">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4 font-instrument-serif">Data Sources</h2>
            <p>
              All data on World Insights Hub is sourced from reliable, publicly available APIs:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-muted">
              <li><a href="https://restcountries.com" target="_blank" rel="noopener noreferrer" className="text-cyan-glow hover:underline">REST Countries API</a> — Country data, flags, capitals, and demographics</li>
              <li><a href="https://data.worldbank.org" target="_blank" rel="noopener noreferrer" className="text-cyan-glow hover:underline">World Bank Open Data</a> — GDP, literacy rates, and life expectancy</li>
              <li><a href="https://en.wikipedia.org" target="_blank" rel="noopener noreferrer" className="text-cyan-glow hover:underline">Wikipedia API</a> — Country of the Day facts and summaries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4 font-instrument-serif">Support Us</h2>
            <p>
              World Insights Hub is free to use and supported by advertising. If you find value in the platform, consider supporting us by:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-muted">
              <li>Sharing the platform with friends and colleagues</li>
              <li>Disabling ad blockers when using the Service</li>
              <li>Providing feedback and suggestions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4 font-instrument-serif">Get in Touch</h2>
            <p>
              Have a question, suggestion, or found a bug? We&apos;d love to hear from you. Reach out to us at <Link href="/" className="text-cyan-glow hover:underline">our homepage</Link> or find us on <a href="https://github.com/mishraprayash/Countries-Details" target="_blank" rel="noopener noreferrer" className="text-cyan-glow hover:underline">GitHub</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
