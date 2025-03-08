const db = require("../dbconnection");

const getAlbumById = (id) => {
    return new Promise((resolve, reject) => {
      db.pool.query(`SELECT * FROM public.album WHERE album_id = $1`, [id],(err, results) => {
        if (err) return reject(err);
        resolve(results.rows[0]);
      });
    });
  };
  
  const deleteAlbum = (id) => {
    return new Promise((resolve, reject) => {
      db.pool.query('DELETE FROM public.album WHERE album_id = $1', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results.rows[0]);
      });
    });
  };

  const getAllAlbum = (artist_id,hidden,limit,offset) => {
    return new Promise((resolve, reject) => {
      db.pool.query(`SELECT * FROM public.album 
      WHERE artist_id = $1 AND hidden = ${hidden}
      LIMIT ${limit} OFFSET ${offset}`, [artist_id], (err, results) => {
        if (err) return reject(err);
        //console.log(results)
        resolve(results.rows[0]);
      });
    });
  };

  const addAlbum = (artist_id,name, year, hidden) => {
    return new Promise((resolve, reject) => {
      db.pool.query(
        "INSERT INTO public.album (artist_id, name, year, hidden) VALUES ($1, $2, $3, $4)",
        [artist_id, name, year, hidden],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results.rows[0]);
        }
      );
    });
  };

    const updateAlbum = (name, year, hidden,album_id) => {
      return new Promise((resolve, reject) => {
        db.pool.query(
          `UPDATE public.album 
  SET name = '${name}', 
      year = ${year}, 
      hidden = '${hidden}' 
  WHERE artist_id = $1
  RETURNING *;
  `,
          [album_id],
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
    getAlbumById,
    deleteAlbum,
    getAllAlbum,
    addAlbum,
    updateAlbum

  };
  