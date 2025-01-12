const db = require("./dbconnection");

// Function to insert a user
const insertUser = (email_id) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      "INSERT INTO agency_db.user (email_id) VALUES (UUID(), ?, ?, ?)",
      [email_id,],
      (err, results) => {
        if (err) {
          return reject(err); // Reject the promise if an error occurs
        }
        resolve(results); // Resolve the promise with the results
      }
    );
  });
};

// Function to fetch all users
const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.connection.query("SELECT * FROM user", (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// Function to fetch all artists
const getAllArtists = () => {
  return new Promise((resolve, reject) => {
    db.connection.query("SELECT * FROM artist", (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// Function to fetch all tracks
const getAllTracks = () => {
  return new Promise((resolve, reject) => {
    db.connection.query("SELECT * FROM track", (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

// Function to fetch all albums
const getAllAlbums = () => {
  return new Promise((resolve, reject) => {
    db.connection.query("SELECT * FROM album", (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};



// Function to create a user
const createUser = (email_id, password) => {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO agency_db.user (id, email_id, password) VALUES (UUID(), ?, ?)";
    console.log("Executing query:", query, "with values:", email_id, password);
    db.connection.query(query, [email_id, password], (err, results) => {
      if (err) {
        return reject(err); // Reject the promise if there's an error
      }
      resolve(results); // Resolve the promise with the results
    });
  });
};

// Function to update password by email
const updatePassword = (email_id, newPassword) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      `UPDATE user SET password = ? WHERE email_id = ?`,
      [newPassword, email_id],
      (err, results) => {
        if (err) {
          return reject(err); // Reject the promise if there's an error
        }
        resolve(results); // Resolve the promise with the results
      }
    );
  });
};



const getArtistById = (id) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      `Select * from artist where artist_id = ?`,
      [id],
      (err, results) => {
        if (err) {
          return reject(err); // Reject the promise if there's an error
        }
        resolve(results); // Resolve the promise with the results
      }
    );
  });
};

const getAlbumById = (id) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      `Select * from album where album_id = ?`,
      [id],
      (err, results) => {
        if (err) {
          return reject(err); // Reject the promise if there's an error
        }
        resolve(results); // Resolve the promise with the results
      }
    );
  });
};

const getTrackById = (id) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      `Select * from track where track_id = ?`,
      [id],
      (err, results) => {
        if (err) {
          return reject(err); // Reject the promise if there's an error
        }
        resolve(results); // Resolve the promise with the results
      }
    );
  });
};


const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      `Select * from user where id = ?`,
      [id],
      (err, results) => {
        if (err) {
          return reject(err); // Reject the promise if there's an error
        }
        resolve(results); // Resolve the promise with the results
      }
    );
  });
};

const addArtist = (name, grammy, hidden) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      "INSERT INTO agency_db.artist (id, name, grammy, hidden) VALUES (UUID(), ?, ?, ?)",
      [name, grammy, hidden],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      }
    );
  });
};

const updateArtist = (id, name, grammy, hidden) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      "UPDATE agency_db.user SET name = ?, grammy = ?, hidden = ? WHERE id = ?",
      [name, grammy, hidden, id],
      (err, results) => {
        if (err) {
          return reject(err); // Reject the promise if an error occurs
        }
        resolve(results); // Resolve the promise with the results
      }
    );
  });
};

const deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      "DELETE FROM agency_db.user WHERE id = ?",
      [id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      }
    );
  });
};

const deleteArtist = (id) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      "DELETE FROM agency_db.artist WHERE id = ?",
      [id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      }
    );
  });
};

const addAlbum = (artist_id, name, year, hidden) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      "INSERT INTO agency_db.album (id, artist_id, name, year, hidden) VALUES (UUID(), ?, ?, ?, ?)",
      [artist_id, name, year, hidden],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      }
    );
  });
};

const updateAlbum = (id, name, year, hidden) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      "UPDATE agency_db.album SET name = ?, year = ?, hidden = ? WHERE id = ?",
      [name, year, hidden, id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      }
    );
  });
};

const deleteAlbum = (id) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      "DELETE FROM agency_db.album WHERE id = ?",
      [id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      }
    );
  });
};

const addTrack = (artist_id, album_id, name, duration, hidden) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      "INSERT INTO agency_db.track (id, artist_id, album_id, name, duration, hidden) VALUES (UUID(), ?, ?, ?, ?, ?)",
      [artist_id, album_id, name, duration, hidden],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      }
    );
  });
};

const updateTrack = (id, name, duration, hidden) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      "UPDATE agency_db.track SET name = ?, duration = ?, hidden = ? WHERE id = ?",
      [name, duration, hidden, id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      }
    );
  });
};

const deleteTrack = (id) => {
  return new Promise((resolve, reject) => {
    db.connection.query(
      "DELETE FROM agency_db.track WHERE id = ?",
      [id],
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      }
    );
  });
};

// Export the functions
module.exports = {
  insertUser,
  getAllUsers,
  getAllArtists,
  updatePassword,
  getAllTracks,
  getAllAlbums,
  getUserByEmail,
  createUser,
  getArtistById,
  getAlbumById,
  getTrackById,
  updateArtist,
  deleteUser,
  deleteArtist,
  addAlbum,
  updateAlbum,
  deleteAlbum,
  addTrack,
  updateTrack,
  deleteTrack,
  getUserById,
  addArtist
};
