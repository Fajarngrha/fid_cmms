// Memuat variabel dari .env
require('dotenv').config();

// Mengakses variabel dari .env
const { Client } = require('pg');

// Membuat koneksi ke PostgreSQL menggunakan variabel dari .env
const client = new Client({
  host: process.env.DB_HOST,        // Host dari database
  port: process.env.DB_PORT,        // Port PostgreSQL
  user: process.env.DB_USER,        // Pengguna database
  password: process.env.DB_PASSWORD, // Password untuk pengguna
  database: process.env.DB_NAME     // Nama database
});

// Menghubungkan ke PostgreSQL
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL');
  })
  .catch((err) => {
    console.error('Connection error', err.stack);
  });
