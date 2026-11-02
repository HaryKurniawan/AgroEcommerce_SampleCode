"use client";

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InvoiceItem {
  id: string;
  namaProduk: string;
  varianProduk?: string | null;
  satuan: string;
  hargaGudang: number;
  jumlahPermintaan: number;
  jumlahDisetujui: number | null;
  totalHargaBeli: number | null;
  ukuranKemasanKg?: number | null;
  jumlahKemasan?: number | null;
  totalKg?: number | null;
}

interface GudangInfo {
  id: string;
  kode?: string;
  nama: string;
  alamat?: string;
  kabupaten?: string;
  provinsi?: string;
  telepon?: string;
  email?: string;
}

interface TokoInfo {
  id: string;
  nama: string;
  alamat?: string;
  kota?: string;
  provinsi?: string;
  kodePos?: string;
  telepon?: string;
  email?: string;
  deskripsi?: string;
}

export interface PengajuanStokData {
  id: string;
  tokoId: string;
  gudangId: string;
  status: string;
  catatan?: string;
  catatanGudang?: string;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
  gudang?: GudangInfo;
  toko?: TokoInfo;
}

export interface InvoicePengajuanStokProps {
  data: PengajuanStokData;
  tokoInfo?: TokoInfo | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(Math.round(n));

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const fmtDateLong = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

function buildInvoiceNo(id: string, createdAt: string): string {
  const d = new Date(createdAt);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const prefix = id?.slice(0, 3).toUpperCase() || "INV";
  const romanMonth: Record<number, string> = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX",
    10: "X",
    11: "XI",
    12: "XII",
  };
  return `${prefix}/PO/PTAJ/${romanMonth[d.getMonth() + 1]}/${yyyy}`;
}

/**
 * Ekstrak varian produk dari nama produk.
 * Prioritas: "Fresh Cut" > "Frozen" > "Fresh" > kata lain.
 * Semua cek case-insensitive dan support variasi penulisan.
 */
function extractVarian(namaProduk: string): string {
  const s = namaProduk.toLowerCase().trim();

  // Urut dari yang paling spesifik ke paling umum
  if (/fresh\s*cut/.test(s)) return "Fresh Cut";
  if (/fesh\s*cut/.test(s)) return "Fresh Cut"; // typo tolerance
  if (/frozen/.test(s)) return "Frozen";
  if (/frozn/.test(s)) return "Frozen"; // typo tolerance
  if (/\bfresh\b/.test(s)) return "Fresh";
  if (/kering/.test(s)) return "Kering";
  if (/basah/.test(s)) return "Basah";
  if (/olahan/.test(s)) return "Olahan";
  if (/rebus/.test(s)) return "Rebus";
  if (/kukus/.test(s)) return "Kukus";
  if (/iris/.test(s)) return "Iris";
  if (/cincang/.test(s)) return "Cincang";
  if (/kupas/.test(s)) return "Kupas";

  return "-";
}

// Konversi angka ke kata (Terbilang Indonesia)
function terbilang(n: number): string {
  if (n === 0) return "Nol";
  const satuan = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
    "Dua Belas",
    "Tiga Belas",
    "Empat Belas",
    "Lima Belas",
    "Enam Belas",
    "Tujuh Belas",
    "Delapan Belas",
    "Sembilan Belas",
  ];
  if (n < 20) return satuan[n];
  if (n < 100) {
    const puluhanMap: Record<number, string> = {
      2: "Dua Puluh",
      3: "Tiga Puluh",
      4: "Empat Puluh",
      5: "Lima Puluh",
      6: "Enam Puluh",
      7: "Tujuh Puluh",
      8: "Delapan Puluh",
      9: "Sembilan Puluh",
    };
    const tens = Math.floor(n / 10),
      ones = n % 10;
    return ones === 0
      ? puluhanMap[tens]
      : `${puluhanMap[tens]} ${satuan[ones]}`;
  }
  if (n < 200) return `Seratus ${terbilang(n - 100)}`.trim();
  if (n < 1000) {
    const h = Math.floor(n / 100),
      r = n % 100;
    return r === 0
      ? `${satuan[h]} Ratus`
      : `${satuan[h]} Ratus ${terbilang(r)}`;
  }
  if (n < 2000) return `Seribu ${terbilang(n - 1000)}`.trim();
  if (n < 1_000_000) {
    const k = Math.floor(n / 1000),
      r = n % 1000;
    return r === 0
      ? `${terbilang(k)} Ribu`
      : `${terbilang(k)} Ribu ${terbilang(r)}`;
  }
  if (n < 1_000_000_000) {
    const m = Math.floor(n / 1_000_000),
      r = n % 1_000_000;
    return r === 0
      ? `${terbilang(m)} Juta`
      : `${terbilang(m)} Juta ${terbilang(r)}`;
  }
  const b = Math.floor(n / 1_000_000_000),
    r = n % 1_000_000_000;
  return r === 0
    ? `${terbilang(b)} Miliar`
    : `${terbilang(b)} Miliar ${terbilang(r)}`;
}

function rupiahTerbilang(amount: number): string {
  return amount === 0
    ? "Nol Rupiah"
    : `${terbilang(Math.round(amount))} Rupiah`;
}

// ─── Shared style tokens ───────────────────────────────────────────────────────

const S = {
  page: {
    width: "794px",
    minHeight: "1122px",
    backgroundColor: "#fff",
    fontFamily: "'Times New Roman', Times, serif",
    fontSize: "11px",
    color: "#111",
    padding: "36px 48px 80px",
    boxSizing: "border-box" as const,
    position: "relative" as const,
    lineHeight: "1.45",
  },
  borderBlack: "1px solid #111",
  borderLight: "1px solid #ccc",
};

// ─── Component ────────────────────────────────────────────────────────────────

export const InvoicePengajuanStok = React.forwardRef<
  HTMLDivElement,
  InvoicePengajuanStokProps
>(({ data, tokoInfo }, ref) => {
  const gudang = data.gudang;
  const toko = tokoInfo || data.toko;

  /* ── Derived values ─────────────────────────────── */
  const noInvoice = buildInvoiceNo(data.id, data.createdAt);
  const tglPesan = fmtDateLong(data.createdAt);
  const tglDiterima = fmtDateLong(data.updatedAt);

  const payDue = new Date(data.updatedAt);
  payDue.setDate(payDue.getDate() + 5);
  const tglPayment = fmtDate(payDue.toISOString());

  const grandTotal = data.items.reduce((s, it) => {
    const qty = it.jumlahDisetujui ?? it.jumlahPermintaan;
    return s + qty * (it.hargaGudang || 0);
  }, 0);

  const totalSatuan = data.items.reduce(
    (s, it) => s + (it.jumlahDisetujui ?? it.jumlahPermintaan),
    0,
  );

  /* ── Info defaults ──────────────────────────────── */
  // Gudang = penjual / supplier (PT. Cianjur Sugih Mukti)
  const gudangNamaFull = gudang?.nama || "PT. CIANJUR SUGIH MUKTI (PERSERODA)";
  const gudangAlamat =
    gudang?.alamat ||
    "Pasar Induk Pasir Hayam Sirnagalih, Kec. Cilaku, Kab. Cianjur, Jawa Barat 43285";
  const gudangTelepon = gudang?.telepon || "";

  // Toko = pembeli (PT. Agro Jabar)
  const tokoNama = toko?.nama || "PT. AGRO JABAR (PERSERODA)";
  const tokoDeskripsi = toko?.deskripsi || "(Mitra Sayuran Frozen)";
  const tokoAlamat =
    toko?.alamat || "Jln. Kinanti No. 26, Turangga, Kecamatan Lengkong";
  const tokoKota = toko?.kota || "Kota Bandung 40262";
  const tokoProvinsi = toko?.provinsi || "Provinsi Jawa Barat - Indonesia";

  // Split nama gudang agar "(PERSERODA)" di baris kedua
  const [gudangNamaBase, gudangNamaSuffix] = gudangNamaFull.includes("(")
    ? [
        gudangNamaFull.split("(")[0].trim(),
        `(${gudangNamaFull.split("(")[1].replace(")", "").trim()})`,
      ]
    : [gudangNamaFull, ""];

  // Extract nama penerima from catatan if exists
  const penerimaMatch = data.catatan?.match(/\|\s*Penerima:\s*(.+)$/i);
  const namaPenerima = penerimaMatch
    ? penerimaMatch[1].trim()
    : "_________________";

  /* ── Minimal blank rows sehingga tabel tampak penuh ── */
  const MIN_ROWS = 8;
  const emptyRows = Math.max(0, MIN_ROWS - data.items.length);

  /* ── Cell style helpers ─────────────────────────── */
  const thCell = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    padding: "5px 6px",
    border: S.borderBlack,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#f5f5f5",
    fontSize: "10px",
    letterSpacing: "0.3px",
    ...extra,
  });

  const tdCell = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    padding: "4px 6px",
    border: S.borderLight,
    fontSize: "10.5px",
    verticalAlign: "middle",
    ...extra,
  });

  /* ── Render ─────────────────────────────────────── */
  return (
    <div ref={ref} id="invoice-print-area" style={S.page}>
      {/* ════════════════════════════════════════════════════
          HEADER  —  Logo kiri · Nama perusahaan kanan
      ════════════════════════════════════════════════════ */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "18px",
        }}
      >
        {/* Logo / Lambang */}
        <div
          style={{
            width: "76px",
            height: "76px",
            borderRadius: "50%",
            border: "3px solid #b8940d",
            background: "radial-gradient(circle at 40% 35%, #f9e98e, #c9950a)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {/* Inner ring */}
          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "50%",
              border: "1.5px solid #7a5c00",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: "7.5px",
                fontWeight: "900",
                color: "#3d2e00",
                letterSpacing: "1px",
                lineHeight: "1.25",
                textAlign: "center",
              }}
            >
              AGRO
              <br />
              JABAR
            </span>
          </div>
        </div>

        {/* Nama perusahaan gudang (kanan) */}
        <div style={{ textAlign: "right", maxWidth: "380px" }}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#000",
              lineHeight: "1.25",
            }}
          >
            {gudangNamaBase}
          </div>
          {gudangNamaSuffix && (
            <div
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: "#000",
                marginTop: "1px",
              }}
            >
              {gudangNamaSuffix}
            </div>
          )}
          <div
            style={{
              fontSize: "9px",
              color: "#444",
              marginTop: "5px",
              lineHeight: "1.55",
            }}
          >
            {gudangAlamat}
          </div>
          {gudangTelepon && (
            <div style={{ fontSize: "9px", color: "#444" }}>
              Telp: {gudangTelepon}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          JUDUL  —  "I N V O I C E"
      ════════════════════════════════════════════════════ */}
      <div
        style={{
          borderTop: "3px solid #111",
          borderBottom: "2px solid #111",
          textAlign: "center",
          padding: "5px 0 4px",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            fontSize: "15px",
            fontWeight: "bold",
            letterSpacing: "10px",
            color: "#000",
          }}
        >
          I N V O I C E
        </span>
      </div>

      {/* ════════════════════════════════════════════════════
          INFO  —  3-kolom: Pembeli | Purchase Order | Alamat Kirim
      ════════════════════════════════════════════════════ */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "14px",
          fontSize: "10px",
        }}
      >
        <tbody>
          <tr>
            {/* Kolom 1 — Pembeli */}
            <td
              style={{
                width: "33%",
                padding: "10px 12px",
                verticalAlign: "top",
                border: S.borderBlack,
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  textDecoration: "underline",
                  marginBottom: "5px",
                  fontSize: "10.5px",
                }}
              >
                {tokoNama}
              </div>
              <div style={{ color: "#333", lineHeight: "1.7" }}>
                <div>{tokoDeskripsi}</div>
                <div>{tokoAlamat}</div>
                <div>{tokoKota}</div>
                <div>{tokoProvinsi}</div>
              </div>
            </td>

            {/* Kolom 2 — Purchase Order */}
            <td
              style={{
                width: "34%",
                padding: "10px 12px",
                verticalAlign: "top",
                border: S.borderBlack,
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  textDecoration: "underline",
                  marginBottom: "6px",
                  fontSize: "10.5px",
                }}
              >
                Purchase Order :
              </div>
              <table
                style={{
                  borderCollapse: "collapse",
                  fontSize: "10px",
                  width: "100%",
                }}
              >
                <tbody>
                  {[
                    ["Nomor", noInvoice, true],
                    ["Tanggal Pesan", tglPesan, false],
                    ["Tanggal Diterima/Pengiriman", tglDiterima, false],
                  ].map(([label, val, bold]) => (
                    <tr key={label as string}>
                      <td
                        style={{
                          paddingBottom: "3px",
                          whiteSpace: "nowrap",
                          color: "#222",
                        }}
                      >
                        {label}
                      </td>
                      <td style={{ paddingBottom: "3px", padding: "0 5px" }}>
                        :
                      </td>
                      <td
                        style={{
                          paddingBottom: "3px",
                          fontWeight: bold ? "bold" : "normal",
                        }}
                      >
                        {val}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: "1.5px solid #333" }}>
                    <td
                      style={{
                        paddingTop: "4px",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                      }}
                    >
                      PAYMENT GRAND TOTAL
                    </td>
                    <td
                      style={{
                        paddingTop: "4px",
                        padding: "4px 5px 0",
                        fontWeight: "bold",
                      }}
                    >
                      :
                    </td>
                    <td
                      style={{
                        paddingTop: "4px",
                        fontWeight: "bold",
                        color: "#145a14",
                      }}
                    >
                      Rp. {fmt(grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>

            {/* Kolom 3 — Alamat Kirim */}
            <td
              style={{
                width: "33%",
                padding: "10px 12px",
                verticalAlign: "top",
                border: S.borderBlack,
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  textDecoration: "underline",
                  marginBottom: "5px",
                  fontSize: "10.5px",
                }}
              >
                Alamat Kirim :
              </div>
              <div style={{ color: "#333", lineHeight: "1.7" }}>
                <div style={{ fontWeight: "bold" }}>{tokoNama}</div>
                <div>{tokoAlamat}</div>
                <div>{tokoKota}</div>
                {toko?.kodePos && <div>{toko.kodePos}</div>}
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ════════════════════════════════════════════════════
          TABEL ITEM
      ════════════════════════════════════════════════════ */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "0",
          fontSize: "10px",
        }}
      >
        <thead>
          <tr>
            <th style={thCell({ width: "28px" })}>NO.</th>
            <th style={thCell({ width: "72px" })}>DATE ORDER</th>
            <th style={thCell({ width: "56px" })}>QTY</th>
            <th style={thCell()}>ITEM</th>
            <th style={thCell({ width: "68px" })}>VARIAN</th>
            <th style={thCell({ width: "84px" })}>UNIT PRICE</th>
            <th style={thCell({ width: "90px" })}>LINE TOTAL</th>
            <th style={thCell({ width: "74px" })}>
              DATE
              <br />
              PAYMENT NET
            </th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, idx) => {
            const qty = item.jumlahDisetujui ?? item.jumlahPermintaan;
            const lineTotal = qty * (item.hargaGudang || 0);

            return (
              <tr key={item.id}>
                <td style={tdCell({ textAlign: "center" })}>{idx + 1}</td>
                <td
                  style={tdCell({ textAlign: "center", whiteSpace: "nowrap" })}
                >
                  {fmtDate(data.createdAt)}
                </td>
                <td style={tdCell({ textAlign: "center" })}>
                  {qty.toLocaleString("id-ID")}&nbsp;{item.satuan}
                </td>
                <td style={tdCell({ textAlign: "left" })}>{item.namaProduk}</td>
                <td
                  style={tdCell({
                    textAlign: "center",
                    fontStyle: "italic",
                    color: "#333",
                  })}
                >
                  {item.varianProduk
                    ? item.varianProduk
                    : extractVarian(item.namaProduk)}
                </td>
                <td style={tdCell({ textAlign: "right" })}>
                  <span style={{ marginRight: "2px", color: "#555" }}>Rp</span>
                  <span>&nbsp;{fmt(item.hargaGudang || 0)}</span>
                </td>
                <td style={tdCell({ textAlign: "right" })}>
                  <span style={{ marginRight: "2px", color: "#555" }}>Rp</span>
                  <span>&nbsp;{fmt(lineTotal)}</span>
                </td>
                <td
                  style={tdCell({ textAlign: "center", whiteSpace: "nowrap" })}
                >
                  {tglPayment}
                </td>
              </tr>
            );
          })}

          {/* Padding rows */}
          {Array.from({ length: emptyRows }).map((_, i) => (
            <tr key={`blank-${i}`} style={{ height: "22px" }}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => (
                <td key={j} style={tdCell()} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ════════════════════════════════════════════════════
          TOTAL ROW
      ════════════════════════════════════════════════════ */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "0",
          fontSize: "10.5px",
        }}
      >
        <tbody>
          <tr
            style={{
              borderTop: "2.5px solid #111",
              borderBottom: "1px dashed #888",
            }}
          >
            {/* TOTAL KG */}
            <td
              style={{ padding: "5px 8px", fontWeight: "bold", width: "50%" }}
            >
              TOTAL&nbsp;&nbsp;&nbsp;
              <span style={{ fontWeight: "normal" }}>
                {totalSatuan.toLocaleString("id-ID")} kg
              </span>
            </td>
            {/* Spacer cols to align with table */}
            <td
              style={{
                padding: "5px 6px",
                textAlign: "right",
                fontWeight: "bold",
                width: "18%",
              }}
            >
              TOTAL
            </td>
            <td style={{ padding: "5px 4px", width: "8%", color: "#555" }}>
              Rp
            </td>
            <td
              style={{
                padding: "5px 8px 5px 0",
                textAlign: "right",
                width: "24%",
              }}
            >
              {fmt(grandTotal)}
            </td>
          </tr>
          <tr style={{ borderBottom: "1px dashed #888" }}>
            <td style={{ padding: "4px 8px" }} />
            <td
              style={{ padding: "4px 6px", textAlign: "right", color: "#555" }}
            >
              Ppn/Pph
            </td>
            <td style={{ padding: "4px 4px", color: "#555" }}>Rp</td>
            <td
              style={{
                padding: "4px 8px 4px 0",
                textAlign: "right",
                color: "#555",
              }}
            >
              &nbsp;-
            </td>
          </tr>
          <tr
            style={{
              borderTop: "2px solid #111",
              borderBottom: "2.5px solid #111",
            }}
          >
            <td style={{ padding: "5px 8px" }} />
            <td
              style={{
                padding: "5px 6px",
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              GRAND TOTAL
            </td>
            <td style={{ padding: "5px 4px", fontWeight: "bold" }}>Rp</td>
            <td
              style={{
                padding: "5px 8px 5px 0",
                textAlign: "right",
                fontWeight: "bold",
                color: "#145a14",
                fontSize: "11px",
              }}
            >
              {fmt(grandTotal)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ════════════════════════════════════════════════════
          TERBILANG
      ════════════════════════════════════════════════════ */}
      <div
        style={{
          borderBottom: "1px solid #bbb",
          padding: "6px 0 5px",
          marginBottom: "22px",
          display: "flex",
          gap: "8px",
          fontSize: "10px",
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
          Terbilang :
        </span>
        <span style={{ fontStyle: "italic", color: "#222" }}>
          {rupiahTerbilang(grandTotal)}
        </span>
      </div>

      {/* ════════════════════════════════════════════════════
          FOOTER  —  Info pembayaran · TTD
      ════════════════════════════════════════════════════ */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        {/* Kiri — Payment Info */}
        <div style={{ fontSize: "10px", width: "33%" }}>
          <div
            style={{
              fontWeight: "bold",
              textDecoration: "underline",
              marginBottom: "6px",
              fontSize: "10.5px",
            }}
          >
            Payment Information :
          </div>
          <div style={{ lineHeight: "1.8", color: "#222" }}>
            <div style={{ fontWeight: "bold" }}>BANK TRANSFER BCA :</div>
            <div>{gudangNamaBase} : 183-1938761</div>
          </div>
        </div>

        {/* Tengah — TTD Penerima */}
        <div style={{ textAlign: "center", width: "33%" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              color: "#1a3a8f",
              marginBottom: "6px",
            }}
          >
            {tokoNama.split("(")[0].trim()}
          </div>
          <div
            style={{
              position: "relative",
              width: "170px",
              height: "72px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "14px",
                right: "14px",
                borderBottom: "1.5px solid #555",
              }}
            />
          </div>
          <div
            style={{ marginTop: "6px", fontSize: "10px", fontWeight: "bold" }}
          >
            {namaPenerima}
          </div>
          <div style={{ fontSize: "9.5px", color: "#555" }}>
            Penerima Barang
          </div>
        </div>

        {/* Kanan — TTD Gudang */}
        <div style={{ textAlign: "center", width: "33%" }}>
          {/* Nama perusahaan di atas */}
          <div
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              color: "#1a3a8f",
              marginBottom: "6px",
            }}
          >
            {gudangNamaBase}
          </div>

          {/* Box tanda tangan + stempel */}
          <div
            style={{
              position: "relative",
              width: "170px",
              height: "72px",
              margin: "0 auto",
            }}
          >
            {/* Stempel lingkaran (dekoratif, semi-transparan) */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                border: "2.5px solid #b8940d",
                opacity: 0.45,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#7a5c00",
                fontSize: "6px",
                fontWeight: "bold",
                textAlign: "center",
                lineHeight: "1.25",
              }}
            >
              <span>
                AGRO
                <br />
                JABAR
              </span>
            </div>
            {/* Garis tanda tangan */}
            <div
              style={{
                position: "absolute",
                bottom: "12px",
                left: "14px",
                right: "14px",
                borderBottom: "1.5px solid #555",
              }}
            />
          </div>

          {/* Nama jabatan */}
          <div
            style={{ marginTop: "6px", fontSize: "10px", fontWeight: "bold" }}
          >
            Kepala Gudang
          </div>
          <div style={{ fontSize: "9.5px", color: "#555" }}>
            Keuangan dan Operasional
          </div>

          {/* Nama perusahaan bawah */}
          <div
            style={{
              marginTop: "5px",
              fontSize: "9px",
              fontWeight: "bold",
              color: "#1a3a8f",
              lineHeight: "1.4",
            }}
          >
            {gudangNamaBase}
            {gudangNamaSuffix && (
              <>
                <br />
                {gudangNamaSuffix}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          FOOTER KECIL — ID & Tanggal cetak
      ════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "48px",
          right: "48px",
          borderTop: "1px solid #e0e0e0",
          paddingTop: "5px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "7.5px",
          color: "#aaa",
          letterSpacing: "0.2px",
        }}
      >
        <span>No. Referensi: {data.id}</span>
        <span>
          Dicetak:{" "}
          {new Date().toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </div>
    </div>
  );
});

InvoicePengajuanStok.displayName = "InvoicePengajuanStok";

export default InvoicePengajuanStok;
