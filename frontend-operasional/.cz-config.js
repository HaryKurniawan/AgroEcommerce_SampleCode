"use strict";

module.exports = {
  types: [
    { value: "feat", name: "feat:      Fitur baru" },
    { value: "fix", name: "fix:       Perbaikan bug" },
    { value: "ui", name: "ui:        Perubahan tampilan / UI" },
    { value: "refactor", name: "refactor:  Refaktor kode" },
    { value: "perf", name: "perf:      Peningkatan performa" },
    { value: "docs", name: "docs:      Perubahan dokumentasi" },
    { value: "test", name: "test:      Menambah atau memperbaiki test" },
    {
      value: "chore",
      name: "chore:     Pemeliharaan (config, dependencies, tools)",
    },
    {
      value: "build",
      name: "build:     Perubahan sistem build atau dependencies",
    },
    { value: "ci", name: "ci:        Perubahan konfigurasi CI/CD" },
    { value: "revert", name: "revert:    Revert commit sebelumnya" },
  ],

  scopes: [
    { name: "auth" },
    { name: "seller" },
    { name: "admin" },
    { name: "kurir" },
    { name: "produk" },
    { name: "pesanan" },
    { name: "toko" },
    { name: "gudang" },
    { name: "pengajuan-stok" },
    { name: "laporan" },
    { name: "analytics" },
    { name: "dashboard" },
    { name: "pengguna" },
    { name: "components" },
    { name: "hooks" },
    { name: "api" },
    { name: "config" },
    { name: "deps" },
    { name: "global" },
  ],

  messages: {
    type: "Pilih TIPE perubahan yang kamu buat:\n",
    scope: "Pilih SCOPE / modul yang terpengaruh (tekan Enter untuk skip):\n",
    customScope: "Tulis scope secara manual:\n",
    subject: "Tulis JUDUL perubahan (singkat, kata kerja aktif):\n",
    body: "Tulis DETAIL perubahan (tekan Enter untuk skip):\n",
    breaking:
      "Ada BREAKING CHANGE? Jelaskan jika ada (tekan Enter untuk skip):\n",
    footer: "Terkait ISSUE? Contoh: #12, #34 (tekan Enter untuk skip):\n",
    confirmCommit: "Konfirmasi commit dengan pesan di atas?",
  },

  allowCustomScopes: true,
  allowBreakingChanges: ["feat", "fix", "refactor"],
  skipQuestions: ["body", "breaking", "footer"],
  subjectLimit: 100,
  footerPrefix: "TERKAIT ISSUE:",
  breakingPrefix: "BREAKING CHANGE:",
};
