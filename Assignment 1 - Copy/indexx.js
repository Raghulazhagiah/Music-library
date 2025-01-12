const express = require('express');
const bodyParser = require('body-parser');

const connector = require('./query')
const controller = require('./controller')
const app = express();
app.use(express.json());


  app.post('/api/signup', (req, res) => {
    controller.signup(req, res,(err, results) => {
      if (err) {
        console.error('Error in signup:', err.message);
        res.status(500).json({ error: 'Failed to Sign up user' });
      } else {
        res.status(200).json(results);
      }
    });
  });  

  app.post('/api/login', (req, res) => {
    controller.login(req, res,(err, results) => {
      if (err) {
        console.error('Error in signup:', err.message);
        res.status(500).json({ error: 'Failed to Sign up user' });
      } else {
        res.status(200).json(results);
      }
    });
  });  


  app.post('/api/users', (req, res) => {
    controller.getAllUsers(req, res,(err, results) => {
      if (err) {
        console.error('Error in signup:', err.message);
        res.status(500).json({ error: 'Failed to Sign up user' });
      } else {
        res.status(200).json(results);
      }
    });
  });  

  app.get('/api/artists', (req, res) => {
    controller.getAllArtists(req, res, (err, results) => {
      if (err) {
        console.error('Error fetching artists:', err.message);
        res.status(500).json({ error: 'Failed to fetch artists' });
      } else {
        res.status(200).json(results);
      }
    });
  });

  app.get('/api/artist/:id', (req, res) => {
    controller.getArtistById(req, res,(err, results) => {
      if (err) {
        console.error('Error in signup:', err.message);
        res.status(500).json({ error: 'Failed to Sign up user' });
      } else {
        res.status(200).json(results);
      }
    });
  }); 

  app.get('/api/album/:id', (req, res) => {
    controller.getAlbumById(req, res,(err, results) => {
      if (err) {
        console.error('Error in signup:', err.message);
        res.status(500).json({ error: 'Failed to Sign up user' });
      } else {
        res.status(200).json(results);
      }
    });
  }); 


  app.get('/api/track/:id', (req, res) => {
    controller.getTrackById(req, res,(err, results) => {
      if (err) {
        console.error('Error in signup:', err.message);
        res.status(500).json({ error: 'Failed to Sign up user' });
      } else {
        res.status(200).json(results);
      }
    });
  }); 



  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })  


