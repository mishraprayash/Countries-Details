import Link from "next/link";
import { Globe } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0 pr-2 text-zinc-50">
          <Globe className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold hidden md:inline">World Insights</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Navbar />
        </nav>
      </div>
    </header>
  );
}
