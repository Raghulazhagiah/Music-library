const express = require('express');
const { getArtistById, getAllArtist, deleteArtist, addArtist, updateArtist} = require('../controllers/artist_controller');
const router = express.Router();

// Route to fetch all artists
//router.get('/artists', getAllArtists);
router.get('/:id', getArtistById)
router.get('/',getAllArtist)
router.delete('/:id', deleteArtist)
router.post('/add-artist',addArtist)
router.put('/:id', updateArtist)

module.exports = router;
