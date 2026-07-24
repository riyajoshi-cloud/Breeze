import { Request, Response } from 'express';
import { fetchWeatherByCoords, searchCities } from '../services/weatherService';
import WeatherHistory from '../models/WeatherHistory';
import { isMongoConnected } from '../config/db';
import { addJsonWeatherLog, getJsonWeatherLogs, deleteJsonWeatherLog, clearJsonWeatherLogs } from '../config/jsonDb';

// Helper to log weather search events to database
const logWeatherSearch = async (
  name: string,
  country: string,
  lat: number,
  lon: number,
  temp: number,
  humidity: number,
  conditions: string
): Promise<void> => {
  try {
    const logData = {
      name,
      country,
      lat,
      lon,
      temp: Number(temp),
      humidity: Number(humidity),
      conditions,
    };
    if (isMongoConnected) {
      const newLog = new WeatherHistory(logData);
      await newLog.save();
    } else {
      await addJsonWeatherLog(logData);
    }
  } catch (err) {
    console.error('Error writing weather record to database:', err);
  }
};

export const getWeather = async (req: Request, res: Response): Promise<void> => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
    const city = req.query.city ? (req.query.city as string) : undefined;
    const units = (req.query.units as 'metric' | 'imperial') || 'metric';

    if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
      const data = await fetchWeatherByCoords(lat, lon, units, city);
      
      // Fire-and-forget database log
      logWeatherSearch(
        data.location.name,
        data.location.country,
        data.location.lat,
        data.location.lon,
        data.current.temp,
        data.current.humidity,
        data.current.condition.label
      );

      res.json(data);
      return;
    }

    if (city) {
      const searchResults = await searchCities(city);
      if (searchResults.length > 0) {
        const topResult = searchResults[0];
        const data = await fetchWeatherByCoords(
          topResult.lat,
          topResult.lon,
          units,
          topResult.name,
          topResult.country
        );

        // Fire-and-forget database log
        logWeatherSearch(
          data.location.name,
          data.location.country,
          data.location.lat,
          data.location.lon,
          data.current.temp,
          data.current.humidity,
          data.current.condition.label
        );

        res.json(data);
        return;
      } else {
        res.status(404).json({ error: `City '${city}' not found.` });
        return;
      }
    }

    // Default fallback: London coordinates
    const defaultData = await fetchWeatherByCoords(51.5074, -0.1278, units, 'London', 'United Kingdom');
    
    logWeatherSearch(
      defaultData.location.name,
      defaultData.location.country,
      defaultData.location.lat,
      defaultData.location.lon,
      defaultData.current.temp,
      defaultData.current.humidity,
      defaultData.current.condition.label
    );

    res.json(defaultData);
  } catch (error: any) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to retrieve weather data', details: error.message });
  }
};

export const searchLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string;
    if (!q) {
      res.json([]);
      return;
    }
    const results = await searchCities(q);
    res.json(results);
  } catch (error: any) {
    console.error('Error searching locations:', error);
    res.status(500).json({ error: 'Failed to search locations' });
  }
};

// Retrieve recent weather reports logged in database
export const getWeatherHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (isMongoConnected) {
      const logs = await WeatherHistory.find().sort({ createdAt: -1 }).limit(25);
      res.json(logs);
    } else {
      const logs = await getJsonWeatherLogs(25);
      res.json(logs);
    }
  } catch (error) {
    console.error('Error retrieving weather reports from database:', error);
    try {
      const logs = await getJsonWeatherLogs(25);
      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve database logs history' });
    }
  }
};

// Delete single weather history record by ID
export const deleteWeatherHistoryRecord = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      const deleted = await WeatherHistory.findByIdAndDelete(id);
      if (!deleted) {
        await WeatherHistory.deleteOne({ _id: id });
      }
      res.json({ message: 'Weather record deleted successfully', id });
    } else {
      const success = await deleteJsonWeatherLog(id);
      if (success) {
        res.json({ message: 'Weather record deleted successfully', id });
      } else {
        res.status(404).json({ error: 'Record not found' });
      }
    }
  } catch (error: any) {
    console.error('Error deleting weather record:', error);
    res.status(500).json({ error: 'Failed to delete weather record' });
  }
};

// Clear all weather history records
export const clearWeatherHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (isMongoConnected) {
      await WeatherHistory.deleteMany({});
      res.json({ message: 'All weather observations cleared successfully' });
    } else {
      await clearJsonWeatherLogs();
      res.json({ message: 'All weather observations cleared successfully' });
    }
  } catch (error: any) {
    console.error('Error clearing weather records:', error);
    res.status(500).json({ error: 'Failed to clear weather records' });
  }
};
