"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";

import { ordersApi } from "@/lib/api/orders";
import { formatTanggal } from "@/lib/api/helpers";

import { OrderItem } from "../../pesanan/_hooks/useSellerOrders";

export default function CetakResiPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const res = await ordersApi.getById(id);
        let data = res?.data?.data || res?.data;
        if (data) {
          data = {
            ...data,
            customer: data.customer || {
              name: data.konsumen?.nama,
              email: data.konsumen?.email,
              phone:
                data.konsumen?.noTelepon ||
                data.konsumen?.addresses?.[0]?.telepon,
            },
            items: (data.items || data.item || []).map((it: any) => ({
              ...it,
              product: it.product || it.produk,
            })),
          };
        }
        setOrder(data);

        // Generate QR
        const base =
          typeof window !== "undefined"
            ? `${window.location.protocol}//${window.location.hostname}:3000`
            : "http://localhost:3000";
        const url = `${base}/pesanan/${id}?konfirmasi=1`;
        const qr = await QRCode.toDataURL(url, { width: 200, margin: 1 });
        setQrDataUrl(qr);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    // Otomatis print jika data sudah selesai diload
    if (!loading && order) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, order]);

  if (loading) {
    return (
      <div style={{ padding: 20, fontFamily: "sans-serif" }}>
        Memuat data resi...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: 20, fontFamily: "sans-serif" }}>
        Pesanan tidak ditemukan.
      </div>
    );
  }

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
  const shortId = order.id.slice(0, 8).toUpperCase();
  const itemSummary = order.items
    ?.slice(0, 2)
    .map(
      (it) =>
        `${it.product?.namaEtalase || it.product?.nama || "Produk"} · ${it.jumlah} ${it.product?.satuan || "kg"}`,
    )
    .join(", ");
  const itemCount = order.items?.length || 0;

  // Style untuk resi printer thermal 100mm
  const S: React.CSSProperties = {
    width: "100mm",
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: "8pt",
    color: "#000",
    background: "#fff",
    margin: "0 auto",
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @page { size: 100mm auto; margin: 0; }
        body { margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; color-adjust: exact; }
        @media screen { body { background: #f0f0f0; padding: 20px; } .label-container { box-shadow: 0 0 10px rgba(0,0,0,0.1); } }
      `,
        }}
      />
      <div className="label-container" style={S}>
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

        <div style={{ display: "flex", borderBottom: "1px dashed #000" }}>
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
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="QR"
                style={{ width: "62px", height: "62px", display: "block" }}
              />
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
          <div style={{ flex: 1, padding: "8px 8px 6px 8px" }}>
            <div
              style={{
                fontSize: "5pt",
                letterSpacing: "1.5px",
                color: "#555",
                marginBottom: "2px",
                textTransform: "uppercase",
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
                wordBreak: "break-word",
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
                wordBreak: "break-word",
              }}
            >
              {order.alamatKirim || "-"}
            </div>
          </div>
        </div>

        <div style={{ padding: "5px 8px", borderBottom: "1px dashed #000" }}>
          <div
            style={{
              fontSize: "5pt",
              letterSpacing: "1.5px",
              color: "#555",
              marginBottom: "2px",
              textTransform: "uppercase",
            }}
          >
            PENGIRIM
          </div>
          <div style={{ fontSize: "8pt", fontWeight: 700 }}>Agro Jabar</div>
        </div>

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
                textTransform: "uppercase",
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
                textTransform: "uppercase",
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
    </>
  );
}
