import Link from "next/link";
import { Globe } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-atlas-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 pr-2 group">
          <div className="p-1.5 rounded-lg bg-cyan-glow/10 group-hover:bg-cyan-glow/20 transition-colors">
            <Globe className="h-5 w-5 text-cyan-glow" />
          </div>
          <span className="text-lg font-semibold text-text-primary tracking-tight hidden md:inline font-instrument-serif">
            World Insights
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Navbar />
        </nav>
      </div>
    </header>
  );
}
