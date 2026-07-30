const mysql = require("mysql2");
require("dotenv").config();

// Membuat connection pool agar koneksi stabil dan cepat
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "db_ra_tawang_rejosari",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Tes koneksi saat aplikasi berjalan
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Gagal terhubung ke MySQL:", err.message);
  } else {
    console.log("✅ Berhasil terhubung ke database MySQL (Pool Ready)!");
    connection.release();
  }
});

module.exports = db.promise(); // Menggunakan promise agar mendukung async/await
