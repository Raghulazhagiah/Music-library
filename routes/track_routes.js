const express = require('express');
const { getTrackById, deleteTrack, getAllTrack, addTrack, updateTrack } = require('../controllers/track_controller');
const router = express.Router();


//router.get('/', getAllAlbums); // Example route
router.get('/:id', getTrackById); // Example route
 router.get('/',getAllTrack)
router.delete('/:id', deleteTrack)
router.post('/add-track',addTrack)
router.put('/:id',updateTrack)

module.exports = router;





