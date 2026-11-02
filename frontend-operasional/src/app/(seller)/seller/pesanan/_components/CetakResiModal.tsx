"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Printer, Loader2 } from "lucide-react";
import QRCode from "qrcode";

import { formatTanggal } from "@/lib/ecommerce-api";

import { OrderItem } from "../_hooks/useSellerOrders";

interface StoreInfo {
  name?: string;
  nama?: string;
  alamat?: string;
  phone?: string;
  telepon?: string;
  noTelepon?: string;
}

interface CetakResiModalProps {
  order: OrderItem | null;
  storeInfo?: StoreInfo | null;
  onClose: () => void;
}

function getStoreName(s?: StoreInfo | null) {
  return s?.name || s?.nama || "Agro Jabar";
}

// QR berisi URL konfirmasi penerimaan pesanan oleh pembeli
function buildConfirmURL(orderId: string): string {
  const base =
    typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.hostname}:3000`
      : "http://localhost:3000";
  return `${base}/pesanan/${orderId}?konfirmasi=1`;
}

// ─ Label Resi Thermal (hitam-putih) ─────────────────────────────────────────
interface ShippingLabelProps {
  order: OrderItem;
  storeInfo?: StoreInfo | null;
  qrDataUrl: string;
}

const ShippingLabel = React.forwardRef<HTMLDivElement, ShippingLabelProps>(
  ({ order, storeInfo, qrDataUrl }, ref) => {
    const customerName =
      order.penerima ||
      order.customer?.name ||
      order.customer?.email ||
      "Pembeli";
    const customerPhone =
      (order as any).customer?.phone ||
      (order as any).customerPhone ||
      (order as any).noTelepon ||
      null;
    const shortId = String(
      order.id ||
        (order as any).id_pesanan ||
        (order as any).id_pesananEcom ||
        "",
    )
      .slice(0, 8)
      .toUpperCase();
    const itemSummary = order.items
      ?.slice(0, 2)
      .map(
        (it) =>
          `${it.product?.namaEtalase || it.product?.nama || "Produk"} · ${it.jumlah} ${it.product?.satuan || "kg"}`,
      )
      .join(", ");
    const itemCount = order.items?.length || 0;

    const S: React.CSSProperties = {
      width: "100mm",
      fontFamily: "'Courier New', Courier, monospace",
      fontSize: "8pt",
      color: "#000",
      background: "#fff",
      border: "1px solid #000",
      pageBreakInside: "avoid",
    };

    return (
      <div ref={ref} style={S}>
        {/* ── Header minimalis ── */}
        <div
          style={{
            borderBottom: "1px solid #000",
            padding: "5px 8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: "10pt",
              letterSpacing: "-0.3px",
            }}
          >
            AGRO JABAR
          </div>
          <div
            style={{
              fontSize: "6pt",
              textAlign: "right",
              letterSpacing: "0.3px",
            }}
          >
            <div style={{ fontWeight: 700 }}>#{shortId}</div>
            <div style={{ color: "#555" }}>
              {formatTanggal(order.createdAt)}
            </div>
          </div>
        </div>

        {/* ── Body: QR kiri + Info kanan ── */}
        <div style={{ display: "flex", borderBottom: "1px dashed #000" }}>
          {/* QR Code */}
          <div
            style={{
              padding: "8px",
              borderRight: "1px dashed #000",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Konfirmasi"
                style={{ width: "62px", height: "62px", display: "block" }}
              />
            ) : (
              <div
                style={{
                  width: 62,
                  height: 62,
                  border: "1px solid #ccc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "6pt",
                  color: "#999",
                }}
              >
                QR
              </div>
            )}
            <div
              style={{
                fontSize: "5pt",
                textAlign: "center",
                marginTop: "3px",
                letterSpacing: "0.3px",
                color: "#333",
              }}
            >
              SCAN = KONFIRMASI
              <br />
              PENERIMAAN
            </div>
          </div>

          {/* Info Penerima */}
          <div style={{ flex: 1, padding: "8px 8px 6px 8px" }}>
            <div
              style={{
                fontSize: "5pt",
                letterSpacing: "1.5px",
                color: "#555",
                marginBottom: "2px",
                textTransform: "uppercase" as const,
              }}
            >
              PENERIMA
            </div>
            <div
              style={{
                fontSize: "11pt",
                fontWeight: 900,
                lineHeight: 1.1,
                marginBottom: "3px",
                wordBreak: "break-word" as const,
              }}
            >
              {customerName}
            </div>
            {customerPhone && (
              <div
                style={{
                  fontSize: "7.5pt",
                  fontWeight: 700,
                  marginBottom: "3px",
                }}
              >
                {customerPhone}
              </div>
            )}
            <div
              style={{
                fontSize: "6.5pt",
                lineHeight: 1.4,
                color: "#222",
                wordBreak: "break-word" as const,
              }}
            >
              {order.alamatKirim || "-"}
            </div>
          </div>
        </div>

        {/* ── Pengirim ── */}
        <div style={{ padding: "5px 8px", borderBottom: "1px dashed #000" }}>
          <div
            style={{
              fontSize: "5pt",
              letterSpacing: "1.5px",
              color: "#555",
              marginBottom: "2px",
              textTransform: "uppercase" as const,
            }}
          >
            PENGIRIM
          </div>
          <div style={{ fontSize: "8pt", fontWeight: 700 }}>
            {getStoreName(storeInfo)}
          </div>
        </div>

        {/* ── Isi & Total ── */}
        <div
          style={{
            padding: "5px 8px",
            borderBottom: "1px dashed #000",
            display: "flex",
            justifyContent: "space-between",
            gap: "6px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "5pt",
                letterSpacing: "1.5px",
                color: "#555",
                marginBottom: "2px",
                textTransform: "uppercase" as const,
              }}
            >
              ISI PAKET
            </div>
            <div style={{ fontSize: "6.5pt", lineHeight: 1.4 }}>
              {itemCount > 0 ? (
                <>
                  {itemSummary}
                  {itemCount > 2 && ` +${itemCount - 2} lainnya`}
                </>
              ) : (
                "Produk Pertanian"
              )}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              style={{
                fontSize: "5pt",
                letterSpacing: "1.5px",
                color: "#555",
                marginBottom: "2px",
                textTransform: "uppercase" as const,
              }}
            >
              TOTAL
            </div>
            <div style={{ fontSize: "9pt", fontWeight: 900 }}>
              Rp {Number(order.totalHarga || 0).toLocaleString("id-ID")}
            </div>
            {order.metodeBayar && (
              <div
                style={{ fontSize: "5.5pt", color: "#555", marginTop: "1px" }}
              >
                {order.metodeBayar}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: "4px 8px",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "5pt",
            color: "#666",
          }}
        >
          <span>
            Cetak:{" "}
            {new Date().toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
          <span>agrojabar.id</span>
        </div>
      </div>
    );
  },
);
ShippingLabel.displayName = "ShippingLabel";

// ─ Modal Utama ───────────────────────────────────────────────────────────────
const CetakResiModal: React.FC<CetakResiModalProps> = ({
  order,
  storeInfo,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!order) return;
    setGenerating(true);
    // QR berisi URL konfirmasi penerimaan agar saat di-scan pembeli, pesanan otomatis dikonfirmasi
    const url = buildConfirmURL(order.id);
    QRCode.toDataURL(url, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then(setQrDataUrl)
      .catch(console.error)
      .finally(() => setGenerating(false));
  }, [order]);

  const handlePrint = useCallback(() => {
    if (!labelRef.current) return;
    const content = labelRef.current.outerHTML;
    const pw = window.open("", "_blank", "width=500,height=400");
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
<title>Resi #${String(
        order?.id ||
          (order as any)?.id_pesanan ||
          (order as any)?.id_pesananEcom ||
          "",
      )
        .slice(0, 8)
        .toUpperCase()}</title>
<style>
  @page { size: 100mm auto; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 100mm;
    font-family: 'Courier New', Courier, monospace;
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
  }, [order]);

  if (!mounted || !order) return null;

  const customerName =
    order.penerima ||
    order.customer?.name ||
    order.customer?.email ||
    "Pembeli";

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
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 my-4">
          {/* Header minimalis */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Printer size={16} className="text-slate-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Cetak Resi
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
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
              <X size={15} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Info singkat */}
            <div className="text-[11px] text-slate-500 space-y-0.5">
              <div>
                <span className="text-slate-400">Penerima: </span>
                <span className="font-semibold text-slate-700">
                  {customerName}
                </span>
              </div>
              {order.alamatKirim && (
                <div className="truncate">
                  <span className="text-slate-400">Alamat: </span>
                  <span className="text-slate-600">{order.alamatKirim}</span>
                </div>
              )}
            </div>

            {/* Preview label resi */}
            <div>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-2">
                Preview · 100mm × auto (thermal)
              </p>
              <div className="flex justify-center">
                <div className="border border-slate-200 shadow-sm overflow-hidden">
                  {generating ? (
                    <div
                      style={{ width: 378, height: 180 }}
                      className="flex items-center justify-center bg-white"
                    >
                      <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                    </div>
                  ) : (
                    <ShippingLabel
                      ref={labelRef}
                      order={order}
                      storeInfo={storeInfo}
                      qrDataUrl={qrDataUrl}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Info QR */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-2.5 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                QR code mengarahkan pembeli ke halaman konfirmasi penerimaan
                pesanan. Tempel resi di paket.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all"
              >
                Tutup
              </button>
              <button
                onClick={handlePrint}
                disabled={generating}
                className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {generating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Printer size={14} />
                )}
                {generating ? "Menyiapkan…" : "Cetak Resi"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default CetakResiModal;
