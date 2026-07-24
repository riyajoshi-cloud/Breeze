import { Request, Response } from 'express';
import Favorite from '../models/Favorite';
import { isMongoConnected } from '../config/db';
import { getJsonFavorites, addJsonFavorite, deleteJsonFavorite } from '../config/jsonDb';

export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    if (isMongoConnected) {
      const favorites = await Favorite.find().sort({ createdAt: -1 });
      res.json(favorites);
    } else {
      const favorites = await getJsonFavorites();
      res.json(favorites);
    }
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    try {
      const favorites = await getJsonFavorites();
      res.json(favorites);
    } catch (fallbackErr) {
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
  }
};

export const addFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, country, state, lat, lon } = req.body;

    if (!name || lat === undefined || lon === undefined) {
      res.status(400).json({ error: 'Name, lat, and lon are required' });
      return;
    }

    const favoriteData = {
      name,
      country: country || '',
      state,
      lat: Number(lat),
      lon: Number(lon),
    };

    if (isMongoConnected) {
      // Check duplicate
      const existing = await Favorite.findOne({ lat: favoriteData.lat, lon: favoriteData.lon });
      if (existing) {
        res.status(400).json({ error: 'Location already saved in favorites' });
        return;
      }

      const favorite = new Favorite(favoriteData);
      await favorite.save();
      res.status(201).json(favorite);
    } else {
      try {
        const newFav = await addJsonFavorite(favoriteData);
        res.status(201).json(newFav);
      } catch (err: any) {
        res.status(400).json({ error: err.message || 'Failed to add favorite location' });
      }
    }
  } catch (error: any) {
    console.error('Error saving favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite location' });
  }
};

export const deleteFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const deleted = await Favorite.findByIdAndDelete(id);
      if (!deleted) {
        // Try deleting by coordinate or id matching
        await Favorite.deleteOne({ _id: id });
      }
      res.json({ message: 'Favorite deleted successfully', id });
    } else {
      const success = await deleteJsonFavorite(id);
      if (success) {
        res.json({ message: 'Favorite deleted successfully', id });
      } else {
        res.status(404).json({ error: 'Favorite not found' });
      }
    }
  } catch (error: any) {
    console.error('Error deleting favorite:', error);
    res.status(500).json({ error: 'Failed to delete favorite location' });
  }
};
