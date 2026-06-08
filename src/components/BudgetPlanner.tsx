"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Calculator, DollarSign, Briefcase, 
  Hotel, Utensils, Car, Compass, Info, ArrowRight, Loader2, Coins
} from "lucide-react";
import { getClientCountries, CachedCountry } from "@/lib/clientCache";

interface BudgetConfig {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
}

interface TravelStyleData {
  backpacker: BudgetConfig;
  moderate: BudgetConfig;
  luxury: BudgetConfig;
}

// Cost Index multipliers in USD per day (Accommodation, Food, Transport, Activities)
const REGIONAL_COSTS: Record<string, TravelStyleData> = {
  "western-europe": {
    backpacker: { accommodation: 35, food: 20, transport: 10, activities: 15 },
    moderate: { accommodation: 120, food: 60, transport: 25, activities: 35 },
    luxury: { accommodation: 350, food: 150, transport: 80, activities: 120 }
  },
  "eastern-europe": {
    backpacker: { accommodation: 22, food: 14, transport: 6, activities: 10 },
    moderate: { accommodation: 70, food: 35, transport: 15, activities: 20 },
    luxury: { accommodation: 220, food: 95, transport: 50, activities: 70 }
  },
  "southeast-asia": {
    backpacker: { accommodation: 10, food: 8, transport: 3, activities: 7 },
    moderate: { accommodation: 40, food: 25, transport: 12, activities: 18 },
    luxury: { accommodation: 180, food: 80, transport: 40, activities: 60 }
  },
  "east-asia": {
    backpacker: { accommodation: 32, food: 18, transport: 8, activities: 14 },
    moderate: { accommodation: 100, food: 55, transport: 20, activities: 30 },
    luxury: { accommodation: 280, food: 130, transport: 70, activities: 100 }
  },
  "south-asia": {
    backpacker: { accommodation: 8, food: 6, transport: 2, activities: 5 },
    moderate: { accommodation: 30, food: 20, transport: 10, activities: 12 },
    luxury: { accommodation: 150, food: 60, transport: 35, activities: 45 }
  },
  "middle-east": {
    backpacker: { accommodation: 20, food: 12, transport: 6, activities: 10 },
    moderate: { accommodation: 80, food: 45, transport: 20, activities: 25 },
    luxury: { accommodation: 250, food: 110, transport: 60, activities: 80 }
  },
  "north-america": {
    backpacker: { accommodation: 45, food: 25, transport: 15, activities: 20 },
    moderate: { accommodation: 160, food: 75, transport: 35, activities: 45 },
    luxury: { accommodation: 450, food: 180, transport: 100, activities: 150 }
  },
  "central-america": {
    backpacker: { accommodation: 15, food: 10, transport: 4, activities: 8 },
    moderate: { accommodation: 50, food: 28, transport: 12, activities: 18 },
    luxury: { accommodation: 180, food: 75, transport: 45, activities: 60 }
  },
  "south-america": {
    backpacker: { accommodation: 16, food: 11, transport: 4, activities: 8 },
    moderate: { accommodation: 55, food: 32, transport: 15, activities: 20 },
    luxury: { accommodation: 220, food: 90, transport: 50, activities: 75 }
  },
  "oceania": {
    backpacker: { accommodation: 40, food: 22, transport: 12, activities: 18 },
    moderate: { accommodation: 140, food: 65, transport: 30, activities: 40 },
    luxury: { accommodation: 380, food: 160, transport: 90, activities: 130 }
  },
  "africa": {
    backpacker: { accommodation: 14, food: 9, transport: 3, activities: 7 },
    moderate: { accommodation: 50, food: 28, transport: 14, activities: 18 },
    luxury: { accommodation: 200, food: 85, transport: 45, activities: 70 }
  }
};

const US_BASELINE_COSTS: TravelStyleData = {
  backpacker: { accommodation: 45, food: 25, transport: 15, activities: 20 },
  moderate: { accommodation: 160, food: 75, transport: 35, activities: 45 },
  luxury: { accommodation: 450, food: 180, transport: 100, activities: 150 }
};

const COMMON_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "ZAR", symbol: "R", name: "South African Rand" }
];

function getCostRegion(country: CachedCountry): string {
  const subregion = country.subregion?.toLowerCase() || "";
  const region = country.region?.toLowerCase() || "";

  if (subregion.includes("western europe") || subregion.includes("northern europe") || subregion.includes("southern europe")) {
    return "western-europe";
  }
  if (subregion.includes("eastern europe")) {
    return "eastern-europe";
  }
  if (subregion.includes("south-eastern asia") || subregion.includes("southeast asia")) {
    return "southeast-asia";
  }
  if (subregion.includes("eastern asia") || subregion.includes("east asia")) {
    return "east-asia";
  }
  if (subregion.includes("southern asia") || subregion.includes("south asia")) {
    return "south-asia";
  }
  if (subregion.includes("western asia") || subregion.includes("middle east")) {
    return "middle-east";
  }
  if (subregion.includes("north america") || region.includes("americas") && subregion.includes("northern america")) {
    return "north-america";
  }
  if (subregion.includes("central america") || subregion.includes("caribbean")) {
    return "central-america";
  }
  if (subregion.includes("south america")) {
    return "south-america";
  }
  if (region.includes("oceania")) {
    return "oceania";
  }
  return "africa"; // default fallback
}

interface BudgetPlannerProps {
  initialCountryName?: string;
}

function BudgetPlannerContent({ initialCountryName }: BudgetPlannerProps) {
  const searchParams = useSearchParams();
  const urlCountry = searchParams?.get("country") || undefined;
  const targetInitialCountry = initialCountryName || urlCountry;

  const [countries, setCountries] = useState<CachedCountry[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [selectedCountryCca3, setSelectedCountryCca3] = useState<string>("");
  const [duration, setDuration] = useState<number>(7);
  const [travelers, setTravelers] = useState<number>(1);
  const [travelStyle, setTravelStyle] = useState<"backpacker" | "moderate" | "luxury">("moderate");
  const [homeCurrency, setHomeCurrency] = useState<string>("USD");

  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ USD: 1 });
  const [loadingRates, setLoadingRates] = useState(false);
  const [pppRatio, setPppRatio] = useState<number | null>(null);
  const [loadingPpp, setLoadingPpp] = useState(false);

  // Fetch countries
  useEffect(() => {
    let active = true;
    getClientCountries()
      .then((data) => {
        if (!active) return;
        setCountries(data.sort((a, b) => a.name.common.localeCompare(b.name.common)));
        setLoadingCountries(false);

        // Find initial selected country
        if (targetInitialCountry) {
          const matched = data.find(
            (c) => c.name.common.toLowerCase() === targetInitialCountry.toLowerCase()
          );
          if (matched) setSelectedCountryCca3(matched.cca3);
        } else {
          // Default to France/US or first country
          const matched = data.find((c) => c.name.common === "France") || data[0];
          if (matched) setSelectedCountryCca3(matched.cca3);
        }
      })
      .catch(() => {
        if (active) setLoadingCountries(false);
      });

    return () => {
      active = false;
    };
  }, [targetInitialCountry]);

  // Fetch Exchange rates against USD
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoadingRates(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        if (data.rates) {
          setExchangeRates(data.rates);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadingRates(false);
      });
  }, []);

  // Fetch PPP Ratio from World Bank indicator PA.NUS.PPPC.RF
  useEffect(() => {
    if (!selectedCountryCca3) return;
    let active = true;
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoadingPpp(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    fetch(`https://api.worldbank.org/v2/country/${selectedCountryCca3}/indicator/PA.NUS.PPPC.RF?format=json&per_page=10`)
      .then((res) => {
        if (!res.ok) throw new Error("World Bank API error");
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        if (data && data[1]) {
          const validEntry = data[1].find((item: { value: number | null }) => item.value !== null);
          if (validEntry) {
            setPppRatio(validEntry.value);
            return;
          }
        }
        setPppRatio(null);
      })
      .catch(() => {
        if (active) setPppRatio(null);
      })
      .finally(() => {
        if (active) {
          setLoadingPpp(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedCountryCca3]);

  const activeCountry = countries.find((c) => c.cca3 === selectedCountryCca3);

  // Math Calculations
  const calculations = React.useMemo(() => {
    if (!activeCountry) return null;

    let costSheet = { accommodation: 0, food: 0, transport: 0, activities: 0 };

    if (pppRatio !== null) {
      // Dynamically compute based on World Bank PPP Factor, relative to US baseline
      const base = US_BASELINE_COSTS[travelStyle];
      costSheet = {
        accommodation: Math.max(6, base.accommodation * pppRatio),
        food: Math.max(4, base.food * pppRatio),
        transport: Math.max(2, base.transport * pppRatio),
        activities: Math.max(3, base.activities * pppRatio),
      };
    } else {
      // Fallback to regional cost indices
      const regionKey = getCostRegion(activeCountry);
      costSheet = REGIONAL_COSTS[regionKey]?.[travelStyle] || REGIONAL_COSTS["africa"][travelStyle];
    }

    const conversionRate = exchangeRates[homeCurrency] || 1;

    // Multiply USD costs by conversion rate
    const dailyLodging = costSheet.accommodation * conversionRate;
    const dailyFood = costSheet.food * conversionRate;
    const dailyTransport = costSheet.transport * conversionRate;
    const dailyActivities = costSheet.activities * conversionRate;

    const lodgingTotal = dailyLodging * duration * (travelers > 1 ? Math.ceil(travelers / 2) : 1); // assume double occupancy rooms
    const foodTotal = dailyFood * duration * travelers;
    const transportTotal = dailyTransport * duration * travelers;
    const activitiesTotal = dailyActivities * duration * travelers;

    const total = lodgingTotal + foodTotal + transportTotal + activitiesTotal;
    const perPerson = total / travelers;
    const perDay = total / duration;

    return {
      dailyLodging,
      dailyFood,
      dailyTransport,
      dailyActivities,
      lodgingTotal,
      foodTotal,
      transportTotal,
      activitiesTotal,
      total,
      perPerson,
      perDay
    };
  }, [activeCountry, travelStyle, duration, travelers, homeCurrency, exchangeRates, pppRatio]);

  const currencySymbol = COMMON_CURRENCIES.find((c) => c.code === homeCurrency)?.symbol || "$";

  const getStyleTip = () => {
    if (!activeCountry) return "";
    const name = activeCountry.name.common;
    if (travelStyle === "backpacker") {
      return `For a backpacking trip to ${name}, stick to local hostels, utilize high-frequency public trains/buses, and eat street food or buy groceries. Many top sights like natural parks, cathedrals, and old towns have free admission.`;
    }
    if (travelStyle === "moderate") {
      return `In ${name}, a moderate budget lets you stay in clean mid-tier hotels, dine at regional bistros/cafes, use occasional taxis, and pay for guided standard museum tours and excursions.`;
    }
    return `Enjoying luxury in ${name} gives you access to premium 5-star boutiques, high-end fine dining, custom private transfers/tours, and special exclusive access to main sights and cultural events.`;
  };

  if (loadingCountries) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-glow" />
        <span className="text-sm text-text-muted font-sora">Syncing cost indices...</span>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      
      {/* Settings Panel: 5 columns */}
      <div className="lg:col-span-5 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 glass-card space-y-6">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 font-sora">
            <Calculator className="h-5 w-5 text-cyan-glow" />
            Budget Settings
          </h2>

          {/* 1. Country Selection */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted font-bold font-sora">Destination</label>
            <select
              value={selectedCountryCca3}
              onChange={(e) => setSelectedCountryCca3(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl bg-white/[0.03] px-4 text-sm font-medium shadow-sm ring-1 ring-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-glow/50 text-text-primary cursor-pointer font-sora"
            >
              {countries.map((c) => (
                <option key={c.cca3} value={c.cca3} className="bg-atlas-900 text-text-primary">
                  {c.name.common} ({c.region})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Duration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs uppercase tracking-wider text-muted font-bold font-sora">
              <span>Trip Duration</span>
              <span className="text-cyan-glow text-sm font-dm-mono lowercase">{duration} days</span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full accent-cyan-glow bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer"
            />
          </div>

          {/* 3. Traveler Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs uppercase tracking-wider text-muted font-bold font-sora">
              <span>Travelers</span>
              <span className="text-cyan-glow text-sm font-dm-mono lowercase">{travelers} traveler{travelers > 1 ? "s" : ""}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={travelers}
              onChange={(e) => setTravelers(parseInt(e.target.value))}
              className="w-full accent-cyan-glow bg-white/5 rounded-lg appearance-none h-1.5 cursor-pointer"
            />
          </div>

          {/* 4. Home Currency Selector */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted font-bold font-sora">Convert To (Base Currency)</label>
            <div className="relative">
              <select
                value={homeCurrency}
                onChange={(e) => setHomeCurrency(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl bg-white/[0.03] px-4 text-sm font-medium shadow-sm ring-1 ring-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-glow/50 text-text-primary cursor-pointer font-sora"
              >
                {COMMON_CURRENCIES.map((cur) => (
                  <option key={cur.code} value={cur.code} className="bg-atlas-900 text-text-primary">
                    {cur.code} - {cur.name} ({cur.symbol})
                  </option>
                ))}
              </select>
              {loadingRates && (
                <div className="absolute right-3 top-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted" />
                </div>
              )}
            </div>
          </div>

          {/* 5. Travel Style Radio Blocks */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider text-muted font-bold font-sora">Travel Style</label>
            <div className="grid grid-cols-1 gap-2.5">
              
              {/* Backpacker */}
              <button
                type="button"
                onClick={() => setTravelStyle("backpacker")}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  travelStyle === "backpacker"
                    ? "bg-cyan-glow/[0.06] border-cyan-glow/30 ring-1 ring-cyan-glow/20"
                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                }`}
              >
                <div className={`p-2 rounded-lg ${travelStyle === "backpacker" ? "bg-cyan-glow/10 text-cyan-glow" : "bg-white/5 text-muted"}`}>
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-sora text-text-primary">Backpacker</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">Budget hostels, public transit, street food, free sights.</p>
                </div>
              </button>

              {/* Moderate */}
              <button
                type="button"
                onClick={() => setTravelStyle("moderate")}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  travelStyle === "moderate"
                    ? "bg-amber-glow/[0.06] border-amber-glow/30 ring-1 ring-amber-glow/20"
                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                }`}
              >
                <div className={`p-2 rounded-lg ${travelStyle === "moderate" ? "bg-amber-glow/10 text-amber-glow" : "bg-white/5 text-muted"}`}>
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-sora text-text-primary">Moderate</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">3-star hotels, local eateries, occasional cabs, standard tours.</p>
                </div>
              </button>

              {/* Luxury */}
              <button
                type="button"
                onClick={() => setTravelStyle("luxury")}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  travelStyle === "luxury"
                    ? "bg-violet-glow/[0.06] border-violet-glow/30 ring-1 ring-violet-glow/20"
                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
                }`}
              >
                <div className={`p-2 rounded-lg ${travelStyle === "luxury" ? "bg-violet-glow/10 text-violet-glow" : "bg-white/5 text-muted"}`}>
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-sora text-text-primary">Luxury</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">5-star boutiques, fine dining, private transfers, premium access.</p>
                </div>
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* Results Panel: 7 columns */}
      <div className="lg:col-span-7 space-y-6">
        {calculations && activeCountry && (
          <>
            {/* Total Budget Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 glass-card space-y-6">
              <div>
                <h3 className="text-xs uppercase tracking-wider text-muted font-bold font-sora">Estimated Total Budget</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl sm:text-5xl font-black font-dm-mono text-cyan-glow">
                    {currencySymbol}{Math.round(calculations.total).toLocaleString()}
                  </span>
                  <span className="text-sm text-text-muted font-sora">({homeCurrency})</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5 font-sora text-center">
                  <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-muted uppercase tracking-wider block font-bold">Daily Cost</span>
                    <span className="text-lg font-bold text-text-primary font-dm-mono block mt-1">
                      {currencySymbol}{Math.round(calculations.perDay).toLocaleString()} / day
                    </span>
                  </div>
                  <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-muted uppercase tracking-wider block font-bold">Per Traveler</span>
                    <span className="text-lg font-bold text-text-primary font-dm-mono block mt-1">
                      {currencySymbol}{Math.round(calculations.perPerson).toLocaleString()} total
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Cost Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs uppercase tracking-wider text-muted font-bold font-sora">Cost Category Breakdown</h4>
                
                <div className="space-y-3.5">
                  {/* Accommodation */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-sora">
                      <span className="flex items-center gap-1.5 text-text-secondary">
                        <Hotel className="h-3.5 w-3.5 text-cyan-glow" /> Accommodation
                      </span>
                      <span className="font-bold text-text-primary font-dm-mono">
                        {currencySymbol}{Math.round(calculations.lodgingTotal).toLocaleString()} ({Math.round((calculations.lodgingTotal / calculations.total) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-cyan-glow h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(calculations.lodgingTotal / calculations.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Food */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-sora">
                      <span className="flex items-center gap-1.5 text-text-secondary">
                        <Utensils className="h-3.5 w-3.5 text-amber-glow" /> Food & Meals
                      </span>
                      <span className="font-bold text-text-primary font-dm-mono">
                        {currencySymbol}{Math.round(calculations.foodTotal).toLocaleString()} ({Math.round((calculations.foodTotal / calculations.total) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-glow h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(calculations.foodTotal / calculations.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Transport */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-sora">
                      <span className="flex items-center gap-1.5 text-text-secondary">
                        <Car className="h-3.5 w-3.5 text-emerald-400" /> Transit & Transport
                      </span>
                      <span className="font-bold text-text-primary font-dm-mono">
                        {currencySymbol}{Math.round(calculations.transportTotal).toLocaleString()} ({Math.round((calculations.transportTotal / calculations.total) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(calculations.transportTotal / calculations.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-sora">
                      <span className="flex items-center gap-1.5 text-text-secondary">
                        <Compass className="h-3.5 w-3.5 text-violet-glow" /> Sights & Excursions
                      </span>
                      <span className="font-bold text-text-primary font-dm-mono">
                        {currencySymbol}{Math.round(calculations.activitiesTotal).toLocaleString()} ({Math.round((calculations.activitiesTotal / calculations.total) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-violet-glow h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(calculations.activitiesTotal / calculations.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Travel Strategy & Tip card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 glass-card space-y-4 font-sora">
              <h4 className="text-xs uppercase tracking-wider text-muted font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-amber-glow" />
                  Budget Strategy & Local Tips
                </span>
                {loadingPpp && (
                  <span className="flex items-center gap-1 text-[10px] text-text-muted normal-case font-normal">
                    <Loader2 className="h-2.5 w-2.5 animate-spin text-cyan-glow" />
                    Fetching Live PPP...
                  </span>
                )}
              </h4>
              
              {pppRatio !== null && (
                <div className="bg-cyan-glow/5 border border-cyan-glow/10 rounded-xl p-3.5 flex items-start gap-2.5">
                  <Coins className="h-4 w-4 text-cyan-glow shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-xs">
                    <span className="font-bold text-text-primary block">World Bank Cost Index Active</span>
                    <span className="text-text-muted mt-1 block leading-relaxed">
                      Costs are dynamically calculated using factual **Purchasing Power Parity (PPP)** data from the World Bank (Price ratio: <strong>{pppRatio.toFixed(3)}</strong> vs the US base). Prices in {activeCountry.name.common} are roughly <strong>{Math.round(Math.abs(1 - pppRatio) * 100)}% {pppRatio < 1 ? "cheaper" : "more expensive"}</strong> than the United States.
                    </span>
                  </div>
                </div>
              )}

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {getStyleTip()}
              </p>
              
              <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-muted">
                <span>Costs based on World Bank Purchasing Power Parity.</span>
                <Link
                  href={`/country/${encodeURIComponent(activeCountry.name.common.toLowerCase())}`}
                  className="flex items-center gap-1 text-cyan-glow hover:underline text-xs font-medium"
                >
                  View Country details <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}

export default function BudgetPlanner(props: BudgetPlannerProps) {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-glow" />
        <span className="text-sm text-text-muted font-sora">Loading budget interface...</span>
      </div>
    }>
      <BudgetPlannerContent {...props} />
    </Suspense>
  );
}
