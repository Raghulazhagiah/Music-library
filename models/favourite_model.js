const db = require("../dbconnection");



const addFavorite = (email, category, item_id) => {
    return new Promise((resolve, reject) => {
      db.pool.query(
        `
        INSERT INTO public.favorite (email, category, item_id)
        VALUES ($1, $2, $3)
        RETURNING *;
        `,
        [email, category, item_id],
        (err, results) => {
          if (err) {
            return reject(err); // Reject if there's an error
          }
          resolve(results.rows[0]); // Resolve with the inserted favorite
        }
      );
    });
  };

const deleteTrack = (id) => {
    return new Promise((resolve, reject) => {
      db.pool.query('DELETE FROM public.favorite WHERE id  = $1', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results.rows[0]);
      });
    });
  };  

const getFavoriteById = (id) => {
    return new Promise((resolve, reject) => {
      db.pool.query('SELECT * FROM favorite WHERE id = $1', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results.rows[0]);
      });
    });
  };  


  const getFavoritesByCategory = (email, category, limit, offset) => {
    return new Promise((resolve, reject) => {
      db.pool.query(`
        SELECT *
        FROM public.favorite
        WHERE email = $1 AND category = $2
        LIMIT $3 OFFSET $4;`,
        [email, category, limit, offset],
        (err, results) => {
          if (err) {
            return reject(err); // Reject on query error
          }
          resolve(results.rows); // Resolve with the fetched rows
        }
      );
    });
  };
  


  module.exports = {
    addFavorite,
    deleteTrack,
    getFavoriteById,
    getFavoritesByCategory

  };
  