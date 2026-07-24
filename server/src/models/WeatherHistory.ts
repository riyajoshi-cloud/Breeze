import mongoose, { Schema, Document } from 'mongoose';

export interface IWeatherHistory extends Document {
  name: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  humidity: number;
  conditions: string;
  createdAt: Date;
}

const WeatherHistorySchema: Schema = new Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  temp: { type: Number, required: true },
  humidity: { type: Number, required: true },
  conditions: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create index to retrieve history logs chronologically
WeatherHistorySchema.index({ createdAt: -1 });

export default mongoose.model<IWeatherHistory>('WeatherHistory', WeatherHistorySchema);
