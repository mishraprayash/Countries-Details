import { Globe } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MapExplorer from "./components/MapExplorer";

export default function ExplorePage() {
  return (
    <main className="flex-1 bg-zinc-950 text-zinc-50 min-h-screen">
      <div className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-2 sm:px-4">
          <Link href="/" className="flex items-center gap-2 shrink-0 pr-2 text-zinc-50">
            <Globe className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold hidden md:inline">World Insights</span>
          </Link>
          <Navbar currentPage="explore" />
        </div>
      </div>
      
      <MapExplorer />
    </main>
  );
}