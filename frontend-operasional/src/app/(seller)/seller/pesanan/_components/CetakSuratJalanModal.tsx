"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Printer, FileText, Loader2, Truck } from "lucide-react";
import toast from "react-hot-toast";

import { formatTanggal } from "@/lib/ecommerce-api";

interface StoreInfo {
  name?: string;
  nama?: string;
  alamat?: string;
  phone?: string;
  telepon?: string;
  noTelepon?: string;
  kurirStaffs?: any[];
  courierStaff?: any;
  penjual?: any;
}

interface OrderItemData {
  id: string;
  status: string;
  totalHarga: number | string;
  metodeBayar?: string;
  alamatKirim?: string;
  catatan?: string;
  createdAt: string;
  isGrosir?: boolean;
  penerima?: string;
  customer?: { name?: string; email?: string; phone?: string };
  shipping?: {
    kurirName?: string;
    kurirPhone?: string;
    status?: string;
  };
  items?: Array<{
    id?: string;
    jumlah: number | string;
    harga?: number | string;
    grade?: string;
    product?: {
      nama?: string;
      namaEtalase?: string;
      satuan?: string;
    };
    produk?: {
      nama?: string;
      namaEtalase?: string;
      satuan?: string;
    };
  }>;
  item?: Array<{
    id?: string;
    jumlah: number | string;
    harga?: number | string;
    grade?: string;
    produk?: {
      nama?: string;
      namaEtalase?: string;
      satuan?: string;
    };
  }>;
}

interface CetakSuratJalanModalProps {
  order: OrderItemData | null;
  storeInfo?: StoreInfo | null;
  onClose: () => void;
}

function getStoreName(s?: StoreInfo | null) {
  return s?.name || s?.nama || "Agro Jabar Store";
}

function getStoreAddress(s?: StoreInfo | null) {
  return s?.alamat || "Jawa Barat, Indonesia";
}

function getStorePhone(s?: StoreInfo | null) {
  return s?.phone || s?.telepon || s?.noTelepon || "-";
}

export const SuratJalanDocument = React.forwardRef<
  HTMLDivElement,
  {
    order: OrderItemData;
    storeInfo?: StoreInfo | null;
    courierName?: string;
    courierPhone?: string;
  }
>(
  (
    {
      order,
      storeInfo,
      courierName: propCourierName,
      courierPhone: propCourierPhone,
    },
    ref,
  ) => {
    const customerName =
      order.penerima ||
      order.customer?.name ||
      order.customer?.email ||
      "Pembeli";

    const customerPhone =
      order.customer?.phone ||
      (order as any).customerPhone ||
      (order as any).noTelepon ||
      "-";

    const shortId = String(
      order.id ||
        (order as any).id_pesanan ||
        (order as any).id_pesananEcom ||
        "",
    )
      .slice(0, 8)
      .toUpperCase();
    const dateStr = new Date(order.createdAt)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");
    const noSuratJalan = `SJ/${dateStr}/${shortId}`;

    const itemList = order.items || order.item || [];
    const assignedCourierName =
      order.shipping?.kurirName ||
      (order as any).pengiriman?.kurirNama ||
      (order as any).kurirName;
    const assignedCourierPhone =
      order.shipping?.kurirPhone ||
      (order as any).pengiriman?.kurirTelepon ||
      (order as any).kurirPhone;

    const courierName =
      propCourierName || assignedCourierName || "Kurir Pengantar";
    const courierPhone = propCourierPhone || assignedCourierPhone || "-";

    return (
      <div
        ref={ref}
        style={{
          width: "210mm",
          minHeight: "148mm",
          padding: "15mm 20mm",
          backgroundColor: "#ffffff",
          color: "#1e293b",
          fontFamily: "'Inter', Arial, sans-serif",
          fontSize: "11px",
          lineHeight: "1.5",
          boxSizing: "border-box",
        }}
      >
        {/* Header Kop */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "2px solid #059669",
            paddingBottom: "12px",
            marginBottom: "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#059669",
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              AGRO JABAR E-COMMERCE
            </h1>
            <p
              style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0" }}
            >
              {getStoreName(storeInfo)}
            </p>
            <p
              style={{ fontSize: "10px", color: "#94a3b8", margin: "1px 0 0" }}
            >
              {getStoreAddress(storeInfo)} • Telp: {getStorePhone(storeInfo)}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: "0.5px",
              }}
            >
              SURAT JALAN
            </h2>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                fontFamily: "monospace",
                color: "#059669",
                margin: "2px 0 0",
              }}
            >
              {noSuratJalan}
            </p>
            <p
              style={{ fontSize: "10px", color: "#64748b", margin: "1px 0 0" }}
            >
              Tgl: {formatTanggal(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Info Pengirim & Penerima */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "16px",
            backgroundColor: "#f8fafc",
            padding: "12px 14px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "9px",
                fontWeight: 700,
                color: "#059669",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Penerima / Alamat Pengiriman
            </p>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#0f172a",
                margin: "0 0 2px",
              }}
            >
              {customerName}
            </p>
            <p
              style={{ fontSize: "10px", color: "#475569", margin: "0 0 2px" }}
            >
              Telp / WA: <strong>{customerPhone}</strong>
            </p>
            <p
              style={{
                fontSize: "10px",
                color: "#475569",
                margin: 0,
                lineHeight: "1.4",
              }}
            >
              {order.alamatKirim || "-"}
            </p>
          </div>

          <div>
            <p
              style={{
                fontSize: "9px",
                fontWeight: 700,
                color: "#059669",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Info Kurir & Pengiriman
            </p>
            <p
              style={{ fontSize: "10px", color: "#475569", margin: "0 0 2px" }}
            >
              Kurir: <strong>{courierName}</strong> ({courierPhone})
            </p>
            <p
              style={{ fontSize: "10px", color: "#475569", margin: "0 0 2px" }}
            >
              Tipe Pesanan:{" "}
              <strong>
                {order.isGrosir ? "PEMBELIAN GROSIR" : "PEMBELIAN ECERAN"}
              </strong>
            </p>
            {order.metodeBayar && (
              <p style={{ fontSize: "10px", color: "#475569", margin: 0 }}>
                Pembayaran: <strong>{order.metodeBayar}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Tabel Barang */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
            fontSize: "10px",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#059669",
                color: "#ffffff",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "8px 10px", width: "30px" }}>No</th>
              <th style={{ padding: "8px 10px" }}>Nama Produk / Komoditas</th>
              <th style={{ padding: "8px 10px", width: "80px" }}>Grade</th>
              <th
                style={{
                  padding: "8px 10px",
                  width: "100px",
                  textAlign: "right",
                }}
              >
                Jumlah
              </th>
              <th style={{ padding: "8px 10px", width: "120px" }}>
                Keterangan
              </th>
            </tr>
          </thead>
          <tbody>
            {itemList.map((it: any, index: number) => {
              const prodName =
                it.product?.namaEtalase ||
                it.product?.nama ||
                it.produk?.namaEtalase ||
                it.produk?.nama ||
                "Produk Tani";
              const satuan =
                it.product?.satuan ||
                it.produk?.satuan ||
                (order.isGrosir ? "kg" : "item");
              return (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                  }}
                >
                  <td style={{ padding: "8px 10px" }}>{index + 1}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 600 }}>
                    {prodName}
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    {it.grade ? `Grade ${it.grade}` : "-"}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    {it.jumlah} {satuan}
                  </td>
                  <td style={{ padding: "8px 10px", color: "#64748b" }}>
                    {order.isGrosir ? "Grosir Tani" : "Ecom Agrojabar"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {order.catatan && (
          <div
            style={{
              marginBottom: "20px",
              padding: "8px 12px",
              backgroundColor: "#fffbeb",
              border: "1px solid #fef3c7",
              borderRadius: "6px",
              fontSize: "10px",
              color: "#92400e",
            }}
          >
            <strong>Catatan Pesanan:</strong> {order.catatan}
          </div>
        )}

        {/* Tanda Tangan 3 Pihak */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
            textAlign: "center",
            marginTop: "40px",
          }}
        >
          <div>
            <p
              style={{ fontSize: "10px", color: "#64748b", margin: "0 0 50px" }}
            >
              Pengirim (Seller)
            </p>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                borderTop: "1px solid #cbd5e1",
                paddingTop: "4px",
                margin: 0,
              }}
            >
              ( {getStoreName(storeInfo)} )
            </p>
          </div>

          <div>
            <p
              style={{ fontSize: "10px", color: "#64748b", margin: "0 0 50px" }}
            >
              Kurir Pengantar
            </p>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                borderTop: "1px solid #cbd5e1",
                paddingTop: "4px",
                margin: 0,
              }}
            >
              ( {courierName} )
            </p>
          </div>

          <div>
            <p
              style={{ fontSize: "10px", color: "#64748b", margin: "0 0 50px" }}
            >
              Penerima Barang
            </p>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 700,
                borderTop: "1px solid #cbd5e1",
                paddingTop: "4px",
                margin: 0,
              }}
            >
              ( {customerName} )
            </p>
          </div>
        </div>
      </div>
    );
  },
);
SuratJalanDocument.displayName = "SuratJalanDocument";

interface CourierStaff {
  id?: string;
  nama?: string;
  name?: string;
  noTelepon?: string;
  phoneNumber?: string;
  email?: string;
}

function getStoreCouriers(storeInfo?: any): CourierStaff[] {
  if (!storeInfo) return [];
  if (
    Array.isArray(storeInfo.kurirStaffs) &&
    storeInfo.kurirStaffs.length > 0
  ) {
    return storeInfo.kurirStaffs;
  }
  if (storeInfo.courierStaff) {
    return [storeInfo.courierStaff];
  }
  if (storeInfo.penjual?.kurir) {
    return [storeInfo.penjual.kurir];
  }
  return [];
}

const CetakSuratJalanModal: React.FC<CetakSuratJalanModalProps> = ({
  order,
  storeInfo,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const couriers = getStoreCouriers(storeInfo);

  const assignedCourierName =
    order?.shipping?.kurirName ||
    (order as any)?.pengiriman?.kurirNama ||
    (order as any)?.kurirName ||
    "";
  const assignedCourierPhone =
    order?.shipping?.kurirPhone ||
    (order as any)?.pengiriman?.kurirTelepon ||
    (order as any)?.kurirPhone ||
    "";

  const [selectedCourierId, setSelectedCourierId] = useState<string>("");
  const [selectedCourierName, setSelectedCourierName] = useState<string>("");
  const [selectedCourierPhone, setSelectedCourierPhone] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (assignedCourierName) {
      setSelectedCourierName(assignedCourierName);
      setSelectedCourierPhone(assignedCourierPhone);
    } else if (couriers.length === 1) {
      // Automatic selection when store has only 1 courier
      const single = couriers[0];
      const name = single.nama || single.name || "Kurir Toko";
      const phone = single.noTelepon || single.phoneNumber || "-";
      setSelectedCourierName(name);
      setSelectedCourierPhone(phone);
      if (single.id) setSelectedCourierId(single.id);
    } else if (couriers.length > 1) {
      // Must select courier if not previously assigned
      if (!selectedCourierName) {
        setSelectedCourierId("");
        setSelectedCourierName("");
        setSelectedCourierPhone("");
      }
    } else if (couriers.length === 0 && !assignedCourierName) {
      setSelectedCourierName("Kurir Toko");
      setSelectedCourierPhone("-");
    }
  }, [order, storeInfo]);

  const handlePrint = useCallback(() => {
    if (couriers.length > 1 && !selectedCourierName && !assignedCourierName) {
      toast.error("Silakan pilih kurir pengantar terlebih dahulu.");
      return;
    }
    if (!documentRef.current) return;
    const content = documentRef.current.outerHTML;
    const pw = window.open("", "_blank", "width=800,height=600");
    if (!pw) {
      alert("Popup diblokir browser. Izinkan popup untuk halaman ini.");
      return;
    }
    // eslint-disable-next-line no-unsanitized/method
    pw.document.write(
      `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<title>Surat Jalan #${String(
        order?.id ||
          (order as any)?.id_pesanan ||
          (order as any)?.id_pesananEcom ||
          "",
      )
        .slice(0, 8)
        .toUpperCase()}</title>
<style>
  @page { size: A5 landscape; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 210mm;
    font-family: 'Inter', Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
</style>
</head>
<body>${content}</body>
</html>`,
    );
    pw.document.close();
    pw.focus();
    setTimeout(() => {
      pw.print();
      pw.close();
    }, 500);
  }, [order, couriers.length, selectedCourierName, assignedCourierName]);

  if (!mounted || !order) return null;

  const isCourierSelectionRequired =
    couriers.length > 1 && !assignedCourierName && !selectedCourierName;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999]"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Tutup"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 my-4">
          {/* Header minimalis */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <FileText size={18} className="text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Surat Jalan / Delivery Note
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  #
                  {String(
                    order.id ||
                      (order as any).id_pesanan ||
                      (order as any).id_pesananEcom ||
                      "",
                  )
                    .slice(0, 8)
                    .toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Courier Selection Bar if store has multiple couriers */}
            {couriers.length > 1 && !assignedCourierName && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
                    <Truck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900">
                      Pilih Kurir Pengantar
                    </p>
                    <p className="text-[11px] text-amber-700/90 leading-tight">
                      Toko Anda memiliki {couriers.length} kurir. Wajib memilih
                      kurir penanggung jawab sebelum mencetak Surat Jalan.
                    </p>
                  </div>
                </div>
                <select
                  value={selectedCourierId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCourierId(val);
                    const found = couriers.find(
                      (c) => (c.id || c.nama || c.name) === val,
                    );
                    if (found) {
                      setSelectedCourierName(found.nama || found.name || "");
                      setSelectedCourierPhone(
                        found.noTelepon || found.phoneNumber || "-",
                      );
                    } else {
                      setSelectedCourierName("");
                      setSelectedCourierPhone("");
                    }
                  }}
                  className="bg-white border border-amber-300 text-slate-800 text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none min-w-[220px]"
                >
                  <option value="">-- Pilih Kurir Pengantar --</option>
                  {couriers.map((c, idx) => (
                    <option
                      key={c.id || idx}
                      value={c.id || c.nama || c.name || idx}
                    >
                      {c.nama || c.name}{" "}
                      {c.noTelepon || c.phoneNumber
                        ? `(${c.noTelepon || c.phoneNumber})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Courier info badge if auto-selected from 1 courier */}
            {couriers.length === 1 && !assignedCourierName && (
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3 px-4 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2.5">
                  <Truck size={16} className="text-emerald-600 shrink-0" />
                  <span>
                    Kurir Pengantar:{" "}
                    <strong className="font-semibold">
                      {selectedCourierName}
                    </strong>{" "}
                    ({selectedCourierPhone})
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-100/70 font-semibold px-2.5 py-1 rounded-lg">
                  Otomatis (1 Kurir Toko)
                </span>
              </div>
            )}

            {/* Preview Surat Jalan */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex justify-center bg-slate-50 p-4">
              <div className="bg-white border border-slate-200 shadow-md transform scale-[0.85] origin-top">
                <SuratJalanDocument
                  ref={documentRef}
                  order={order}
                  storeInfo={storeInfo}
                  courierName={selectedCourierName}
                  courierPhone={selectedCourierPhone}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              {isCourierSelectionRequired ? (
                <p className="text-xs text-amber-600 font-medium flex items-center gap-1.5">
                  ⚠️ Silakan pilih kurir terlebih dahulu di atas.
                </p>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  disabled={isCourierSelectionRequired}
                  onClick={handlePrint}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]"
                >
                  <Printer size={16} /> Cetak / Download Surat Jalan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default CetakSuratJalanModal;
