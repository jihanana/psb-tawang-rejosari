/**
 * ==========================================================================
 * SCRIPT UTAMA KLIEN (FRONTEND) - KB-RA TAWANG REJOSARI SEMARANG
 * Berisi interaktivitas UI tambahan, pemantauan scroll, & validasi form
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log(
    "🌿 Sistem Informasi & PSB Online RA Tawang Rejosari Siap Dijalankan!",
  );

  // ========================================================================
  // 1. EFEK BAYANGAN DINAMIS PADA HEADER SAAT LAYAR DIGULIR (SCROLL)
  // ========================================================================
  const header = document.querySelector(".app-header");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        header.style.boxShadow = "0 6px 20px rgba(26, 46, 5, 0.25)";
        header.style.background =
          "linear-gradient(90deg, rgba(63, 98, 18, 0.98), rgba(101, 163, 13, 0.98))";
      } else {
        header.style.boxShadow = "0 4px 16px rgba(26, 46, 5, 0.15)";
        header.style.background =
          "linear-gradient(90deg, rgba(77, 124, 15, 0.96), rgba(101, 163, 13, 0.96))";
      }
    });
  }

  // ========================================================================
  // 2. VALIDASI PINTAR FORMULIR PSB ONLINE SEBELUM DIKIRIM KE DATABASE
  // ========================================================================
  const formPsb = document.getElementById("form-psb");
  if (formPsb) {
    formPsb.addEventListener("submit", function (e) {
      const nikInput = formPsb.querySelector('input[name="nik"]');
      const noHpInput = formPsb.querySelector('input[name="no_hp_ortu"]');
      const namaInput = formPsb.querySelector('input[name="nama_lengkap"]');

      // a. Validasi NIK wajib tepat 16 angka
      if (nikInput) {
        const nikVal = nikInput.value.trim();
        if (nikVal.length !== 16 || isNaN(nikVal)) {
          alert(
            "⚠️ Mohon periksa kembali NIK Anak!\n\nNomor Induk Kependudukan (NIK) yang tertera pada Kartu Keluarga (KK) atau Akte Kelahiran harus berjumlah TEPAT 16 ANGKA.",
          );
          nikInput.focus();
          e.preventDefault(); // Batalkan pengiriman form
          return false;
        }
      }

      // b. Validasi Nomor WhatsApp minimal 10 angka
      if (noHpInput) {
        const hpVal = noHpInput.value.trim();
        if (hpVal.length < 10 || isNaN(hpVal)) {
          alert(
            "⚠️ Nomor WhatsApp Orang Tua Tidak Valid!\n\nMohon masukkan nomor WhatsApp yang aktif (minimal 10 angka, contoh: 081234567890) agar panitia dapat menghubungi Anda terkait konfirmasi dan cicilan biaya.",
          );
          noHpInput.focus();
          e.preventDefault();
          return false;
        }
      }

      // c. Konfirmasi akhir sebelum kirim
      const konfirmasi = confirm(
        `📝 Apakah data pendaftaran atas nama "${namaInput ? namaInput.value : "Anak Calon Siswa"}" sudah diisi dengan benar dan sesuai dokumen resmi?`,
      );
      if (!konfirmasi) {
        e.preventDefault();
        return false;
      }
    });
  }

  // ========================================================================
  // 3. PEMBERSIHAN OTOMATIS INPUT ANGKA DARI KARAKTER ASING
  // ========================================================================
  const onlyNumbers = document.querySelectorAll(
    'input[name="nik"], input[name="no_hp_ortu"], input[name="telp_rumah"], input[name="anak_ke"], input[name="jumlah_saudara"]',
  );
  onlyNumbers.forEach((input) => {
    input.addEventListener("input", function () {
      // Hanya mengizinkan angka 0-9
      this.value = this.value.replace(/[^0-9]/g, "");
    });
  });
});
