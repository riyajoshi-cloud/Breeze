import axios from 'axios';
import { WeatherData, LocationInfo, FavoriteItem } from '../types/weather';

// In production (Vercel) the /api requests are proxied to Render via vercel.json rewrites.
// VITE_API_URL is only needed if the proxy is not used.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Pings the backend health endpoint to wake up the Render free-tier instance.
 * Call this on app load so the server is warm before the first weather request.
 */
export const wakeUpServer = async (): Promise<void> => {
  try {
    await axios.get(`${API_BASE}/health`, { timeout: 30000 });
  } catch {
    // Silently ignore — wake-up ping failures are non-critical
  }
};

export const fetchWeatherData = async (
  params: { lat?: number; lon?: number; city?: string; units: 'metric' | 'imperial' }
): Promise<WeatherData> => {
  const response = await axios.get<WeatherData>(`${API_BASE}/weather/current`, { params });
  return response.data;
};

export const searchLocationsApi = async (query: string): Promise<LocationInfo[]> => {
  if (!query || query.trim().length < 2) return [];
  const response = await axios.get<LocationInfo[]>(`${API_BASE}/weather/search`, {
    params: { q: query },
  });
  return response.data;
};

export const fetchFavoritesApi = async (): Promise<FavoriteItem[]> => {
  const response = await axios.get<FavoriteItem[]>(`${API_BASE}/favorites`);
  return response.data;
};

export const addFavoriteApi = async (location: LocationInfo): Promise<FavoriteItem> => {
  const response = await axios.post<FavoriteItem>(`${API_BASE}/favorites`, location);
  return response.data;
};

export const deleteFavoriteApi = async (id: string): Promise<{ message: string; id: string }> => {
  const response = await axios.delete(`${API_BASE}/favorites/${id}`);
  return response.data;
};

export const fetchWeatherHistoryApi = async (): Promise<any[]> => {
  const response = await axios.get<any[]>(`${API_BASE}/weather/history`);
  return response.data;
};

export const deleteWeatherHistoryRecordApi = async (id: string): Promise<{ message: string; id: string }> => {
  const response = await axios.delete(`${API_BASE}/weather/history/${id}`);
  return response.data;
};

export const clearWeatherHistoryApi = async (): Promise<{ message: string }> => {
  const response = await axios.delete(`${API_BASE}/weather/history`);
  return response.data;
};
