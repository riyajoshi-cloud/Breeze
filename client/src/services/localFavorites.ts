/**
 * localFavorites.ts
 * localStorage-based favorites store — zero backend required.
 * Works offline, survives Render sleeping, and is instant.
 */
import { LocationInfo, FavoriteItem } from '../types/weather';

const LS_KEY = 'breeze_favorites_v1';

const DEFAULT_FAVORITES: FavoriteItem[] = [
  { _id: 'fav-1', name: 'London',   country: 'United Kingdom', lat: 51.5074, lon: -0.1278,  createdAt: new Date().toISOString() },
  { _id: 'fav-2', name: 'Dehradun', country: 'India', state: 'Uttarakhand', lat: 30.3165, lon: 78.0322, createdAt: new Date().toISOString() },
  { _id: 'fav-3', name: 'New York', country: 'United States', lat: 40.7128, lon: -74.006, createdAt: new Date().toISOString() },
];

function readStore(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      // First run: seed defaults
      localStorage.setItem(LS_KEY, JSON.stringify(DEFAULT_FAVORITES));
      return DEFAULT_FAVORITES;
    }
    return JSON.parse(raw) as FavoriteItem[];
  } catch {
    return [...DEFAULT_FAVORITES];
  }
}

function writeStore(items: FavoriteItem[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export const getFavorites = (): FavoriteItem[] =>
  readStore().sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());

export const addFavorite = (location: LocationInfo): FavoriteItem => {
  const store = readStore();
  const dup = store.find(
    f => Math.abs(f.lat - location.lat) < 0.05 && Math.abs(f.lon - location.lon) < 0.05,
  );
  if (dup) throw new Error('Location already saved in favorites');

  const newFav: FavoriteItem = {
    _id: `fav-${Date.now()}`,
    name: location.name,
    country: location.country,
    state: location.state,
    lat: location.lat,
    lon: location.lon,
    createdAt: new Date().toISOString(),
  };
  writeStore([newFav, ...store]);
  return newFav;
};

export const deleteFavorite = (id: string): void => {
  const store = readStore().filter(f => f._id !== id);
  writeStore(store);
};
