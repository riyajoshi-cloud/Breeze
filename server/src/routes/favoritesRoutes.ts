import { Router } from 'express';
import { getFavorites, addFavorite, deleteFavorite } from '../controllers/favoritesController';

const router = Router();

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:id', deleteFavorite);

export default router;
