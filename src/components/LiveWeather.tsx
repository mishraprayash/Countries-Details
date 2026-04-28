import { 
  Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, 
  CloudSnow, Sun, Moon, Wind
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

const getWeatherDetails = (code: number, isDay: number): { label: string; icon: LucideIcon; color: string } => {
  const isNight = isDay === 0;
  
  if (code === 0) return { label: "Clear sky", icon: isNight ? Moon : Sun, color: isNight ? "text-indigo-300" : "text-amber-400" };
  if ([1, 2, 3].includes(code)) return { label: "Partly cloudy", icon: Cloud, color: "text-zinc-400" };
  if ([45, 48].includes(code)) return { label: "Fog", icon: CloudFog, color: "text-zinc-400" };
  if ([51, 53, 56, 57].includes(code)) return { label: "Drizzle", icon: CloudDrizzle, color: "text-blue-400" };
  if ([61, 63, 65, 80, 81, 82].includes(code)) return { label: "Rain", icon: CloudRain, color: "text-blue-500" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Snow", icon: CloudSnow, color: "text-white" };
  if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", icon: CloudLightning, color: "text-purple-400" };
  
  return { label: "Unknown", icon: Cloud, color: "text-zinc-400" };
};

function WeatherContent({ weather, cityName }: { weather: WeatherData; cityName: string }) {
  const { label, icon: Icon, color } = getWeatherDetails(weather.weathercode, weather.is_day);
  
  return (
    <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 shadow-sm transition-all hover:bg-zinc-900 animate-in fade-in duration-500">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Live Weather</p>
            <h3 className="text-sm font-semibold text-white">{cityName}</h3>
          </div>
        </div>
        <span className="text-2xl font-black text-white">{weather.temperature}°C</span>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <Cloud className="h-4 w-4" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center justify-end gap-2 text-zinc-400">
          <span className="text-sm font-medium">{weather.windspeed} km/h</span>
          <Wind className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export default async function LiveWeather({ lat, lng, cityName }: WeatherProps) {
  let weather: WeatherData | null = null;
  
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`,
      { next: { revalidate: 1800 } }
    );
    
    if (res.ok) {
      const data = await res.json();
      weather = data.current_weather;
    }
  } catch {
    // Fail silently if weather API is down
  }

  if (!weather) return null;

  return <WeatherContent weather={weather} cityName={cityName} />;
}
