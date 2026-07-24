import axios from 'axios';
import NodeCache from 'node-cache';

// Cache weather responses for 10 minutes (600 seconds)
const weatherCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

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

// Map WMO Weather Codes
export const mapWMOCodeToCondition = (code: number): WeatherCondition => {
  switch (code) {
    case 0:
      return { label: 'Clear Sky', icon: 'sun', category: 'clear' };
    case 1:
      return { label: 'Mainly Clear', icon: 'sun-cloud', category: 'clear' };
    case 2:
      return { label: 'Partly Cloudy', icon: 'cloud-sun', category: 'cloudy' };
    case 3:
      return { label: 'Overcast', icon: 'cloud', category: 'cloudy' };
    case 45:
    case 48:
      return { label: 'Foggy', icon: 'fog', category: 'fog' };
    case 51:
    case 53:
    case 55:
      return { label: 'Drizzle', icon: 'cloud-drizzle', category: 'rain' };
    case 61:
    case 63:
    case 65:
      return { label: 'Rain', icon: 'cloud-rain', category: 'rain' };
    case 66:
    case 67:
      return { label: 'Freezing Rain', icon: 'cloud-rain-snow', category: 'rain' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { label: 'Snowfall', icon: 'snowflake', category: 'snow' };
    case 80:
    case 81:
    case 82:
      return { label: 'Rain Showers', icon: 'cloud-showers', category: 'rain' };
    case 85:
    case 86:
      return { label: 'Snow Showers', icon: 'snowflake', category: 'snow' };
    case 95:
    case 96:
    case 99:
      return { label: 'Thunderstorm', icon: 'cloud-lightning', category: 'thunderstorm' };
    default:
      return { label: 'Partly Cloudy', icon: 'cloud-sun', category: 'cloudy' };
  }
};

export const getAQILabel = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

export const fetchWeatherByCoords = async (
  lat: number,
  lon: number,
  units: 'metric' | 'imperial' = 'metric',
  cityName?: string,
  countryName?: string
): Promise<WeatherData> => {
  const cacheKey = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}_${units}`;
  const cachedData = weatherCache.get<WeatherData>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const tempUnitParam = units === 'imperial' ? 'fahrenheit' : 'celsius';
  const windUnitParam = units === 'imperial' ? 'mph' : 'kmh';

  // 1. Fetch forecast & current weather from Open-Meteo
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum&temperature_unit=${tempUnitParam}&wind_speed_unit=${windUnitParam}&timezone=auto`;

  // 2. Fetch Air Quality Index from Open-Meteo
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;

  const [forecastRes, aqiRes] = await Promise.all([
    axios.get(forecastUrl),
    axios.get(aqiUrl).catch(() => ({ data: { current: { us_aqi: 35 } } })), // fallback if AQI fails
  ]);

  const fData = forecastRes.data;
  const currentF = fData.current;
  const hourlyF = fData.hourly;
  const dailyF = fData.daily;
  const usAqi = aqiRes.data?.current?.us_aqi || 35;

  // Resolve location name if not passed
  let resolvedName = cityName || 'Selected Location';
  let resolvedCountry = countryName || '';
  let resolvedState: string | undefined = undefined;

  if (!cityName) {
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${lat},${lon}&count=1`;
      // Open-Meteo search works best with city names; if coordinates, reverse geocode fallback or display coords
      const revUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const revRes = await axios.get(revUrl, {
        headers: { 'User-Agent': 'WeatherDashboardApp/1.0' },
      });
      if (revRes.data && revRes.data.address) {
        const addr = revRes.data.address;
        resolvedName = addr.city || addr.town || addr.village || addr.suburb || 'Current Location';
        resolvedCountry = addr.country || '';
        resolvedState = addr.state || undefined;
      }
    } catch (e) {
      resolvedName = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
    }
  }

  // Format Current
  const current: CurrentWeather = {
    temp: Math.round(currentF.temperature_2m),
    feelsLike: Math.round(currentF.apparent_temperature),
    humidity: currentF.relative_humidity_2m,
    windSpeed: Math.round(currentF.wind_speed_10m),
    windDirection: currentF.wind_direction_10m,
    pressure: Math.round(currentF.surface_pressure),
    weatherCode: currentF.weather_code,
    condition: mapWMOCodeToCondition(currentF.weather_code),
    isDay: Boolean(currentF.is_day),
    uvIndex: dailyF.uv_index_max ? Math.round(dailyF.uv_index_max[0]) : 5,
    aqi: Math.round(usAqi),
    aqiLabel: getAQILabel(usAqi),
  };

  // Format Hourly (next 24 hours)
  const currentHourIndex = new Date().getHours();
  const hourly: HourlyForecastItem[] = [];
  if (hourlyF && hourlyF.time) {
    for (let i = 0; i < 24; i++) {
      const index = i;
      if (index < hourlyF.time.length) {
        const dateObj = new Date(hourlyF.time[index]);
        hourly.push({
          time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temp: Math.round(hourlyF.temperature_2m[index]),
          precipitationProbability: hourlyF.precipitation_probability ? hourlyF.precipitation_probability[index] : 0,
          weatherCode: hourlyF.weather_code[index],
          condition: mapWMOCodeToCondition(hourlyF.weather_code[index]),
        });
      }
    }
  }

  // Format Daily (7 days)
  const daily: DailyForecastItem[] = [];
  if (dailyF && dailyF.time) {
    for (let i = 0; i < Math.min(7, dailyF.time.length); i++) {
      const dateObj = new Date(dailyF.time[i]);
      const dayName = i === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      daily.push({
        date: dailyF.time[i],
        dayName,
        tempMax: Math.round(dailyF.temperature_2m_max[i]),
        tempMin: Math.round(dailyF.temperature_2m_min[i]),
        weatherCode: dailyF.weather_code[i],
        condition: mapWMOCodeToCondition(dailyF.weather_code[i]),
        uvIndexMax: dailyF.uv_index_max ? Math.round(dailyF.uv_index_max[i]) : 5,
        precipitationSum: dailyF.precipitation_sum ? Number(dailyF.precipitation_sum[i].toFixed(1)) : 0,
      });
    }
  }

  const result: WeatherData = {
    location: {
      name: resolvedName,
      country: resolvedCountry,
      state: resolvedState,
      lat,
      lon,
    },
    units,
    current,
    hourly,
    daily,
    updatedAt: new Date().toISOString(),
  };

  weatherCache.set(cacheKey, result);
  return result;
};

export const searchCities = async (query: string): Promise<LocationInfo[]> => {
  if (!query || query.trim().length < 2) return [];

  const cacheKey = `search_${query.trim().toLowerCase()}`;
  const cached = weatherCache.get<LocationInfo[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`;
    const res = await axios.get(url);

    if (!res.data.results || !Array.isArray(res.data.results)) {
      return [];
    }

    const results: LocationInfo[] = res.data.results.map((item: any) => ({
      name: item.name,
      country: item.country || '',
      state: item.admin1 || undefined,
      lat: item.latitude,
      lon: item.longitude,
    }));

    weatherCache.set(cacheKey, results, 1800); // 30 mins
    return results;
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
};
