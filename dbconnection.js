const mysql = require('mysql2');

const { Pool } = require('pg');
const pool = new Pool({
  user:"",
  host: "",
  database: "",
  password: "",
  port: ,
  pool_mode: "",  
  ssl: { rejectUnauthorized: false },
  idleTimeoutMilli: 30000, 
  connectionTimeoutMilli: 2000, 
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the database.');
});



module.exports = {pool};

