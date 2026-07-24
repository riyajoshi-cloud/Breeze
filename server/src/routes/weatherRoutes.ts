import { Router } from 'express';
import { getWeather, searchLocations, getWeatherHistory, deleteWeatherHistoryRecord, clearWeatherHistory } from '../controllers/weatherController';

const router = Router();

router.get('/current', getWeather);
router.get('/search', searchLocations);
router.get('/history', getWeatherHistory);
router.delete('/history/:id', deleteWeatherHistoryRecord);
router.delete('/history', clearWeatherHistory);

export default router;
