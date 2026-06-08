"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Download, Loader2, Globe2 } from "lucide-react";

interface ShareCardCountry {
  name: { common: string; official: string };
  flags: { svg: string; png?: string };
  population: number;
  area: number;
  region: string;
  subregion?: string;
  capital?: string[];
}

interface ShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  country: ShareCardCountry;
}

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

const formatStat = (n: number, divisor: number, suffix: string) =>
  `${(n / divisor).toFixed(divisor === 1 ? 0 : 1)}${suffix}`;

async function fetchFlagAsDataUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

function buildSvg(country: ShareCardCountry, flagDataUrl: string): string {
  const population = country.population > 1e6
    ? formatStat(country.population, 1e6, "M")
    : country.population.toLocaleString();
  const area = country.area > 1e6
    ? formatStat(country.area, 1e6, "M km²")
    : `${country.area.toLocaleString()} km²`;
  const capital = country.capital?.[0] || "N/A";
  const region = `${country.subregion ? country.subregion + " · " : ""}${country.region}`;

  const flagBox = flagDataUrl
    ? `<g transform="translate(720 110)">
        <rect width="380" height="250" rx="20" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
        <clipPath id="flagClip"><rect x="10" y="10" width="360" height="230" rx="12"/></clipPath>
        <image href="${flagDataUrl}" x="10" y="10" width="360" height="230" preserveAspectRatio="xMidYMid slice" clip-path="url(#flagClip)"/>
      </g>`
    : "";

  const stats = [
    { label: "CAPITAL", value: capital },
    { label: "REGION", value: region },
    { label: "POPULATION", value: population },
    { label: "AREA", value: area },
  ];

  const statBlocks = stats
    .map(
      (s, i) => `
      <g transform="translate(${80 + (i % 2) * 280} ${400 + Math.floor(i / 2) * 80})">
        <text x="0" y="0" font-family="ui-sans-serif, system-ui" font-size="14" font-weight="600" letter-spacing="2" fill="#5A6A8A">${s.label}</text>
        <text x="0" y="36" font-family="ui-sans-serif, system-ui" font-size="26" font-weight="700" fill="#F0F4FF">${s.value.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>
      </g>`
    )
    .join("");

  const escapedName = country.name.common.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const escapedOfficial = country.name.official.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}" width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0c1020"/>
        <stop offset="100%" stop-color="#060810"/>
      </linearGradient>
      <radialGradient id="glow" cx="20%" cy="0%" r="60%">
        <stop offset="0%" stop-color="rgba(0,212,255,0.18)"/>
        <stop offset="100%" stop-color="rgba(0,212,255,0)"/>
      </radialGradient>
      <radialGradient id="glow2" cx="100%" cy="100%" r="50%">
        <stop offset="0%" stop-color="rgba(167,139,250,0.18)"/>
        <stop offset="100%" stop-color="rgba(167,139,250,0)"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect width="100%" height="100%" fill="url(#glow)"/>
    <rect width="100%" height="100%" fill="url(#glow2)"/>

    <g>
      <circle cx="50" cy="50" r="3" fill="#00D4FF"/>
      <text x="68" y="56" font-family="ui-sans-serif, system-ui" font-size="18" font-weight="700" letter-spacing="3" fill="#F0F4FF">WORLD INSIGHTS</text>
    </g>

    <text x="80" y="220" font-family="ui-serif, Georgia, serif" font-size="92" font-weight="900" fill="#F0F4FF">${escapedName}</text>
    <text x="80" y="270" font-family="ui-sans-serif, system-ui" font-size="24" fill="#5A6A8A">${escapedOfficial}</text>

    ${flagBox}

    ${statBlocks}

    <line x1="80" y1="580" x2="1120" y2="580" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    <text x="80" y="605" font-family="ui-sans-serif, system-ui" font-size="16" fill="#5A6A8A">Explore the world at world-insights.app</text>
    <text x="1120" y="605" text-anchor="end" font-family="ui-sans-serif, system-ui" font-size="16" font-weight="600" fill="#00D4FF">world-insights.app</text>
  </svg>`;
}

export default function ShareCard({ isOpen, onClose, country }: ShareCardProps) {
  const [svgString, setSvgString] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const cancelRef = useRef(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    return () => {
      cancelRef.current = true;
    };
  }, []);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!isOpen) {
      setSvgString(null);
      setError(null);
      cancelRef.current = false;
      return;
    }
    /* eslint-enable react-hooks/set-state-in-effect */

    let active = true;
    cancelRef.current = false;
    (async () => {
      try {
        const flagDataUrl = await fetchFlagAsDataUrl(country.flags.svg);
        if (cancelRef.current) return;
        const svg = buildSvg(country, flagDataUrl);
        if (active) setSvgString(svg);
      } catch {
        if (active) setError("Failed to build share card");
      }
    })();

    return () => {
      active = false;
    };
  }, [isOpen, country]);

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
      if (!ctx) throw new Error("no ctx");
      ctx.drawImage(img, 0, 0, CARD_WIDTH, CARD_HEIGHT);
      URL.revokeObjectURL(url);
      const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!pngBlob) throw new Error("toBlob failed");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(pngBlob);
      a.download = `${country.name.common.toLowerCase().replace(/\s+/g, "-")}-world-insights.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch {
      setError("Failed to export PNG. Try again.");
    } finally {
      setDownloading(false);
    }
  };

  const copyPng = async () => {
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
      if (!ctx) throw new Error("no ctx");
      ctx.drawImage(img, 0, 0, CARD_WIDTH, CARD_HEIGHT);
      URL.revokeObjectURL(url);
      const pngBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!pngBlob || typeof ClipboardItem === "undefined") {
        throw new Error("clipboard not supported");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (navigator.clipboard as any).write([new ClipboardItem({ "image/png": pngBlob })]);
      setError("Copied to clipboard!");
      setTimeout(() => setError(null), 2000);
    } catch {
      setError("Copy not supported in this browser");
      setTimeout(() => setError(null), 2000);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-atlas-900 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-cyan-glow" />
            <h2 className="text-base font-semibold text-text-primary font-sora">Share Card</h2>
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
          <div className="mb-4 rounded-xl bg-white/[0.03] border border-white/5 p-3 flex items-center justify-center">
            {svgString ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`}
                alt="Country share card preview"
                className="w-full h-auto rounded-lg"
                style={{ maxHeight: "60vh", objectFit: "contain" }}
              />
            ) : (
              <div className="flex items-center gap-2 py-20 text-muted font-sora">
                <Loader2 className="h-5 w-5 animate-spin" />
                Building card…
              </div>
            )}
          </div>

          {error && (
            <p className={`mb-3 text-center text-sm font-sora ${error.includes("Copied") ? "text-emerald-400" : "text-red-400"}`}>
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={copyPng}
              disabled={!svgString}
              className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] ring-1 ring-white/10 text-sm font-medium text-text-primary transition-colors disabled:opacity-50 font-sora"
            >
              Copy Image
            </button>
            <button
              onClick={downloadPng}
              disabled={!svgString || downloading}
              className="px-4 py-2 rounded-lg bg-cyan-glow hover:bg-cyan-glow/80 text-atlas-950 text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2 font-sora"
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
