const db = require("../dbconnection");

const getTrackById = (id) => {
    return new Promise((resolve, reject) => {
      db.pool.query('SELECT * FROM track WHERE track_id = $1', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results.rows[0]);
      });
    });
  };
  
  const deleteTrack = (id) => {
    return new Promise((resolve, reject) => {
      db.pool.query('DELETE FROM public.track WHERE track_id = $1', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results.rows[0]);
      });
    });
  };

  const getAllTrack = (hidden,limit,offset,artist_id,album_id) => {
    return new Promise((resolve, reject) => {
      db.pool.query(`SELECT * FROM public.track 
      WHERE artist_id = $1 AND hidden = '${hidden}' AND album_id = $2
      LIMIT ${limit} OFFSET ${offset}`,[artist_id, album_id], (err, results) => {
        if (err) return reject(err);
        resolve(results.rows[0]);
      });
    });
  };

  const addTrack = (artist_id, album_id, name, duration, hidden) => {
    return new Promise((resolve, reject) => {
      db.pool.query(
        `INSERT INTO public.track (artist_id, album_id, name, duration, hidden) VALUES ($1, $2, $3, $4,'${hidden}')`,
        [artist_id, album_id, name, duration],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results.rows[0]);
        }
      );
    });
  };

     const updateTrack = (name, duration, hidden,track_id) => {
        return new Promise((resolve, reject) => {
          db.pool.query(
            `UPDATE public.track 
    SET name = '${name}', 
        duration = ${duration}, 
        hidden = '${hidden}' 
    WHERE track_id = $1
    RETURNING *;
    `,
            [track_id],
            (err, results) => {
              if (err) {
                return reject(err);
              }
              console.log("Result is",results.rows[0])
              resolve(results.rows[0]);
            }
          );
        });
      };
  
  module.exports = {
    getTrackById,
    deleteTrack,
    getAllTrack,
    addTrack,
    updateTrack

  };
  