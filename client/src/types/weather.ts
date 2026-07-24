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

export interface FavoriteItem {
  _id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  createdAt?: string;
}
