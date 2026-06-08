import { 
  Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, 
  CloudSnow, Sun, Moon, Wind, ShieldCheck, ShieldAlert
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface WeatherProps {
  lat: number;
  lng: number;
  cityName: string;
}

interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
  is_day: number;
}

interface AqiData {
  us_aqi: number;
  pm2_5: number;
  pm10: number;
}

const getWeatherDetails = (code: number, isDay: number): { label: string; icon: LucideIcon; color: string } => {
  const isNight = isDay === 0;
  
  if (code === 0) return { label: "Clear sky", icon: isNight ? Moon : Sun, color: isNight ? "text-violet-glow" : "text-amber-glow" };
  if ([1, 2, 3].includes(code)) return { label: "Partly cloudy", icon: Cloud, color: "text-muted" };
  if ([45, 48].includes(code)) return { label: "Fog", icon: CloudFog, color: "text-muted" };
  if ([51, 53, 56, 57].includes(code)) return { label: "Drizzle", icon: CloudDrizzle, color: "text-cyan-glow" };
  if ([61, 63, 65, 80, 81, 82].includes(code)) return { label: "Rain", icon: CloudRain, color: "text-blue-500" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Snow", icon: CloudSnow, color: "text-text-primary" };
  if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", icon: CloudLightning, color: "text-violet-glow" };
  
  return { label: "Unknown", icon: Cloud, color: "text-muted" };
};

const getAqiDetails = (aqi: number): { label: string; color: string; bg: string } => {
  if (aqi <= 50) return { label: "Good AQI", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
  if (aqi <= 100) return { label: "Moderate AQI", color: "text-amber-glow", bg: "bg-amber-glow/10 border-amber-glow/20" };
  return { label: "Unhealthy AQI", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
};

function WeatherContent({ weather, cityName, aqi }: { weather: WeatherData; cityName: string; aqi: AqiData | null }) {
  const { label, icon: Icon, color } = getWeatherDetails(weather.weathercode, weather.is_day);
  const aqiInfo = aqi ? getAqiDetails(aqi.us_aqi) : null;
  
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.03] glass-card p-6 shadow-sm transition-all hover:bg-white/[0.05] animate-in fade-in duration-500">
      <div className="grid gap-6 md:grid-cols-2 items-center">
        {/* Left Side: Temperature and Conditions */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted font-sora">Live Weather</p>
              <h3 className="text-sm font-semibold text-text-primary font-sora">{cityName}</h3>
            </div>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-text-primary font-dm-mono">{weather.temperature}°C</span>
            <span className="text-xs text-text-secondary font-sora font-medium">({label})</span>
          </div>

          <div className="flex items-center gap-2 text-text-secondary font-sora text-xs">
            <Wind className="h-3.5 w-3.5" />
            <span>Wind Speed: <span className="font-bold font-dm-mono">{weather.windspeed} km/h</span></span>
          </div>
        </div>

        {/* Right Side: Air Quality Index (AQI) */}
        {aqiInfo && aqi && (
          <div className={`p-4 rounded-xl border ${aqiInfo.bg} flex flex-col justify-between h-full font-sora`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Air Quality</span>
              {aqi.us_aqi <= 50 ? (
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="h-4 w-4 text-amber-glow" />
              )}
            </div>
            
            <div className="mt-2">
              <span className="text-2xl font-black font-dm-mono text-text-primary">{aqi.us_aqi}</span>
              <span className={`text-xs font-bold ml-2 ${aqiInfo.color}`}>{aqiInfo.label}</span>
            </div>

            <div className="mt-3 flex gap-4 text-[10px] text-text-muted">
              <span>PM2.5: <span className="font-bold text-text-secondary font-dm-mono">{aqi.pm2_5} µg/m³</span></span>
              <span>PM10: <span className="font-bold text-text-secondary font-dm-mono">{aqi.pm10} µg/m³</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function LiveWeather({ lat, lng, cityName }: WeatherProps) {
  let weather: WeatherData | null = null;
  let aqi: AqiData | null = null;
  
  try {
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`,
        { next: { revalidate: 1800 } }
      ),
      fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi,pm2_5,pm10`,
        { next: { revalidate: 1800 } }
      ),
    ]);
    
    if (weatherRes.ok) {
      const data = await weatherRes.json();
      weather = data.current_weather;
    }
    if (aqiRes.ok) {
      const data = await aqiRes.json();
      aqi = data.current;
    }
  } catch {
    // Fail silently if API is down
  }

  if (!weather) return null;

  return <WeatherContent weather={weather} cityName={cityName} aqi={aqi} />;
}
