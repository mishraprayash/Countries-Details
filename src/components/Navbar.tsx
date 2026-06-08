"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe, Heart, BrainCircuit, Map, Scale, Menu, X, Compass,
  MapPin, Route, Calculator, ChevronDown, Gamepad2, Wrench, Landmark
} from "lucide-react";

interface NavbarProps {
  currentPage?: "dashboard" | "countries" | "quiz" | "favorites" | "compare" | "explore" | "travel-map" | "border-escape" | "gis-calculator" | "destinations" | "budget-planner";
}

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  activeColor: string;
  activeBg: string;
  activeDot: string;
  page: string;
}

interface NavGroup {
  label: string;
  icon: React.ElementType;
  pages: string[];
  items: NavLink[];
}

export default function Navbar({ currentPage }: NavbarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setIsOpen(false);
    setActiveDropdown(null);
    /* eslint-enable react-hooks/set-state-in-effect */
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

  const handleMouseEnter = (label: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150); // slight delay to prevent flickering
  };

  // Flat list for mobile view (spacious vertical scroll)
  const mobileNavItems = [
    { href: "/", label: "Dashboard", icon: Globe, activeColor: "text-cyan-glow", activeBg: "bg-cyan-glow/10", activeDot: "bg-cyan-glow", page: "dashboard" as const },
    { href: "/countries", label: "Countries", icon: Map, activeColor: "text-text-primary", activeBg: "bg-white/10", activeDot: "bg-text-primary", page: "countries" as const },
    { href: "/compare", label: "Compare", icon: Scale, activeColor: "text-amber-glow", activeBg: "bg-amber-glow/10", activeDot: "bg-amber-glow", page: "compare" as const },
    { href: "/explore", label: "Explore", icon: Compass, activeColor: "text-emerald-400", activeBg: "bg-emerald-400/10", activeDot: "bg-emerald-400", page: "explore" as const },
    { href: "/travel-map", label: "Travel Map", icon: MapPin, activeColor: "text-emerald-400", activeBg: "bg-emerald-400/10", activeDot: "bg-emerald-400", page: "travel-map" as const },
    { href: "/destinations", label: "Destinations", icon: Landmark, activeColor: "text-amber-glow", activeBg: "bg-amber-glow/10", activeDot: "bg-amber-glow", page: "destinations" as const },
    { href: "/border-escape", label: "Border Escape", icon: Route, activeColor: "text-cyan-glow", activeBg: "bg-cyan-glow/10", activeDot: "bg-cyan-glow", page: "border-escape" as const },
    { href: "/gis-calculator", label: "GIS Calc", icon: Calculator, activeColor: "text-cyan-glow", activeBg: "bg-cyan-glow/10", activeDot: "bg-cyan-glow", page: "gis-calculator" as const },
    { href: "/budget-planner", label: "Budget Planner", icon: Calculator, activeColor: "text-cyan-glow", activeBg: "bg-cyan-glow/10", activeDot: "bg-cyan-glow", page: "budget-planner" as const },
    { href: "/quiz", label: "Quiz", icon: BrainCircuit, activeColor: "text-violet-glow", activeBg: "bg-violet-glow/10", activeDot: "bg-violet-glow", page: "quiz" as const },
    { href: "/favorites", label: "Favorites", icon: Heart, activeColor: "text-red-400", activeBg: "bg-red-400/10", activeDot: "bg-red-400", page: "favorites" as const },
  ];

  // Grouped structure for desktop view
  const dashboardItem: NavLink = {
    href: "/",
    label: "Dashboard",
    icon: Globe,
    activeColor: "text-cyan-glow",
    activeBg: "bg-cyan-glow/10",
    activeDot: "bg-cyan-glow",
    page: "dashboard",
  };

  const favoritesItem: NavLink = {
    href: "/favorites",
    label: "Favorites",
    icon: Heart,
    activeColor: "text-red-400",
    activeBg: "bg-red-400/10",
    activeDot: "bg-red-400",
    page: "favorites",
  };

  const groups: NavGroup[] = [
    {
      label: "Explore",
      icon: Compass,
      pages: ["countries", "explore", "travel-map", "destinations"],
      items: [
        { href: "/countries", label: "Countries List", icon: Map, activeColor: "text-text-primary", activeBg: "bg-white/10", activeDot: "bg-text-primary", page: "countries" },
        { href: "/explore", label: "Map Explorer", icon: Compass, activeColor: "text-emerald-400", activeBg: "bg-emerald-400/10", activeDot: "bg-emerald-400", page: "explore" },
        { href: "/travel-map", label: "My Travel Map", icon: MapPin, activeColor: "text-emerald-400", activeBg: "bg-emerald-400/10", activeDot: "bg-emerald-400", page: "travel-map" },
        { href: "/destinations", label: "Top Destinations", icon: Landmark, activeColor: "text-amber-glow", activeBg: "bg-amber-glow/10", activeDot: "bg-amber-glow", page: "destinations" },
      ],
    },
    {
      label: "Tools",
      icon: Wrench,
      pages: ["compare", "gis-calculator", "budget-planner"],
      items: [
        { href: "/compare", label: "Compare Countries", icon: Scale, activeColor: "text-amber-glow", activeBg: "bg-amber-glow/10", activeDot: "bg-amber-glow", page: "compare" },
        { href: "/gis-calculator", label: "GIS Calculator", icon: Calculator, activeColor: "text-cyan-glow", activeBg: "bg-cyan-glow/10", activeDot: "bg-cyan-glow", page: "gis-calculator" },
        { href: "/budget-planner", label: "Travel Budget", icon: Calculator, activeColor: "text-cyan-glow", activeBg: "bg-cyan-glow/10", activeDot: "bg-cyan-glow", page: "budget-planner" },
      ],
    },
    {
      label: "Play",
      icon: Gamepad2,
      pages: ["quiz", "border-escape"],
      items: [
        { href: "/quiz", label: "Geography Quiz", icon: BrainCircuit, activeColor: "text-violet-glow", activeBg: "bg-violet-glow/10", activeDot: "bg-violet-glow", page: "quiz" },
        { href: "/border-escape", label: "Border Escape", icon: Route, activeColor: "text-cyan-glow", activeBg: "bg-cyan-glow/10", activeDot: "bg-cyan-glow", page: "border-escape" },
      ],
    },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-atlas-900/60 backdrop-blur-md rounded-xl border border-white/5 shadow-lg select-none">
        <div className="flex items-center gap-1 shrink-0">
          
          {/* Dashboard (Standalone) */}
          <Link
            href={dashboardItem.href}
            scroll={false}
            className={`
              relative px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 font-sora
              ${pathname === dashboardItem.href || currentPage === dashboardItem.page
                ? `${dashboardItem.activeColor} ${dashboardItem.activeBg}`
                : "text-text-muted hover:text-text-primary hover:bg-white/5"
              }
            `}
          >
            <Globe className="h-3.5 w-3.5 shrink-0" />
            <span>{dashboardItem.label}</span>
          </Link>

          {/* Group Dropdowns */}
          {groups.map((group) => {
            const isGroupActive = group.pages.includes(currentPage || "") || group.items.some(i => pathname === i.href);
            const GroupIcon = group.icon;
            const isOpenDropdown = activeDropdown === group.label;

            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(group.label)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all duration-200 font-sora cursor-pointer
                    ${isGroupActive
                      ? "text-cyan-glow bg-cyan-glow/5"
                      : "text-text-muted hover:text-text-primary hover:bg-white/5"
                    }
                  `}
                >
                  <GroupIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>{group.label}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpenDropdown ? "rotate-180" : ""}`} />
                </button>

                {isOpenDropdown && (
                  <div className="absolute top-full left-0 mt-1.5 z-[9999] p-2 bg-atlas-900 border border-white/10 rounded-xl shadow-2xl min-w-[200px] flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    {group.items.map((subItem) => {
                      const isSubActive = pathname === subItem.href || currentPage === subItem.page;
                      const SubIcon = subItem.icon;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          scroll={false}
                          className={`
                            px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all duration-150 font-sora
                            ${isSubActive
                              ? `${subItem.activeColor} ${subItem.activeBg}`
                              : "text-text-muted hover:text-text-primary hover:bg-white/5"
                            }
                          `}
                        >
                          <SubIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Favorites (Standalone) */}
          <Link
            href={favoritesItem.href}
            scroll={false}
            className={`
              relative px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 font-sora
              ${pathname === favoritesItem.href || currentPage === favoritesItem.page
                ? `${favoritesItem.activeColor} ${favoritesItem.activeBg}`
                : "text-text-muted hover:text-text-primary hover:bg-white/5"
              }
            `}
          >
            <Heart className="h-3.5 w-3.5 shrink-0" />
            <span>{favoritesItem.label}</span>
          </Link>

        </div>
      </nav>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center justify-center p-2.5 rounded-xl bg-atlas-900/60 backdrop-blur-md border border-white/5 shadow-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors cursor-pointer"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Menu Overlay */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-atlas-950 flex flex-col px-4 py-6 lg:hidden animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
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
            {mobileNavItems.map((item) => {
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
