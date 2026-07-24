import fs from 'fs';
import path from 'path';

// Define Interface Shapes
export interface JsonDbFavorite {
  _id: string;
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  createdAt: string;
}

export interface JsonDbWeatherLog {
  _id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  humidity: number;
  conditions: string;
  createdAt: string;
}

interface JsonDbSchema {
  favorites: JsonDbFavorite[];
  weatherHistory: JsonDbWeatherLog[];
}

const DB_PATH = path.resolve(__dirname, '../../db.json');

// Ensure db.json file exists with structure
const initDbFile = (): JsonDbSchema => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initialData: JsonDbSchema = {
        favorites: [
          {
            _id: 'fav-1',
            name: 'London',
            country: 'United Kingdom',
            lat: 51.5074,
            lon: -0.1278,
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'fav-2',
            name: 'Dehradun',
            country: 'India',
            state: 'Uttarakhand',
            lat: 30.3165,
            lon: 78.0322,
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'fav-3',
            name: 'New York',
            country: 'United States',
            lat: 40.7128,
            lon: -74.006,
            createdAt: new Date().toISOString(),
          },
        ],
        weatherHistory: [],
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
    const content = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error initializing JSON database:', error);
    return { favorites: [], weatherHistory: [] };
  }
};

const readDb = (): JsonDbSchema => {
  return initDbFile();
};

const writeDb = (data: JsonDbSchema): void => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to JSON database:', error);
  }
};

// Favorites DB operations
export const getJsonFavorites = async (): Promise<JsonDbFavorite[]> => {
  const db = readDb();
  return db.favorites.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addJsonFavorite = async (fav: Omit<JsonDbFavorite, '_id' | 'createdAt'>): Promise<JsonDbFavorite> => {
  const db = readDb();
  
  // Duplicate check
  const duplicate = db.favorites.find(
    f => Math.abs(f.lat - fav.lat) < 0.05 && Math.abs(f.lon - fav.lon) < 0.05
  );
  if (duplicate) {
    throw new Error('Location already saved in favorites');
  }

  const newFav: JsonDbFavorite = {
    _id: `fav-${Date.now()}`,
    ...fav,
    createdAt: new Date().toISOString(),
  };

  db.favorites.unshift(newFav);
  writeDb(db);
  return newFav;
};

export const deleteJsonFavorite = async (id: string): Promise<boolean> => {
  const db = readDb();
  const index = db.favorites.findIndex(f => f._id === id);
  if (index === -1) return false;

  db.favorites.splice(index, 1);
  writeDb(db);
  return true;
};

// Weather Logs DB operations
export const getJsonWeatherLogs = async (limit: number = 30): Promise<JsonDbWeatherLog[]> => {
  const db = readDb();
  return db.weatherHistory
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const addJsonWeatherLog = async (log: Omit<JsonDbWeatherLog, '_id' | 'createdAt'>): Promise<JsonDbWeatherLog> => {
  const db = readDb();
  const newLog: JsonDbWeatherLog = {
    _id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    ...log,
    createdAt: new Date().toISOString(),
  };

  db.weatherHistory.unshift(newLog);
  
  // Cap at 100 historical queries to conserve memory
  if (db.weatherHistory.length > 100) {
    db.weatherHistory = db.weatherHistory.slice(0, 100);
  }
  
  writeDb(db);
  return newLog;
};

export const deleteJsonWeatherLog = async (id: string): Promise<boolean> => {
  const db = readDb();
  const index = db.weatherHistory.findIndex(l => l._id === id);
  if (index === -1) return false;

  db.weatherHistory.splice(index, 1);
  writeDb(db);
  return true;
};

export const clearJsonWeatherLogs = async (): Promise<void> => {
  const db = readDb();
  db.weatherHistory = [];
  writeDb(db);
};
