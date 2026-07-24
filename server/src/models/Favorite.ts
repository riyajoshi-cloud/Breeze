import mongoose, { Schema, Document } from 'mongoose';

export interface IFavorite extends Document {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
  createdAt: Date;
}

const FavoriteSchema: Schema = new Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Ensure uniqueness by location coordinates or name/country
FavoriteSchema.index({ lat: 1, lon: 1 }, { unique: true });

export default mongoose.model<IFavorite>('Favorite', FavoriteSchema);
