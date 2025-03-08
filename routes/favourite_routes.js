const express = require('express');
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favourite_controller');
const router = express.Router();


router.post('/add-favorite',addFavorite)
router.delete('/remove-favorite/:favorite_id', removeFavorite)
router.get('/:category', getFavorites)
module.exports = router;





