const { query } = require("express");
const db = require("../dbconnection");
const { Pool } = require('pg');



const getUserByEmail = (email_id) => {
  return new Promise((resolve, reject) => {
    db.pool.query(
      `SELECT * FROM public.user where email_id = $1`, // Use parameterized query to prevent SQL injection
      [email_id],      
      (err, results) => {
        console.log("Query",query)
        if (err) {
          return reject(err); // Pass error to the promise rejection
        }
        console.log("Results",results)
        resolve(results.rows[0]); // Return the first matching row
      }
    );
  });
};

const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.pool.query("SELECT * FROM PUBLIC.user", (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results.rows);
    });
  });
};

const insertUser = (email_id, password) => {
  return new Promise((resolve, reject) => {
    db.pool.query(
      "INSERT INTO public.user (email_id, password) VALUES ($1, $2)",
      [email_id, password],
      (err, results) => {
        if (err) {
          return reject(err); // Reject the promise if an error occurs
        }
        resolve(results); // Resolve the promise with the results
      }
    );
  });
};

const insertUser_by_admin = (email_id, password, role) => {
  return new Promise((resolve, reject) => {
    db.pool.query(
      "INSERT INTO public.user (email_id, password, role) VALUES ($1, $2, $3)",
      [email_id, password, role],
      (err, results) => {
        if (err) {
          return reject(err); // Reject the promise if an error occurs
        }
        resolve(results.rows[0]); // Resolve the promise with the results
      }
    );
  });
};

const getUserById = (id) => {
    return new Promise((resolve, reject) => {
      db.pool.query('SELECT * FROM public.user WHERE id = $1', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results.rows[0]);
      });
    });
  };
  
  const deleteUser = (id) => {
    return new Promise((resolve, reject) => {
      db.pool.query('DELETE FROM public.user WHERE id = $1', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  };

  const updatePassword = (email, newPassword) => {
    return new Promise((resolve, reject) => {
      db.pool.query(
        "UPDATE public.user SET password = $1 WHERE email = $2 RETURNING *;",
        [newPassword, email],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.rows[0]);
        }
      );
    });
  };

  const insert_token = (token) => {
    return new Promise((resolve, reject) => {
      db.pool.query(
        "INSERT INTO public.token (token) VALUES ($1)",
        [token],
        (err, results) => {
          if (err) {
            return reject(err); // Reject the promise if an error occurs
          }
          resolve(results.rows[0]); // Resolve the promise with the results
        }
      );
    });
  };

  const deleteToken = (token) => {
    return new Promise((resolve, reject) => {
      db.pool.query(
        "DELETE FROM public.token WHERE token = $1 RETURNING *;",
        [token],
        (err, results) => {
          if (err) {
            return reject(err); // Reject the promise if an error occurs
          }
          resolve(results.rows[0]); // Resolve the promise with the deleted token record
        }
      );
    });
  };
  
  



module.exports = {
    getUserByEmail,
    getAllUsers,
    insertUser,
    getUserById,
    deleteUser,
    insertUser_by_admin,
    updatePassword,
    insert_token,
    deleteToken    
  };
  