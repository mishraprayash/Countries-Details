import Link from "next/link";
import { Globe, Heart, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-atlas-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-text-primary group">
              <div className="p-1 rounded-lg bg-cyan-glow/10">
                <Globe className="h-5 w-5 text-cyan-glow" />
              </div>
              <span className="text-base font-semibold tracking-tight font-instrument-serif">World Insights</span>
            </Link>
            <p className="mt-4 text-sm text-text-muted max-w-xs leading-relaxed font-sora">
              A free, interactive platform for exploring global data, testing geography knowledge, and discovering the world&apos;s most fascinating countries.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.15em] mb-4">Explore</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-text-muted hover:text-text-primary transition-colors font-sora">Dashboard</Link></li>
              <li><Link href="/countries" className="text-sm text-text-muted hover:text-text-primary transition-colors font-sora">Countries</Link></li>
              <li><Link href="/compare" className="text-sm text-text-muted hover:text-text-primary transition-colors font-sora">Compare</Link></li>
              <li><Link href="/explore" className="text-sm text-text-muted hover:text-text-primary transition-colors font-sora">Map Explorer</Link></li>
              <li><Link href="/quiz" className="text-sm text-text-muted hover:text-text-primary transition-colors font-sora">Quiz</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.15em] mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-text-muted hover:text-text-primary transition-colors font-sora">About</Link></li>
              <li><a href="https://github.com/mishraprayash/Countries-Details" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 font-sora">GitHub <ArrowUpRight className="h-3 w-3" /></a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.15em] mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-text-muted hover:text-text-primary transition-colors font-sora">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-text-muted hover:text-text-primary transition-colors font-sora">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="text-sm text-text-muted hover:text-text-primary transition-colors font-sora">Disclaimer</Link></li>
              <li><Link href="/cookies" className="text-sm text-text-muted hover:text-text-primary transition-colors font-sora">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted/60 font-sora">
            &copy; {currentYear} World Insights Hub. All rights reserved.
          </p>
          <p className="text-xs text-text-muted/60 flex items-center gap-1 font-sora">
            Made with <Heart className="h-3 w-3 text-red-500" /> by <Link href="https://github.com/mishraprayash" target="_blank" rel="noopener noreferrer" className="text-text-muted/80 hover:text-text-primary transition-colors">Prayash Mishra</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
