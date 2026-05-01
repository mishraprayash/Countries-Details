import Link from "next/link";
import { Globe, Heart, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-zinc-50">
              <Globe className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-bold">World Insights</span>
            </Link>
            <p className="mt-4 text-sm text-zinc-500 max-w-xs leading-relaxed">
              A free, interactive platform for exploring global data, testing geography knowledge, and discovering the world&apos;s most fascinating countries.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Explore</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/countries" className="text-sm text-zinc-400 hover:text-white transition-colors">Countries</Link></li>
              <li><Link href="/compare" className="text-sm text-zinc-400 hover:text-white transition-colors">Compare</Link></li>
              <li><Link href="/explore" className="text-sm text-zinc-400 hover:text-white transition-colors">Map Explorer</Link></li>
              <li><Link href="/quiz" className="text-sm text-zinc-400 hover:text-white transition-colors">Quiz</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-zinc-400 hover:text-white transition-colors">About</Link></li>
              <li><a href="https://github.com/mishraprayash/Countries-Details" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">GitHub <ArrowUpRight className="h-3 w-3" /></a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-zinc-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-zinc-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/disclaimer" className="text-sm text-zinc-400 hover:text-white transition-colors">Disclaimer</Link></li>
              <li><Link href="/cookies" className="text-sm text-zinc-400 hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            &copy; {currentYear} World Insights Hub. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600 flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500" /> by <Link href="https://github.com/mishraprayash" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">Prayash Mishra</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
