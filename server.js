const express = require("express");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const db = require("./config/database");
const visitorTracker = require("./middleware/visitorTracker");

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi Multer untuk penyimpanan dokumen
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "public", "uploads")),
  filename: (req, file, cb) => {
    cb(
      null,
      "PSB-" +
        Date.now() +
        "-" +
        Math.round(Math.random() * 1000) +
        path.extname(file.originalname),
    );
  },
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Paksa browser selalu mengambil file CSS & JS terbaru (Anti-Cache)
app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 0, etag: false }),
);
app.use(visitorTracker);

// HELPER: Format Tanggal Indonesia (Contoh: 29 November 2020)
function formatTanggalIndo(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const bulan = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

// CSS RESPONSIF KUNCI UNTUK SEMUA HALAMAN INTERNAL
const responsiveStyle = `
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 12px !important; background: #f7fee7; font-family: 'Quicksand', system-ui, sans-serif; }
    .dash-container { max-width: 1150px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); width: 100%; overflow: hidden; }
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 2px solid #d9f99d; gap: 12px; flex-wrap: wrap; }
    .dash-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; justify-content: center; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 700; text-decoration: none; cursor: pointer; border: none; white-space: nowrap; }
    .table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin-top: 10px; border: 1px solid #e2e8f0; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; min-width: 700px; }
    th, td { padding: 10px; font-size: 12.5px; border-bottom: 1px solid #e2e8f0; text-align: left; }
    th { background: #ecfccb; color: #3f6212; }
    
    @media (max-width: 768px) {
      body { padding: 8px !important; }
      .dash-container { padding: 14px 10px !important; border-radius: 12px !important; }
      .dash-header { flex-direction: column !important; align-items: stretch !important; text-align: center; }
      .dash-actions { flex-direction: column !important; width: 100% !important; }
      .btn, .dash-actions span { width: 100% !important; text-align: center; justify-content: center; }
      .card-grid { grid-template-columns: 1fr !important; }
    }
  </style>
`;

// ==========================================
// 1. RUTE HALAMAN PUBLIK
// ==========================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// ==========================================
// 2. RUTE LOGIN (DENGAN IKON MATA PASSWORD)
// ==========================================
app.get("/login/admin", (req, res) => {
  res.send(`
    <!DOCTYPE html><html lang="id"><head><title>Login Admin RA</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    ${responsiveStyle}</head>
    <body style="display:flex; justify-content:center; align-items:center; min-height:95vh;">
      <div style="background:#fff; width:100%; max-width:380px; padding:24px; border-radius:20px; box-shadow:0 15px 30px rgba(0,0,0,0.1); border-top:6px solid #65a30d;">
        <div style="text-align:center; font-size:36px; margin-bottom:10px;">🔐</div>
        <h2 style="color:#3f6212; text-align:center; margin:0 0 6px; font-size:20px;">Login Administrator</h2>
        <p style="text-align:center; font-size:12px; color:#64748b; margin-bottom:20px;">Portal Panitia PSB & Tata Usaha</p>
        <form action="/api/login/admin" method="POST">
          <div style="margin-bottom:14px;"><label style="font-size:12px; font-weight:700; color:#1e293b;">Username</label><input type="text" name="username" required autocomplete="off" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1; margin-top:4px; font-size:14px; font-weight:600;" /></div>
          <div style="margin-bottom:20px;">
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Password</label>
            <div style="position:relative; display:flex; align-items:center; margin-top:4px;">
              <input type="password" name="password" id="passAdmin" required style="width:100%; padding:10px; padding-right:40px; border-radius:8px; border:1px solid #cbd5e1; font-size:14px;" />
              <button type="button" onclick="const p=document.getElementById('passAdmin'); p.type=p.type==='password'?'text':'password'; this.innerText=p.type==='password'?'👁️':'🙈';" style="position:absolute; right:10px; background:none; border:none; cursor:pointer; font-size:16px;">👁️</button>
            </div>
          </div>
          <button type="submit" class="btn" style="background:#65a30d; color:#fff; width:100%; padding:12px; font-size:14px;">Masuk ke Dasbor</button>
          <a href="/" style="display:block; text-align:center; margin-top:16px; font-size:12px; color:#64748b; text-decoration:none; font-weight:600;">← Kembali ke Beranda</a>
        </form>
      </div>
    </body></html>
  `);
});

app.get("/login/kepsek", (req, res) => {
  res.send(`
    <!DOCTYPE html><html lang="id"><head><title>Login Kepala Sekolah</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    ${responsiveStyle}</head>
    <body style="display:flex; justify-content:center; align-items:center; min-height:95vh;">
      <div style="background:#fff; width:100%; max-width:380px; padding:24px; border-radius:20px; box-shadow:0 15px 30px rgba(0,0,0,0.1); border-top:6px solid #ef4444;">
        <div style="text-align:center; font-size:36px; margin-bottom:10px;">👑</div>
        <h2 style="color:#ef4444; text-align:center; margin:0 0 6px; font-size:20px;">Login Kepala Sekolah</h2>
        <p style="text-align:center; font-size:12px; color:#64748b; margin-bottom:20px;">Portal Monitoring & Evaluasi RA</p>
        <form action="/api/login/kepsek" method="POST">
          <div style="margin-bottom:14px;"><label style="font-size:12px; font-weight:700; color:#1e293b;">Username</label><input type="text" name="username" required autocomplete="off" style="width:100%; padding:10px; border-radius:8px; border:1px solid #cbd5e1; margin-top:4px; font-size:14px; font-weight:600;" /></div>
          <div style="margin-bottom:20px;">
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Password</label>
            <div style="position:relative; display:flex; align-items:center; margin-top:4px;">
              <input type="password" name="password" id="passKepsek" required style="width:100%; padding:10px; padding-right:40px; border-radius:8px; border:1px solid #cbd5e1; font-size:14px;" />
              <button type="button" onclick="const p=document.getElementById('passKepsek'); p.type=p.type==='password'?'text':'password'; this.innerText=p.type==='password'?'👁️':'🙈';" style="position:absolute; right:10px; background:none; border:none; cursor:pointer; font-size:16px;">👁️</button>
            </div>
          </div>
          <button type="submit" class="btn" style="background:#ef4444; color:#fff; width:100%; padding:12px; font-size:14px;">Masuk Portal Eksekutif</button>
          <a href="/" style="display:block; text-align:center; margin-top:16px; font-size:12px; color:#64748b; text-decoration:none; font-weight:600;">← Kembali ke Beranda</a>
        </form>
      </div>
    </body></html>
  `);
});

app.post("/api/login/admin", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT * FROM admin WHERE username=? AND password=?",
      [username, password],
    );
    if (rows.length > 0) res.redirect("/admin/dashboard");
    else
      res.send(
        `<script>alert('❌ Login Gagal!'); window.history.back();</script>`,
      );
  } catch (err) {
    res.status(500).send("Error DB");
  }
});

app.post("/api/login/kepsek", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT * FROM kepala_sekolah WHERE username=? AND password=?",
      [username, password],
    );
    if (rows.length > 0) res.redirect("/kepsek/dashboard");
    else
      res.send(
        `<script>alert('❌ Login Gagal!'); window.history.back();</script>`,
      );
  } catch (err) {
    res.status(500).send("Error DB");
  }
});

// ==========================================
// 3. DASBOR ADMIN (KOLOM BERKAS SYARAT KEMBALI HADIR)
// ==========================================
app.get("/admin/dashboard", async (req, res) => {
  try {
    const [psbList] = await db.query(
      "SELECT * FROM pendaftaran_psb ORDER BY id_pendaftaran DESC",
    );
    const [visitorCount] = await db.query(
      "SELECT COUNT(*) as total FROM visitor_tracker",
    );

    let tableRows = "";
    psbList.forEach((item, index) => {
      // Tombol Berkas Syarat
      let filesHtml = "";
      if (
        item.dokumen_persyaratan &&
        item.dokumen_persyaratan !== "tidak-ada-berkas"
      ) {
        const fileArray = item.dokumen_persyaratan.split(", ");
        fileArray.forEach((fn, fIdx) => {
          filesHtml += `<a href="/uploads/${fn}" target="_blank" style="display:inline-block; margin:2px; background:#eff6ff; color:#1d4ed8; padding:4px 8px; border-radius:6px; text-decoration:none; font-size:11px; font-weight:700; border:1px solid #bfdbfe;">📄 Berkas ${fIdx + 1}</a> `;
        });
      } else {
        filesHtml =
          '<span style="color:#9ca3af; font-size:12px;">Tidak ada</span>';
      }

      let badgeColor =
        item.status_pendaftaran === "Diterima"
          ? "#dcfce7"
          : item.status_pendaftaran === "Ditolak"
            ? "#fee2e2"
            : "#fef9c3";
      let textColor =
        item.status_pendaftaran === "Diterima"
          ? "#166534"
          : item.status_pendaftaran === "Ditolak"
            ? "#991b1b"
            : "#854d0e";

      tableRows += `
        <tr>
          <td>${index + 1}</td>
          <td style="font-weight:700;">${item.nama_lengkap} <br><span style="font-size:11px; color:#64748b;">NIK: ${item.nik}</span></td>
          <td>${item.jenis_kelamin}</td>
          <td>Ayah: ${item.nama_ayah}<br>Ibu: ${item.nama_ibu}</td>
          <td><a href="https://wa.me/${item.no_hp_ortu.replace(/^0/, "62")}" target="_blank" style="color:#16a34a; font-weight:700;">💬 ${item.no_hp_ortu}</a></td>
          <td>${filesHtml}</td>
          <td>
            <form action="/api/admin/status/${item.id_pendaftaran}" method="POST">
              <select name="status" onchange="this.form.submit()" style="padding:4px 8px; font-size:12px; border-radius:6px; background:${badgeColor}; color:${textColor}; font-weight:700; border:none; cursor:pointer;">
                <option value="Diproses" ${item.status_pendaftaran === "Diproses" ? "selected" : ""}>⏳ Diproses</option>
                <option value="Diterima" ${item.status_pendaftaran === "Diterima" ? "selected" : ""}>✅ Diterima</option>
                <option value="Ditolak" ${item.status_pendaftaran === "Ditolak" ? "selected" : ""}>❌ Ditolak</option>
              </select>
            </form>
          </td>
          <td><a href="/api/admin/hapus/${item.id_pendaftaran}" onclick="return confirm('Hapus data siswa?')" style="background:#fee2e2; color:#dc2626; padding:6px 10px; border-radius:6px; font-weight:700; font-size:12px; text-decoration:none; border:1px solid #fca5a5;">🗑️ Hapus</a></td>
        </tr>
      `;
    });

    res.send(`
      <!DOCTYPE html><html lang="id"><head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>Dasbor Admin RA</title>${responsiveStyle}</head>
      <body>
        <div class="dash-container" style="border-top: 6px solid #65a30d;">
          <div class="dash-header">
            <div><h1 style="color:#3f6212; font-size:20px; margin:0;">⚙️ Dasbor Pengelolaan PSB & TU</h1><p style="font-size:12px; color:#64748b; margin:4px 0 0;">KB-RA Tawang Rejosari Semarang</p></div>
            <div class="dash-actions">
              <a href="/#psb-online" target="_blank" class="btn" style="background:#16a34a; color:#fff;">+ Siswa Manual</a>
              <a href="/portal/visitor-tracker" class="btn" style="background:#facc15; color:#854d0e;">📊 Visitor Tracker</a>
              <span style="font-size:12px; background:#f7fee7; color:#3f6212; padding:8px 12px; border-radius:8px; font-weight:700;">👁️ ${visitorCount[0].total} Kunjungan</span>
              <a href="/" class="btn" style="background:#fee2e2; color:#dc2626;">Keluar</a>
            </div>
          </div>
          <h3 style="margin:0 0 10px; color:#1e293b; font-size:15px;">📋 Daftar Calon Siswa Baru (TA 2026/2027)</h3>
          <div class="table-responsive">
            <table>
              <thead><tr><th>No</th><th>Nama Siswa</th><th>L/P</th><th>Orang Tua</th><th>WhatsApp</th><th>Berkas Syarat</th><th>Ubah Status</th><th>Aksi</th></tr></thead>
              <tbody>${tableRows || '<tr><td colspan="8" style="text-align:center;">Belum ada data pendaftar.</td></tr>'}</tbody>
            </table>
          </div>
        </div>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send("Error memuat dasbor admin");
  }
});

app.post("/api/admin/status/:id", async (req, res) => {
  try {
    await db.query(
      "UPDATE pendaftaran_psb SET status_pendaftaran = ? WHERE id_pendaftaran = ?",
      [req.body.status, req.params.id],
    );
    res.redirect("/admin/dashboard");
  } catch (err) {
    res.status(500).send("Error ubah status");
  }
});
app.get("/api/admin/hapus/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM pendaftaran_psb WHERE id_pendaftaran = ?", [
      req.params.id,
    ]);
    res.redirect("/admin/dashboard");
  } catch (err) {
    res.status(500).send("Error hapus");
  }
});

// ==========================================
// 4. DASBOR KEPSEK
// ==========================================
app.get("/kepsek/dashboard", async (req, res) => {
  try {
    const [totalPendaftar] = await db.query(
      "SELECT COUNT(*) as total FROM pendaftaran_psb",
    );
    const [diterima] = await db.query(
      "SELECT COUNT(*) as total FROM pendaftaran_psb WHERE status_pendaftaran='Diterima'",
    );
    const [diproses] = await db.query(
      "SELECT COUNT(*) as total FROM pendaftaran_psb WHERE status_pendaftaran='Diproses'",
    );
    const [totalVisitor] = await db.query(
      "SELECT COUNT(*) as total FROM visitor_tracker",
    );

    res.send(`
      <!DOCTYPE html><html lang="id"><head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>Monitoring Kepala Sekolah</title>${responsiveStyle}</head>
      <body>
        <div class="dash-container" style="border-top: 6px solid #ef4444;">
          <div class="dash-header">
            <div><h1 style="color:#ef4444; font-size:20px; margin:0;">👑 Portal Eksekutif Kepala Sekolah</h1><p style="font-size:12px; color:#991b1b; margin:4px 0 0;">FAIZAH, S.Pd.AUD., M.Pd. · RA Tawang Rejosari</p></div>
            <div class="dash-actions">
              <a href="/kepsek/laporan/cetak" target="_blank" class="btn" style="background:#16a34a; color:#fff; box-shadow:0 4px 10px rgba(22,163,74,0.3);">🖨️ Cetak Laporan PSB</a>
              <a href="/portal/visitor-tracker" class="btn" style="background:#65a30d; color:#fff;">📊 Visitor Tracker</a>
              <a href="/" class="btn" style="background:#fee2e2; color:#dc2626;">Keluar</a>
            </div>
          </div>

          <div class="card-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:14px; margin-bottom:20px;">
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:16px; border-radius:12px; text-align:center;"><h3 style="font-size:12px; color:#166534; margin:0;">TOTAL PENDAFTAR</h3><span style="font-size:32px; font-weight:800; color:#15803d;">${totalPendaftar[0].total}</span><p style="font-size:11px; color:#166534; margin:0;">Calon Siswa</p></div>
            <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:16px; border-radius:12px; text-align:center;"><h3 style="font-size:12px; color:#1e40af; margin:0;">SISWA DITERIMA</h3><span style="font-size:32px; font-weight:800; color:#1d4ed8;">${diterima[0].total}</span><p style="font-size:11px; color:#1e40af; margin:0;">Terverifikasi</p></div>
            <div style="background:#fdf2f8; border:1px solid #fbcfe8; padding:16px; border-radius:12px; text-align:center;"><h3 style="font-size:12px; color:#9d174d; margin:0;">MASIH DIPROSES</h3><span style="font-size:32px; font-weight:800; color:#be185d;">${diproses[0].total}</span><p style="font-size:11px; color:#9d174d; margin:0;">Menunggu TU</p></div>
            <div style="background:#fef9c3; border:1px solid #fde047; padding:16px; border-radius:12px; text-align:center;"><h3 style="font-size:12px; color:#854d0e; margin:0;">TRAFFIC WEBSITE</h3><span style="font-size:32px; font-weight:800; color:#a16207;">${totalVisitor[0].total}</span><p style="font-size:11px; color:#854d0e; margin:0;">Kunjungan</p></div>
          </div>

          <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:16px; border-radius:12px;">
            <h3 style="margin:0 0 6px; color:#334155; font-size:14px;">📌 Instruksi Pengawasan Eksekutif</h3>
            <p style="font-size:12.5px; color:#475569; line-height:1.6; margin:0;">Kepala Sekolah dapat memantau pergerakan trafik website melalui <strong>Visitor Tracker</strong>, serta mengunduh dokumen resmi rekapitulasi siswa baru melalui tombol <strong>"🖨️ Cetak Laporan PSB"</strong> di atas untuk keperluan akreditasi maupun arsip tahunan madrasah.</p>
          </div>
        </div>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send("Error memuat dasbor kepsek");
  }
});

// ==========================================
// 5. FITUR CETAK LAPORAN PSB (DENGAN KOP SEKOLAH, TTL BERSIH, & TTD RESMI)
// ==========================================
app.get("/kepsek/laporan/cetak", async (req, res) => {
  try {
    const [psbList] = await db.query(
      "SELECT * FROM pendaftaran_psb ORDER BY status_pendaftaran DESC, id_pendaftaran ASC",
    );
    let tableRows = "";
    psbList.forEach((item, idx) => {
      // Format TTL Bersih (Contoh: Kendal, 29 November 2020)
      let ttlBersih = `${item.tempat_lahir}, ${formatTanggalIndo(item.tanggal_lahir)}`;

      tableRows += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${item.nama_lengkap}</strong><br><small>NIK: ${item.nik}</small></td>
          <td style="text-align:center;">${item.jenis_kelamin === "Laki-laki" ? "L" : "P"}</td>
          <td>${ttlBersih}</td>
          <td>Ayah: ${item.nama_ayah}<br>Ibu: ${item.nama_ibu}</td>
          <td>${item.no_hp_ortu}</td>
          <td style="text-align:center; font-weight:bold; color:${item.status_pendaftaran === "Diterima" ? "#16a34a" : "#dc2626"}">${item.status_pendaftaran.toUpperCase()}</td>
        </tr>
      `;
    });

    res.send(`
      <!DOCTYPE html><html lang="id"><head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Laporan PSB Resmi - RA Tawang Rejosari</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; padding: 20px; color: #000; }
        .kop-surat { border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 20px; text-align: center; }
        .kop-text h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
        .kop-text h1 { margin: 2px 0; font-size: 22px; font-weight: bold; }
        .kop-text p { margin: 0; font-size: 12px; font-style: italic; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #000; padding: 8px; font-size: 12px; text-align: left; }
        th { background: #f0f0f0; text-align: center; }
        .ttd-box { float: right; width: 260px; text-align: center; margin-top: 30px; font-size: 13px; }
        @media print { .no-print { display: none; } }
      </style></head>
      <body>
        <div class="no-print" style="margin-bottom: 15px; text-align: right;">
          <button onclick="window.print()" style="background:#16a34a; color:#fff; padding:10px 18px; border:none; border-radius:6px; font-weight:bold; cursor:pointer;">🖨️ Cetak / Simpan PDF Sekarang</button>
        </div>
        
        <div class="kop-surat">
          <!-- Gambar Kop Resmi Sekolah (Otomatis tampil jika file kop-sekolah.png / jpg ditambahkan ke folder public/images) -->
          <img src="/images/kop-sekolah.png" onerror="this.style.display='none'; document.getElementById('kop-fallback').style.display='block';" style="width:100%; max-height:150px; object-fit:contain; margin-bottom:10px;" />
          
          <div id="kop-fallback" class="kop-text">
            <h2>YAYASAN PENDIDIKAN ISLAM TAWANG REJOSARI</h2>
            <h1>RA TAWANG REJOSARI SEMARANG</h1>
            <p>Jl. Tawang Rejosari Raya No.1, Tawangmas, Kec. Semarang Barat, Kota Semarang, Jawa Tengah</p>
            <p>Email: ra.tawangrejosari@gmail.com | CP: 0882-0030-53910 | Status: Terakreditasi B</p>
          </div>
        </div>

        <h3 style="text-align:center; text-decoration:underline; margin-bottom:4px;">LAPORAN REKAPITULASI PENERIMAAN SISWA BARU (PSB)</h3>
        <p style="text-align:center; font-size:12px; margin-top:0;">Tahun Ajaran 2026/2027</p>

        <table>
          <thead><tr><th>No</th><th>Nama Anak Didik</th><th>L/P</th><th>Tempat, Tanggal Lahir (TTL)</th><th>Orang Tua</th><th>No. WhatsApp</th><th>Status</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="7" style="text-align:center;">Belum ada data pendaftar.</td></tr>'}</tbody>
        </table>

        <!-- TTD RESMI KEPALA SEKOLAH SESUAI REVISI -->
        <div class="ttd-box">
          <p>Semarang, ${formatTanggalIndo(new Date())}<br>Kepala RA Tawang Rejosari,</p>
          <br><br><br>
          <p><strong><u>FAIZAH, S.Pd.AUD., M.Pd.</u></strong><br>NIP: 197902162005012003</p>
        </div>

        <script>window.onload = () => { setTimeout(() => { window.print(); }, 500); };</script>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send("Error membuat laporan cetak");
  }
});

// ==========================================
// 6. VISITOR TRACKER
// ==========================================
app.get("/portal/visitor-tracker", async (req, res) => {
  try {
    const [totalVisits] = await db.query(
      "SELECT COUNT(*) as total FROM visitor_tracker",
    );
    const [todayVisits] = await db.query(
      "SELECT COUNT(*) as total FROM visitor_tracker WHERE DATE(waktu_kunjungan) = CURRENT_DATE()",
    );
    const [uniqueVisitors] = await db.query(
      "SELECT COUNT(*) as total FROM pengunjung",
    );

    const [topPages] = await db.query(
      "SELECT halaman_diakses, COUNT(*) as total FROM visitor_tracker GROUP BY halaman_diakses ORDER BY total DESC LIMIT 8",
    );
    let pageHtml = "";
    topPages.forEach((p, idx) => {
      pageHtml += `<tr><td>${idx + 1}</td><td style="font-weight:700;"><code>${p.halaman_diakses}</code></td><td>${p.total} kali</td></tr>`;
    });

    const [recentLogs] = await db.query(
      `SELECT p.ip_address, p.perangkat, p.browser, vt.halaman_diakses, vt.waktu_kunjungan FROM visitor_tracker vt JOIN pengunjung p ON vt.id_pengunjung = p.id_pengunjung ORDER BY vt.waktu_kunjungan DESC LIMIT 15`,
    );
    let logHtml = "";
    recentLogs.forEach((l) => {
      let waktu = new Date(l.waktu_kunjungan).toLocaleString("id-ID", {
        dateStyle: "short",
        timeStyle: "medium",
      });
      logHtml += `<tr><td style="color:#64748b;">${waktu}</td><td style="font-family:monospace;">${l.ip_address}</td><td>${l.perangkat === "Mobile" ? "📱 Mobile" : "💻 PC"} (${l.browser})</td><td style="font-weight:700; color:#65a30d;">${l.halaman_diakses}</td></tr>`;
    });

    res.send(`
      <!DOCTYPE html><html lang="id"><head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>Analitik Visitor Tracker</title>${responsiveStyle}</head>
      <body>
        <div class="dash-container" style="border-top: 6px solid #facc15;">
          <div class="dash-header">
            <div><h1 style="color:#854d0e; font-size:20px; margin:0;">📊 Analitik & Monitoring Visitor Tracker</h1><p style="font-size:12px; color:#64748b; margin:4px 0 0;">Pelacak Kunjungan Real-Time · RA Tawang Rejosari</p></div>
            <div class="dash-actions">
              <a href="/admin/dashboard" class="btn" style="background:#65a30d; color:#fff;">← Dasbor Admin</a>
              <a href="/kepsek/dashboard" class="btn" style="background:#ef4444; color:#fff;">← Dasbor Kepsek</a>
            </div>
          </div>

          <div class="card-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:14px; margin-bottom:20px;">
            <div style="background:#fef9c3; border:1px solid #fde047; padding:16px; border-radius:12px; text-align:center;"><h3 style="font-size:12px; color:#854d0e; margin:0;">TOTAL KUNJUNGAN</h3><span style="font-size:32px; font-weight:800; color:#a16207;">${totalVisits[0].total}</span><p style="font-size:11px; color:#854d0e; margin:0;">Hits Halaman</p></div>
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:16px; border-radius:12px; text-align:center;"><h3 style="font-size:12px; color:#166534; margin:0;">HARI INI</h3><span style="font-size:32px; font-weight:800; color:#15803d;">${todayVisits[0].total}</span><p style="font-size:11px; color:#166534; margin:0;">Sesi Aktif</p></div>
            <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:16px; border-radius:12px; text-align:center;"><h3 style="font-size:12px; color:#1e40af; margin:0;">PENGUNJUNG UNIK</h3><span style="font-size:32px; font-weight:800; color:#1d4ed8;">${uniqueVisitors[0].total}</span><p style="font-size:11px; color:#1e40af; margin:0;">IP Berbeda</p></div>
          </div>

          <h3 style="margin:0 0 10px; color:#1e293b; font-size:15px;">🔥 Halaman Paling Sering Diakses</h3>
          <div class="table-responsive" style="margin-bottom:20px;">
            <table><thead><tr><th>No</th><th>URL Halaman</th><th>Jumlah Akses</th></tr></thead><tbody>${pageHtml}</tbody></table>
          </div>

          <h3 style="margin:0 0 10px; color:#1e293b; font-size:15px;">⏱️ Log Aktivitas Real-Time</h3>
          <div class="table-responsive">
            <table><thead><tr><th>Waktu</th><th>IP Address</th><th>Perangkat & Browser</th><th>Halaman</th></tr></thead><tbody>${logHtml}</tbody></table>
          </div>
        </div>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send("Error memuat Visitor Tracker");
  }
});

// ==========================================
// 7. PROSES SIMPAN FORMULIR PSB ONLINE
// ==========================================
app.post("/api/psb/daftar", upload.array("dokumen", 10), async (req, res) => {
  try {
    const d = req.body;
    let namaFiles =
      req.files && req.files.length > 0
        ? req.files.map((f) => f.filename).join(", ")
        : "tidak-ada-berkas";
    let berat = d.berat_tinggi ? d.berat_tinggi.split("/")[0] : "";
    let tinggi = d.berat_tinggi ? d.berat_tinggi.split("/")[1] : "";

    const query = `INSERT INTO pendaftaran_psb 
      (nama_lengkap, nama_panggilan, nik, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, kewarganegaraan, anak_ke, jumlah_saudara, bahasa_sehari, berat_badan, tinggi_badan, golongan_darah, penyakit_diderita, alamat_siswa, telp_rumah, jarak_sekolah, nama_ayah, nama_ibu, pendidikan_ayah, pendidikan_ibu, pekerjaan_ayah, pekerjaan_ibu, nama_wali, pendidikan_wali, hubungan_wali, pekerjaan_wali, no_hp_ortu, status_masuk, nama_paud_asal, tanggal_pindah, dokumen_persyaratan) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      d.nama_lengkap,
      d.nama_panggilan,
      d.nik,
      d.jenis_kelamin,
      d.tempat_lahir,
      d.tanggal_lahir,
      d.agama || "Islam",
      d.kewarganegaraan || "Indonesia",
      d.anak_ke || 1,
      d.jumlah_saudara || 0,
      d.bahasa_sehari || "Jawa/Indonesia",
      berat.trim(),
      tinggi ? tinggi.trim() : "",
      d.golongan_darah || "",
      d.penyakit_diderita || "",
      d.alamat_siswa,
      d.telp_rumah || "",
      d.jarak_sekolah || "",
      d.nama_ayah,
      d.nama_ibu,
      d.pendidikan_ayah || "",
      d.pendidikan_ibu || "",
      d.pekerjaan_ayah,
      d.pekerjaan_ibu,
      d.nama_wali || "",
      d.pendidikan_wali || "",
      d.hubungan_wali || "",
      d.pekerjaan_wali || "",
      d.no_hp_ortu,
      d.status_masuk,
      d.nama_paud_asal || "",
      d.tanggal_pindah || null,
      namaFiles,
    ];

    await db.query(query, values);
    res.send(
      `<script>alert('🎉 Alhamdulillah! Pendaftaran PSB atas nama ${d.nama_panggilan} berhasil disimpan!'); window.location.href='/';</script>`,
    );
  } catch (error) {
    let pesanError =
      error.code === "ER_DUP_ENTRY"
        ? `NIK anak (${req.body.nik}) sudah pernah didaftarkan!`
        : `Gagal menyimpan: ${error.message}`;
    res.send(
      `<script>alert('⚠️ ${pesanError}'); window.history.back();</script>`,
    );
  }
});

// ==========================================
// 8. RUTE CEK STATUS PENDAFTARAN PSB
// ==========================================
app.post("/api/psb/cek-status", async (req, res) => {
  const { nik, no_hp } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT * FROM pendaftaran_psb WHERE nik = ? AND no_hp_ortu = ? ORDER BY id_pendaftaran DESC LIMIT 1",
      [nik.trim(), no_hp.trim()],
    );
    if (rows.length > 0) {
      const siswa = rows[0];
      let pesan =
        siswa.status_pendaftaran === "Diterima"
          ? `SELAMAT! Ananda ${siswa.nama_lengkap} dinyatakan DITERIMA.`
          : siswa.status_pendaftaran === "Ditolak"
            ? `Mohon maaf, pendaftaran ananda DITOLAK/berkas kurang.`
            : `Pendaftaran ananda DALAM PROSES VERIFIKASI.`;
      res.send(
        `<script>alert('📌 STATUS PSB:\\nNama: ${siswa.nama_lengkap}\\nStatus: [ ${siswa.status_pendaftaran.toUpperCase()} ]\\n\\n${pesan}'); window.location.href='/#status-psb';</script>`,
      );
    } else {
      res.send(
        `<script>alert('⚠️ Data Tidak Ditemukan! Pastikan NIK dan No WhatsApp sesuai.'); window.location.href='/#status-psb';</script>`,
      );
    }
  } catch (err) {
    res.send(
      `<script>alert('❌ Terjadi kesalahan.'); window.history.back();</script>`,
    );
  }
});

app.listen(PORT, () => {
  console.log(
    `\n🚀 Peladen RA Tawang Rejosari Siap di http://localhost:${PORT}\n`,
  );
});
