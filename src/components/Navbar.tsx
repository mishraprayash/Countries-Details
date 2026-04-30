"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Heart, BrainCircuit, Map, Scale, Menu, X } from "lucide-react";

interface NavbarProps {
  currentPage?: "dashboard" | "countries" | "quiz" | "favorites" | "compare";
}

export default function Navbar({ currentPage }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  
  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navItems = [
    { href: "/", label: "Dashboard", icon: Globe, activeColor: "text-blue-400", activeBg: "bg-blue-400/10", activeDot: "bg-blue-400", page: "dashboard" as const },
    { href: "/countries", label: "Countries", icon: Map, activeColor: "text-zinc-300", activeBg: "bg-zinc-300/10", activeDot: "bg-zinc-300", page: "countries" as const },
    { href: "/compare", label: "Compare", icon: Scale, activeColor: "text-amber-400", activeBg: "bg-amber-400/10", activeDot: "bg-amber-400", page: "compare" as const },
    { href: "/quiz", label: "Quiz", icon: BrainCircuit, activeColor: "text-indigo-400", activeBg: "bg-indigo-400/10", activeDot: "bg-indigo-400", page: "quiz" as const },
    { href: "/favorites", label: "Favorites", icon: Heart, activeColor: "text-red-400", activeBg: "bg-red-400/10", activeDot: "bg-red-400", page: "favorites" as const },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-2 px-3 sm:px-4 py-2 bg-zinc-900/80 backdrop-blur-md rounded-xl border border-zinc-800/50 shadow-lg">
        <div className="flex items-center gap-1 shrink-0">
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
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? item.activeColor : ""}`} />
                <span>{item.label}</span>
                {isActive && (
                  <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${item.activeDot}`} />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center justify-center p-2 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800/50 shadow-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Menu Overlay */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-zinc-950 flex flex-col px-4 py-6 md:hidden animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold text-white">Menu</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex flex-col gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || currentPage === item.page;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  scroll={false}
                  className={`
                    flex items-center gap-4 px-4 py-4 rounded-xl text-base font-bold transition-all
                    ${isActive 
                      ? `${item.activeColor} ${item.activeBg} border-white/10` 
                      : "text-zinc-400 hover:text-zinc-200 bg-white/5 hover:bg-white/10 border-white/5"
                    }
                    border
                  `}
                >
                  <div className={`p-2 rounded-lg ${isActive ? "bg-white/10" : "bg-white/5"}`}>
                    <Icon className={`h-6 w-6 ${isActive ? item.activeColor : ""}`} />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}