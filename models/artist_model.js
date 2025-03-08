const db = require("../dbconnection");

const getArtistById = (id) => {
    return new Promise((resolve, reject) => {
      db.pool.query('SELECT * FROM artist WHERE artist_id = $1', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results.rows[0]);
      });
    });
  };
  
  const deleteArtist = (id) => {
    return new Promise((resolve, reject) => {
      db.pool.query('DELETE FROM public.artist WHERE artist_id = $1', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  };

  const getAllArtists = (grammy,hidden,limit,offset) => {
    return new Promise((resolve, reject) => {
      db.pool.query(`SELECT * 
      FROM artist
      WHERE grammy = '${grammy}'
        AND hidden = '${hidden}'
      LIMIT ${limit} OFFSET ${offset};`,(err, results) => {
        if (err) return reject(err);
        resolve(results.rows[0]);
      });
    });
  };

  const addArtist = (name, grammy, hidden) => {
    return new Promise((resolve, reject) => {
      db.pool.query(
        `INSERT INTO public.artist (name, grammy, hidden) VALUES ($1,'${grammy}', '${hidden}')`,
        [name],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results.rows[0]);
        }
      );
    });
  };

  const updateArtist = (name, grammy, hidden,artist_id) => {
    return new Promise((resolve, reject) => {
      db.pool.query(
        `UPDATE public.artist 
SET name = '${name}', 
    grammy = ${grammy}, 
    hidden = '${hidden}' 
WHERE artist_id = $1
RETURNING *;
`,
        [artist_id],
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
    getArtistById,
    deleteArtist,
    getAllArtists,
    addArtist,
    updateArtist
  };
  