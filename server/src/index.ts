import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import weatherRoutes from './routes/weatherRoutes';
import favoritesRoutes from './routes/favoritesRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/favorites', favoritesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Weather Dashboard Server running on http://localhost:${PORT}`);
  });
});

export default app;
