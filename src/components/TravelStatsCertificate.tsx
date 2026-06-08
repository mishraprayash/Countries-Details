"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Download, Loader2, Award } from "lucide-react";
import { TravelStats } from "@/types/user";

interface TravelStatsCertificateProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TravelStats;
}

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

function buildSvg(stats: TravelStats): string {
  const visitedTotal = stats.visitedCount + stats.livedInCount;
  
  // Define badges list
  const achievements = [
    { title: "First Steps", unlocked: visitedTotal >= 1, icon: "🧭" },
    { title: "Globetrotter", unlocked: visitedTotal >= 5, icon: "✈️" },
    { title: "World Citizen", unlocked: visitedTotal >= 15, icon: "🌍" },
    { title: "Local Life", unlocked: stats.livedInCount >= 1, icon: "🏠" },
    { title: "Wanderlust", unlocked: stats.wantToVisitCount >= 5, icon: "✨" },
    { title: "Hop Skipper", unlocked: stats.continentsVisited >= 3, icon: "⛵" },
  ];

  const unlockedBadges = achievements.filter(a => a.unlocked);
  const badgeBlocks = unlockedBadges.slice(0, 4).map((badge, idx) => {
    return `
      <g transform="translate(${720 + (idx % 2) * 180} ${320 + Math.floor(idx / 2) * 110})">
        <rect width="150" height="90" rx="14" fill="rgba(0,212,255,0.04)" stroke="rgba(0,212,255,0.12)" stroke-width="1.5"/>
        <text x="75" y="40" text-anchor="middle" font-size="28">${badge.icon}</text>
        <text x="75" y="68" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="11" font-weight="700" fill="#F0F4FF" letter-spacing="0.5">${badge.title.toUpperCase()}</text>
      </g>
    `;
  }).join("");

  const statsList = [
    { label: "VISITED", value: stats.visitedCount.toString(), color: "#34d399" },
    { label: "LIVED IN", value: stats.livedInCount.toString(), color: "#a78bfa" },
    { label: "WISHLIST", value: stats.wantToVisitCount.toString(), color: "#f59e0b" },
    { label: "COVERAGE", value: `${stats.visitedPercentage}%`, color: "#00D4FF" },
  ];

  const statBlocks = statsList.map((s, i) => `
    <g transform="translate(${80 + (i % 2) * 280} ${320 + Math.floor(i / 2) * 110})">
      <text x="0" y="0" font-family="ui-sans-serif, system-ui" font-size="13" font-weight="600" letter-spacing="2" fill="#5A6A8A">${s.label}</text>
      <text x="0" y="38" font-family="ui-sans-serif, system-ui" font-size="44" font-weight="900" fill="${s.color}">${s.value}</text>
    </g>
  `).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0c1020"/>
        <stop offset="100%" stop-color="#060810"/>
      </linearGradient>
      <radialGradient id="glow" cx="10%" cy="0%" r="50%">
        <stop offset="0%" stop-color="rgba(52,211,153,0.18)"/>
        <stop offset="100%" stop-color="rgba(52,211,153,0)"/>
      </radialGradient>
      <radialGradient id="glow2" cx="80%" cy="40%" r="60%">
        <stop offset="0%" stop-color="rgba(0,212,255,0.18)"/>
        <stop offset="100%" stop-color="rgba(0,212,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect width="100%" height="100%" fill="url(#glow)"/>
    <rect width="100%" height="100%" fill="url(#glow2)"/>

    <!-- Passport Stamp Circle decoration on right -->
    <g transform="translate(900 160)" opacity="0.3">
      <circle cx="0" cy="0" r="100" fill="none" stroke="#00D4FF" stroke-width="2" stroke-dasharray="8 8"/>
      <circle cx="0" cy="0" r="90" fill="none" stroke="#00D4FF" stroke-width="1"/>
      <text x="0" y="-30" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="12" font-weight="700" letter-spacing="4" fill="#00D4FF">WORLD EXPLORER</text>
      <text x="0" y="20" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="32" font-weight="900" fill="#00D4FF">${stats.visitedPercentage}%</text>
      <text x="0" y="45" text-anchor="middle" font-family="ui-sans-serif, system-ui" font-size="10" font-weight="700" fill="#00D4FF">EXPLORED</text>
    </g>

    <!-- Header title -->
    <g>
      <circle cx="80" cy="80" r="4" fill="#34d399"/>
      <text x="96" y="86" font-family="ui-sans-serif, system-ui" font-size="18" font-weight="700" letter-spacing="3" fill="#5A6A8A">EXPLORATION CERTIFICATE</text>
      <text x="80" y="180" font-family="ui-serif, Georgia, serif" font-size="60" font-weight="900" fill="#F0F4FF">My Travel Profile</text>
      <text x="80" y="225" font-family="ui-sans-serif, system-ui" font-size="18" fill="#5A6A8A">A record of global demographics and regions visited.</text>
    </g>

    <!-- Stat Blocks -->
    ${statBlocks}

    <!-- Badges Section -->
    <g transform="translate(720 260)">
      <text x="0" y="0" font-family="ui-sans-serif, system-ui" font-size="13" font-weight="600" letter-spacing="2" fill="#5A6A8A">UNLOCKED MILESTONES</text>
    </g>
    ${badgeBlocks}

    <!-- Footer -->
    <line x1="80" y1="560" x2="1120" y2="560" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    <text x="80" y="585" font-family="ui-sans-serif, system-ui" font-size="14" fill="#5A6A8A">Generated on World Insights Hub</text>
    <text x="1120" y="585" text-anchor="end" font-family="ui-sans-serif, system-ui" font-size="14" font-weight="600" fill="#34d399">world-insights.app</text>
  </svg>`;
}

export default function TravelStatsCertificate({ isOpen, onClose, stats }: TravelStatsCertificateProps) {
  const [svgString, setSvgString] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!isOpen) {
      setSvgString(null);
      return;
    }
    setSvgString(buildSvg(stats));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen, stats]);

  const downloadPng = async () => {
    if (!svgString) return;
    setDownloading(true);
    try {
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("img load failed"));
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = CARD_WIDTH;
      canvas.height = CARD_HEIGHT;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no context");
      ctx.drawImage(img, 0, 0, CARD_WIDTH, CARD_HEIGHT);
      URL.revokeObjectURL(url);
      const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!pngBlob) throw new Error("toBlob failed");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(pngBlob);
      a.download = `my-travel-stats-world-insights.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch {
      setCopiedText("Failed to download image");
      setTimeout(() => setCopiedText(null), 2000);
    } finally {
      setDownloading(false);
    }
  };

  const copyImage = async () => {
    if (!svgString) return;
    try {
      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("img load failed"));
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = CARD_WIDTH;
      canvas.height = CARD_HEIGHT;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no context");
      ctx.drawImage(img, 0, 0, CARD_WIDTH, CARD_HEIGHT);
      URL.revokeObjectURL(url);
      const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!pngBlob || typeof ClipboardItem === "undefined") {
        throw new Error("clipboard not supported");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (navigator.clipboard as any).write([new ClipboardItem({ "image/png": pngBlob })]);
      setCopiedText("Copied to clipboard!");
      setTimeout(() => setCopiedText(null), 2000);
    } catch {
      setCopiedText("Copy not supported in this browser");
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-atlas-900 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-cyan-glow" />
            <h2 className="text-base font-semibold text-text-primary font-sora">Travel Stats Certificate</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 rounded-2xl bg-white/[0.03] border border-white/5 p-3 flex items-center justify-center">
            {svgString ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`}
                alt="Travel Stats Certificate Preview"
                className="w-full h-auto rounded-xl shadow-lg border border-white/5"
                style={{ maxHeight: "60vh", objectFit: "contain" }}
              />
            ) : (
              <div className="flex items-center gap-2 py-20 text-muted font-sora">
                <Loader2 className="h-5 w-5 animate-spin" />
                Preparing certificate…
              </div>
            )}
          </div>

          {copiedText && (
            <p className={`mb-3 text-center text-sm font-sora ${copiedText.includes("Copied") ? "text-emerald-400" : "text-red-400"}`}>
              {copiedText}
            </p>
          )}

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={copyImage}
              disabled={!svgString}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] ring-1 ring-white/10 text-sm font-bold text-text-primary transition-all active:scale-95 font-sora"
            >
              Copy Image
            </button>
            <button
              onClick={downloadPng}
              disabled={!svgString || downloading}
              className="px-4 py-2.5 rounded-xl bg-cyan-glow hover:bg-cyan-glow/80 text-atlas-950 text-sm font-bold transition-all active:scale-95 flex items-center gap-2 font-sora shadow-lg shadow-cyan-glow/20"
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
