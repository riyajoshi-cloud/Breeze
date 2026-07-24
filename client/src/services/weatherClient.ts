/**
 * weatherClient.ts
 * Calls Open-Meteo APIs directly from the browser.
 * NO backend / Render dependency for weather data.
 */
import axios from 'axios';

// ─── Types (mirrors server-side interfaces) ───────────────────────────────────

export interface WeatherCondition {
  label: string;
  icon: string;
  category: 'clear' | 'cloudy' | 'rain' | 'snow' | 'thunderstorm' | 'fog';
}

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  weatherCode: number;
  condition: WeatherCondition;
  isDay: boolean;
  uvIndex: number;
  aqi: number;
  aqiLabel: string;
}

export interface HourlyForecastItem {
  time: string;
  temp: number;
  precipitationProbability: number;
  weatherCode: number;
  condition: WeatherCondition;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  condition: WeatherCondition;
  uvIndexMax: number;
  precipitationSum: number;
}

export interface LocationInfo {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface WeatherData {
  location: LocationInfo;
  units: 'metric' | 'imperial';
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  updatedAt: string;
}

// ─── WMO Code → Condition ─────────────────────────────────────────────────────

export const mapWMOCodeToCondition = (code: number): WeatherCondition => {
  switch (code) {
    case 0:  return { label: 'Clear Sky',        icon: 'sun',             category: 'clear' };
    case 1:  return { label: 'Mainly Clear',      icon: 'sun-cloud',       category: 'clear' };
    case 2:  return { label: 'Partly Cloudy',     icon: 'cloud-sun',       category: 'cloudy' };
    case 3:  return { label: 'Overcast',          icon: 'cloud',           category: 'cloudy' };
    case 45:
    case 48: return { label: 'Foggy',             icon: 'fog',             category: 'fog' };
    case 51:
    case 53:
    case 55: return { label: 'Drizzle',           icon: 'cloud-drizzle',   category: 'rain' };
    case 61:
    case 63:
    case 65: return { label: 'Rain',              icon: 'cloud-rain',      category: 'rain' };
    case 66:
    case 67: return { label: 'Freezing Rain',     icon: 'cloud-rain-snow', category: 'rain' };
    case 71:
    case 73:
    case 75:
    case 77: return { label: 'Snowfall',          icon: 'snowflake',       category: 'snow' };
    case 80:
    case 81:
    case 82: return { label: 'Rain Showers',      icon: 'cloud-showers',   category: 'rain' };
    case 85:
    case 86: return { label: 'Snow Showers',      icon: 'snowflake',       category: 'snow' };
    case 95:
    case 96:
    case 99: return { label: 'Thunderstorm',      icon: 'cloud-lightning', category: 'thunderstorm' };
    default: return { label: 'Partly Cloudy',     icon: 'cloud-sun',       category: 'cloudy' };
  }
};

export const getAQILabel = (aqi: number): string => {
  if (aqi <= 50)  return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

// ─── Simple in-memory cache ───────────────────────────────────────────────────

interface CacheEntry<T> { data: T; expiresAt: number }
const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (entry && Date.now() < entry.expiresAt) return entry.data;
  cache.delete(key);
  return null;
}

function setCached<T>(key: string, data: T, ttlMs: number) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ─── Main Weather Fetch (browser → Open-Meteo) ───────────────────────────────

export const fetchWeatherByCoords = async (
  lat: number,
  lon: number,
  units: 'metric' | 'imperial' = 'metric',
  cityName?: string,
  countryName?: string,
  stateName?: string,
): Promise<WeatherData> => {
  const cacheKey = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}_${units}`;
  const cached = getCached<WeatherData>(cacheKey);
  if (cached) return cached;

  const tempUnit = units === 'imperial' ? 'fahrenheit' : 'celsius';
  const windUnit = units === 'imperial' ? 'mph' : 'kmh';

  const forecastUrl =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m` +
    `&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum` +
    `&temperature_unit=${tempUnit}&wind_speed_unit=${windUnit}&timezone=auto`;

  const aqiUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${lat}&longitude=${lon}&current=us_aqi`;

  const [forecastRes, aqiRes] = await Promise.all([
    axios.get(forecastUrl),
    axios.get(aqiUrl).catch(() => ({ data: { current: { us_aqi: 35 } } })),
  ]);

  const fData     = forecastRes.data;
  const currentF  = fData.current;
  const hourlyF   = fData.hourly;
  const dailyF    = fData.daily;
  const usAqi     = aqiRes.data?.current?.us_aqi ?? 35;

  // Reverse geocode if city name not provided
  let resolvedName    = cityName    || 'Selected Location';
  let resolvedCountry = countryName || '';
  let resolvedState   = stateName;

  if (!cityName) {
    try {
      const revRes = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        { headers: { 'User-Agent': 'BreezeWeatherApp/1.0' } },
      );
      if (revRes.data?.address) {
        const a = revRes.data.address;
        resolvedName    = a.city || a.town || a.village || a.suburb || 'Current Location';
        resolvedCountry = a.country || '';
        resolvedState   = a.state   || undefined;
      }
    } catch {
      resolvedName = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
    }
  }

  // Build current
  const current: CurrentWeather = {
    temp:          Math.round(currentF.temperature_2m),
    feelsLike:     Math.round(currentF.apparent_temperature),
    humidity:      currentF.relative_humidity_2m,
    windSpeed:     Math.round(currentF.wind_speed_10m),
    windDirection: currentF.wind_direction_10m,
    pressure:      Math.round(currentF.surface_pressure),
    weatherCode:   currentF.weather_code,
    condition:     mapWMOCodeToCondition(currentF.weather_code),
    isDay:         Boolean(currentF.is_day),
    uvIndex:       dailyF.uv_index_max ? Math.round(dailyF.uv_index_max[0]) : 5,
    aqi:           Math.round(usAqi),
    aqiLabel:      getAQILabel(usAqi),
  };

  // Build hourly (next 24)
  const hourly: HourlyForecastItem[] = [];
  if (hourlyF?.time) {
    for (let i = 0; i < 24 && i < hourlyF.time.length; i++) {
      const d = new Date(hourlyF.time[i]);
      hourly.push({
        time:                    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp:                    Math.round(hourlyF.temperature_2m[i]),
        precipitationProbability: hourlyF.precipitation_probability?.[i] ?? 0,
        weatherCode:             hourlyF.weather_code[i],
        condition:               mapWMOCodeToCondition(hourlyF.weather_code[i]),
      });
    }
  }

  // Build daily (7 days)
  const daily: DailyForecastItem[] = [];
  if (dailyF?.time) {
    for (let i = 0; i < Math.min(7, dailyF.time.length); i++) {
      const d = new Date(dailyF.time[i]);
      daily.push({
        date:           dailyF.time[i],
        dayName:        i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        tempMax:        Math.round(dailyF.temperature_2m_max[i]),
        tempMin:        Math.round(dailyF.temperature_2m_min[i]),
        weatherCode:    dailyF.weather_code[i],
        condition:      mapWMOCodeToCondition(dailyF.weather_code[i]),
        uvIndexMax:     dailyF.uv_index_max ? Math.round(dailyF.uv_index_max[i]) : 5,
        precipitationSum: dailyF.precipitation_sum ? Number(dailyF.precipitation_sum[i].toFixed(1)) : 0,
      });
    }
  }

  const result: WeatherData = {
    location: { name: resolvedName, country: resolvedCountry, state: resolvedState, lat, lon },
    units,
    current,
    hourly,
    daily,
    updatedAt: new Date().toISOString(),
  };

  setCached(cacheKey, result, 5 * 60 * 1000); // 5 min TTL
  return result;
};

// ─── City Search (browser → Open-Meteo geocoding) ────────────────────────────

export const searchCitiesClient = async (query: string): Promise<LocationInfo[]> => {
  if (!query || query.trim().length < 2) return [];

  const cacheKey = `search_${query.trim().toLowerCase()}`;
  const cached = getCached<LocationInfo[]>(cacheKey);
  if (cached) return cached;

  try {
    const url =
      `https://geocoding-api.open-meteo.com/v1/search` +
      `?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`;

    const res = await axios.get(url);
    if (!res.data.results || !Array.isArray(res.data.results)) return [];

    const results: LocationInfo[] = res.data.results.map((item: any) => ({
      name:    item.name,
      country: item.country || '',
      state:   item.admin1  || undefined,
      lat:     item.latitude,
      lon:     item.longitude,
    }));

    setCached(cacheKey, results, 30 * 60 * 1000); // 30 min TTL
    return results;
  } catch {
    return [];
  }
};
