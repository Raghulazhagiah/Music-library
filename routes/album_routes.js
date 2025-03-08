const express = require('express');
const { getAlbumById, deleteAlbum, getAllAlbum, addAlbum, updateAlbum } = require('../controllers/album_controller');
//const { updateAlbum } = require('../models/album_model');
const router = express.Router();


//router.get('/', getAllAlbums); // Example route
router.get('/:id', getAlbumById); // Example route
router.get('/',getAllAlbum)
router.delete('/:id', deleteAlbum)
router.post('/add-album',addAlbum)
router.put('/:id', updateAlbum)

module.exports = router;





