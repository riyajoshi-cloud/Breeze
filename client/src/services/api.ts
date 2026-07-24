import axios from 'axios';
import { WeatherData, LocationInfo, FavoriteItem } from '../types/weather';

const API_BASE = '/api';

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
