"use client";

import { useEffect, useState } from "react";
import { Country } from "@/types/country";

export default function PrintLayout({ country, wikiSummary, borderCountries }: { country: Country; wikiSummary: {extract: string} | null; borderCountries: Country[] }) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, string>>({});
  const [weather, setWeather] = useState<{ temp?: number; aqi?: number; pm25?: number }>({});
  const [destinations, setDestinations] = useState<{name: string; type: string; description: string}[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      // 1. Fetch Stats
      const INDICATORS = [
        { key: "gdp", code: "NY.GDP.MKTP.CD", format: (v: number) => `$${(v / 1e12).toFixed(3)} Trillion` },
        { key: "gdpPerCapita", code: "NY.GDP.PCAP.CD", format: (v: number) => `$${Math.round(v).toLocaleString()}` },
        { key: "inflation", code: "FP.CPI.TOTL.ZG", format: (v: number) => `${v.toFixed(1)}%` },
        { key: "unemployment", code: "SL.UEM.TOTL.ZS", format: (v: number) => `${v.toFixed(1)}%` },
        { key: "popGrowth", code: "SP.POP.GROW", format: (v: number) => `${v.toFixed(2)}%` },
        { key: "lifeExpectancy", code: "SP.DYN.LE00.IN", format: (v: number) => `${v.toFixed(1)} years` },
        { key: "literacyAdult", code: "SE.ADT.LITR.ZS", format: (v: number) => `${v.toFixed(1)}%` },
        { key: "gini", code: "SI.POV.GINI", format: (v: number) => v.toFixed(1) },
        { key: "co2", code: "EN.GHG.CO2.PC.CE.AR5", format: (v: number) => `${v.toFixed(2)} tons` },
        { key: "forest", code: "AG.LND.FRST.ZS", format: (v: number) => `${v.toFixed(1)}%` },
        { key: "agriculture", code: "AG.LND.AGRI.ZS", format: (v: number) => `${v.toFixed(1)}%` },
      ];

      const statsPromise = Promise.all(
        INDICATORS.map(async (ind) => {
          try {
            const res = await fetch(`https://api.worldbank.org/v2/country/${country.cca3}/indicator/${ind.code}?format=json&mrv=1`);
            const data = await res.json();
            const val = data[1]?.[0]?.value;
            const year = data[1]?.[0]?.date;
            if (val != null) {
              return { key: ind.key, label: ind.format(val) + ` (${year})` };
            }
          } catch {}
          return { key: ind.key, label: "N/A" };
        })
      ).then(results => Object.fromEntries(results.map(r => [r.key, r.label])));

      // 2. Fetch Weather
      const weatherPromise = Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${country.latlng[0]}&longitude=${country.latlng[1]}&current_weather=true`).then(r => r.json()).catch(() => ({})),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${country.latlng[0]}&longitude=${country.latlng[1]}&current=us_aqi,pm2_5`).then(r => r.json()).catch(() => ({}))
      ]).then(([wData, aqData]) => ({
        temp: wData?.current_weather?.temperature,
        aqi: aqData?.current?.us_aqi,
        pm25: aqData?.current?.pm2_5
      }));

      // 3. Fetch Destinations
      const destinationsPromise = fetch(`/api/destinations?lat=${country.latlng[0]}&lng=${country.latlng[1]}&country=${encodeURIComponent(country.name.common)}`)
        .then(r => r.json())
        .then(d => d.destinations ? d.destinations.slice(0, 5) : [])
        .catch(() => []);

      const [s, w, d] = await Promise.all([statsPromise, weatherPromise, destinationsPromise]);
      
      if (isMounted) {
        setStats(s);
        setWeather(w);
        setDestinations(d);
        setIsLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [country]);

  if (isLoading) {
    return (
      <div className="hidden print:flex print-page h-screen items-center justify-center flex-col text-center">
        <h1 className="text-3xl font-bold mb-4 text-black">Preparing Document...</h1>
        <p className="text-gray-600">Please cancel this print dialogue and wait 2 seconds for data to load before printing.</p>
      </div>
    );
  }

  return (
    <div className="hidden print:block print-page bg-white">
      <table className="w-full">
        <thead>
          <tr><td className="h-[14mm] border-none p-0"></td></tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-none p-0 px-[14mm]">
              <header className="mb-6 flex justify-between items-end pb-4 border-b-2 border-gray-200 break-inside-avoid">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-sora">World Insights · Comprehensive Country Sheet</p>
                  <h1 className="mt-2 text-4xl font-black text-black">{country.name.common}</h1>
                  <p className="mt-1 text-base text-gray-700">{country.name.official}</p>
                </div>
                <div className="text-right text-xs text-gray-500 font-dm-mono">
                  <p>Generated: {new Date().toLocaleDateString()}</p>
                  <p>Coordinates: {country.latlng[0].toFixed(2)}°, {country.latlng[1].toFixed(2)}°</p>
                </div>
              </header>

              <section className="mb-8 flex gap-6 items-start break-inside-avoid">
                <div className="flex flex-col gap-4 shrink-0">
                  <div className="w-40 h-24 border border-gray-200 rounded overflow-hidden shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={country.flags.svg} alt={`Flag`} className="w-full h-full object-cover" />
                  </div>
                  {country.coatOfArms?.svg && (
                    <div className="w-24 h-24 p-2 border border-gray-200 rounded object-contain flex items-center justify-center self-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={country.coatOfArms.svg} alt="Coat of Arms" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
                <div className="text-sm leading-relaxed text-gray-800">
                  {wikiSummary ? (
                    <p className="mb-3">{wikiSummary.extract}</p>
                  ) : (
                    <p className="mb-3">
                      {country.name.common} is a {country.independent ? "sovereign" : "non-sovereign"} {country.unMember ? "UN member" : "non-UN member"} country located in {country.subregion ? country.subregion + ", " : ""}{country.region}, with {country.capital?.[0] ? `${country.capital[0]} as its capital` : "no recognized capital"}.
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded border border-gray-100">
                    <p><strong className="text-black">Demonym:</strong> {country.demonyms?.eng?.m || "N/A"}</p>
                    <p><strong className="text-black">Timezones:</strong> {country.timezones.join(", ")}</p>
                    <p><strong className="text-black">Driving Side:</strong> <span className="capitalize">{country.car.side}</span></p>
                    <p><strong className="text-black">Calling Code:</strong> {`${country.idd.root}${country.idd.suffixes?.[0] || ""}`}</p>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-8 mb-6 break-inside-avoid">
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-black border-b border-gray-200 pb-1">Quick Facts</h2>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr><th className="w-1/3">Capital</th><td>{country.capital?.[0] || "N/A"}</td></tr>
                      <tr><th>Region</th><td>{country.region}{country.subregion ? ` (${country.subregion})` : ""}</td></tr>
                      <tr><th>Population</th><td>{country.population.toLocaleString()}</td></tr>
                      <tr><th>Area</th><td>{country.area.toLocaleString()} km²</td></tr>
                      <tr><th>Languages</th><td>{country.languages ? Object.values(country.languages).join(", ") : "N/A"}</td></tr>
                      <tr><th>Currencies</th><td>{country.currencies ? Object.values(country.currencies as Record<string, {name: string, symbol: string}>).map(c => `${c.name} (${c.symbol})`).join(", ") : "N/A"}</td></tr>
                      <tr><th>ISO 3166-1</th><td>{country.cca3}</td></tr>
                      {country.tld && <tr><th>TLD</th><td>{country.tld.join(", ")}</td></tr>}
                      {country.fifa && <tr><th>FIFA</th><td>{country.fifa}</td></tr>}
                      <tr><th>UN Member</th><td>{country.unMember ? "Yes" : "No"}</td></tr>
                    </tbody>
                  </table>
                </section>

                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-black border-b border-gray-200 pb-1">Economy & Demographics</h2>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr><th className="w-1/2">GDP (Total)</th><td>{stats.gdp}</td></tr>
                      <tr><th>GDP per Capita</th><td>{stats.gdpPerCapita}</td></tr>
                      <tr><th>Inflation Rate</th><td>{stats.inflation}</td></tr>
                      <tr><th>Unemployment Rate</th><td>{stats.unemployment}</td></tr>
                      <tr><th>Population Growth</th><td>{stats.popGrowth}</td></tr>
                      <tr><th>Life Expectancy</th><td>{stats.lifeExpectancy}</td></tr>
                      <tr><th>Adult Literacy</th><td>{stats.literacyAdult}</td></tr>
                      <tr><th>GINI Index</th><td>{stats.gini}</td></tr>
                    </tbody>
                  </table>
                </section>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-6 break-inside-avoid">
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-black border-b border-gray-200 pb-1">Environment & Climate</h2>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr><th className="w-1/3">CO₂ per Capita</th><td>{stats.co2}</td></tr>
                      <tr><th>Forest Area</th><td>{stats.forest}</td></tr>
                      <tr><th>Agricultural Land</th><td>{stats.agriculture}</td></tr>
                      <tr><th>Capital Temp</th><td>{weather.temp !== undefined ? `${weather.temp}°C` : "N/A"}</td></tr>
                      <tr><th>Air Quality (AQI)</th><td>{weather.aqi !== undefined ? weather.aqi : "N/A"}</td></tr>
                      <tr><th>PM2.5 Level</th><td>{weather.pm25 !== undefined ? `${weather.pm25} µg/m³` : "N/A"}</td></tr>
                    </tbody>
                  </table>
                </section>

                <section>
                  {borderCountries && borderCountries.length > 0 && (
                    <>
                      <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-black border-b border-gray-200 pb-1">Neighboring Countries</h2>
                      <p className="text-sm text-gray-800 leading-relaxed">{borderCountries.map((b) => b.name.common).join(", ")}</p>
                    </>
                  )}
                </section>
              </div>

              {destinations.length > 0 && (
                <section className="mb-6 break-inside-avoid">
                  <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-black border-b border-gray-200 pb-1">Popular Landmarks & Destinations</h2>
                  <ul className="list-disc pl-5 text-sm text-gray-800 space-y-2">
                    {destinations.map((d, i) => (
                      <li key={i}>
                        <strong className="text-black">{d.name}</strong> ({d.type}): {d.description}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <footer className="pt-4 mt-8 border-t border-gray-200 text-xs text-gray-500 flex justify-between break-inside-avoid">
                <span>World Insights Comprehensive Data Sheet</span>
                <span>Source: World Bank, Open-Meteo, RESTCountries</span>
              </footer>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr><td className="h-[16mm] border-none p-0"></td></tr>
        </tfoot>
      </table>
    </div>
  );
}