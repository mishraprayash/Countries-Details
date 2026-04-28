"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Heart, BrainCircuit, Map, Scale } from "lucide-react";

interface NavbarProps {
  currentPage?: "dashboard" | "countries" | "quiz" | "favorites" | "compare";
}

export default function Navbar({ currentPage }: NavbarProps) {
  const pathname = usePathname();
  
  const navItems = [
    { href: "/", label: "Dashboard", icon: Globe, activeColor: "text-blue-400", activeBg: "bg-blue-400/10", activeDot: "bg-blue-400", page: "dashboard" as const },
    { href: "/countries", label: "Countries", icon: Map, activeColor: "text-zinc-300", activeBg: "bg-zinc-300/10", activeDot: "bg-zinc-300", page: "countries" as const },
    { href: "/compare", label: "Compare", icon: Scale, activeColor: "text-amber-400", activeBg: "bg-amber-400/10", activeDot: "bg-amber-400", page: "compare" as const },
    { href: "/quiz", label: "Quiz", icon: BrainCircuit, activeColor: "text-indigo-400", activeBg: "bg-indigo-400/10", activeDot: "bg-indigo-400", page: "quiz" as const },
    { href: "/favorites", label: "Favorites", icon: Heart, activeColor: "text-red-400", activeBg: "bg-red-400/10", activeDot: "bg-red-400", page: "favorites" as const },
  ];

  return (
    <nav className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-md rounded-xl border border-zinc-800/50 shadow-lg">
      <div className="flex items-center gap-1.5 pr-4 border-r border-zinc-700/50">
        <Globe className="h-5 w-5 text-emerald-400" />
        <span className="text-sm font-semibold text-zinc-100">WorldExplorer</span>
      </div>
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || currentPage === item.page;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              scroll={false}
              className={`
                relative px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200
                ${isActive 
                  ? `${item.activeColor} ${item.activeBg}` 
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }
              `}
            >
              <Icon className={`h-4 w-4 ${isActive ? item.activeColor : ""}`} />
              <span>{item.label}</span>
              {isActive && (
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${item.activeDot}`} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}