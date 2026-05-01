"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Heart, BrainCircuit, Map, Scale, Menu, X, Compass } from "lucide-react";

interface NavbarProps {
  currentPage?: "dashboard" | "countries" | "quiz" | "favorites" | "compare" | "explore";
}

export default function Navbar({ currentPage }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
  }, [pathname]);

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
    { href: "/", label: "Dashboard", icon: Globe, activeColor: "text-cyan-glow", activeBg: "bg-cyan-glow/10", activeDot: "bg-cyan-glow", page: "dashboard" as const },
    { href: "/countries", label: "Countries", icon: Map, activeColor: "text-text-primary", activeBg: "bg-white/10", activeDot: "bg-text-primary", page: "countries" as const },
    { href: "/compare", label: "Compare", icon: Scale, activeColor: "text-amber-glow", activeBg: "bg-amber-glow/10", activeDot: "bg-amber-glow", page: "compare" as const },
    { href: "/explore", label: "Explore", icon: Compass, activeColor: "text-emerald-400", activeBg: "bg-emerald-400/10", activeDot: "bg-emerald-400", page: "explore" as const },
    { href: "/quiz", label: "Quiz", icon: BrainCircuit, activeColor: "text-violet-glow", activeBg: "bg-violet-glow/10", activeDot: "bg-violet-glow", page: "quiz" as const },
    { href: "/favorites", label: "Favorites", icon: Heart, activeColor: "text-red-400", activeBg: "bg-red-400/10", activeDot: "bg-red-400", page: "favorites" as const },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-atlas-900/60 backdrop-blur-md rounded-xl border border-white/5 shadow-lg">
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
                  relative px-2.5 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 font-sora
                  ${isActive
                    ? `${item.activeColor} ${item.activeBg}`
                    : "text-text-muted hover:text-text-primary hover:bg-white/5"
                  }
                `}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? item.activeColor : ""}`} />
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
        className="md:hidden flex items-center justify-center p-2 rounded-xl bg-atlas-900/60 backdrop-blur-md border border-white/5 shadow-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Menu Overlay */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-atlas-950 flex flex-col px-4 py-6 md:hidden animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-cyan-glow" />
              <span className="text-xl font-bold text-text-primary font-instrument-serif">Menu</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl bg-white/5 text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
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
                    flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium transition-all font-sora
                    ${isActive
                      ? `${item.activeColor} ${item.activeBg} border-white/10`
                      : "text-text-muted hover:text-text-primary bg-white/5 hover:bg-white/10 border-white/5"
                    }
                    border
                  `}
                >
                  <div className={`p-2 rounded-lg ${isActive ? "bg-white/10" : "bg-white/5"}`}>
                    <Icon className={`h-5 w-5 ${isActive ? item.activeColor : ""}`} />
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
