"use client";

import { useState, useEffect } from "react";
import { Coins, ArrowLeftRight, Loader2 } from "lucide-react";

interface CurrencyInfo {
  name: string;
  symbol: string;
}

interface CurrencyConverterProps {
  currencies?: Record<string, CurrencyInfo>;
}

export default function CurrencyConverter({ currencies }: CurrencyConverterProps) {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [baseVal, setBaseVal] = useState("1");
  const [targetVal, setTargetVal] = useState("");
  const [isBaseUsd, setIsBaseUsd] = useState(true); // USD -> Local or Local -> USD

  const currencyCode = currencies ? Object.keys(currencies)[0] : "USD";
  const currencySymbol = currencies ? Object.values(currencies)[0].symbol : "$";
  const currencyName = currencies ? Object.values(currencies)[0].name : "US Dollar";

  useEffect(() => {
    if (currencyCode === "USD") {
      /* eslint-disable react-hooks/set-state-in-effect */
      setRate(1);
      setTargetVal("1");
      setLoading(false);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }

    setLoading(true);
    setError(false);
    fetch(`https://open.er-api.com/v6/latest/USD`)
      .then((res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        const usdToTargetRate = data.rates?.[currencyCode];
        if (usdToTargetRate) {
          setRate(usdToTargetRate);
          setTargetVal(usdToTargetRate.toFixed(2));
        } else {
          setError(true);
        }
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currencyCode]);

  useEffect(() => {
    if (rate === null) return;
    const val = parseFloat(baseVal);
    /* eslint-disable react-hooks/set-state-in-effect */
    if (isNaN(val)) {
      setTargetVal("");
      return;
    }

    if (isBaseUsd) {
      setTargetVal((val * rate).toFixed(2));
    } else {
      setTargetVal((val / rate).toFixed(2));
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [baseVal, rate, isBaseUsd]);

  const handleTargetChange = (val: string) => {
    setTargetVal(val);
    const parsed = parseFloat(val);
    if (isNaN(parsed) || rate === null) {
      setBaseVal("");
      return;
    }

    if (isBaseUsd) {
      setBaseVal((parsed / rate).toFixed(2));
    } else {
      setBaseVal((parsed * rate).toFixed(2));
    }
  };

  if (currencyCode === "USD") {
    return null; // Don't show converter if the country already uses USD
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] glass-card p-6">
      <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2 font-sora">
        <Coins className="h-5 w-5 text-amber-glow animate-pulse" />
        Currency Converter
      </h3>

      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-muted font-sora text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-amber-glow" />
          Fetching exchange rates…
        </div>
      ) : error ? (
        <p className="text-xs text-muted font-sora">
          Failed to load live exchange rates. Please check your network.
        </p>
      ) : (
        <div className="space-y-4 font-sora">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Exchange Rate:</span>
            <span className="font-dm-mono text-text-secondary">
              1 USD = {rate?.toFixed(4)} {currencyCode}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Base Currency Box */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-muted">
                {isBaseUsd ? "USD (US Dollar)" : `${currencyCode} (${currencyName})`}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted font-bold">
                  {isBaseUsd ? "$" : currencySymbol}
                </span>
                <input
                  type="number"
                  value={baseVal}
                  onChange={(e) => setBaseVal(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 focus:border-cyan-glow/50 focus:outline-none rounded-xl pl-9 pr-4 py-2.5 text-sm font-dm-mono text-text-primary"
                />
              </div>
            </div>

            {/* Switch Direction Button */}
            <button
              onClick={() => {
                setIsBaseUsd(!isBaseUsd);
                setBaseVal("1");
              }}
              className="self-center p-2 rounded-lg bg-white/[0.03] border border-white/5 text-muted hover:text-text-primary transition-all active:scale-95 cursor-pointer"
              title="Switch Direction"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>

            {/* Target Currency Box */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-muted">
                {isBaseUsd ? `${currencyCode} (${currencyName})` : "USD (US Dollar)"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-text-muted font-bold">
                  {isBaseUsd ? currencySymbol : "$"}
                </span>
                <input
                  type="number"
                  value={targetVal}
                  onChange={(e) => handleTargetChange(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/5 focus:border-cyan-glow/50 focus:outline-none rounded-xl pl-9 pr-4 py-2.5 text-sm font-dm-mono text-text-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
