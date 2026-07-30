const db = require("../config/database");

const visitorTracker = async (req, res, next) => {
  try {
    // Abaikan pelacakan untuk file statis (css, js, gambar)
    if (
      req.originalUrl.startsWith("/css") ||
      req.originalUrl.startsWith("/js") ||
      req.originalUrl.startsWith("/images")
    ) {
      return next();
    }

    const ipAddress =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const userAgent = req.headers["user-agent"] || "Unknown";
    const halamanDiakses = req.originalUrl;

    // Deteksi sederhana jenis perangkat
    let perangkat = "Desktop";
    if (/mobile/i.test(userAgent)) perangkat = "Mobile";
    else if (/tablet/i.test(userAgent)) perangkat = "Tablet";

    // Deteksi sederhana jenis browser
    let browser = "Other";
    if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent))
      browser = "Chrome";
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent))
      browser = "Safari";
    else if (/firefox/i.test(userAgent)) browser = "Firefox";
    else if (/edge/i.test(userAgent)) browser = "Edge";

    // 1. Simpan atau update data di tabel pengunjung
    const [existingVisitor] = await db.query(
      "SELECT id_pengunjung FROM pengunjung WHERE ip_address = ? AND browser = ? AND perangkat = ?",
      [ipAddress, browser, perangkat],
    );

    let idPengunjung;
    if (existingVisitor.length > 0) {
      idPengunjung = existingVisitor[0].id_pengunjung;
    } else {
      const [newVisitor] = await db.query(
        "INSERT INTO pengunjung (ip_address, perangkat, browser) VALUES (?, ?, ?)",
        [ipAddress, perangkat, browser],
      );
      idPengunjung = newVisitor.insertId;
    }

    // 2. Simpan ke tabel visitor_tracker
    await db.query(
      "INSERT INTO visitor_tracker (id_pengunjung, halaman_diakses) VALUES (?, ?)",
      [idPengunjung, halamanDiakses],
    );
  } catch (error) {
    console.error("⚠️ Error Visitor Tracker:", error.message);
  } finally {
    next(); // Lanjutkan ke halaman yang dituju
  }
};

module.exports = visitorTracker;
