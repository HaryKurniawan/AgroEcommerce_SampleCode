"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Package,
  Truck,
  Clock,
  CheckCircle2,
  ShoppingBag,
  CreditCard,
  ClipboardCheck,
  PackageCheck,
  Star,
  ChevronDown,
  ChevronUp,
  BadgePercent,
  Boxes,
  HandshakeIcon,
} from "lucide-react";

const STATUS_FLOW = [
  {
    icon: ShoppingBag,
    status: "1. Menunggu Konfirmasi Penjual",
    desc: "Pengajuan grosirmu sudah dikirim. Penjual akan meninjau ketersediaan kuota dan harga.",
    detail: "Estimasi waktu konfirmasi: 1×24 jam kerja.",
  },
  {
    icon: CreditCard,
    status: "2. Menunggu Pembayaran",
    desc: "Penjual telah menyetujui pengajuanmu. Lakukan pembayaran sesuai nominal grosir.",
    detail: "Bayar sebelum batas waktu agar pesanan tidak kedaluwarsa.",
  },
  {
    icon: ClipboardCheck,
    status: "3. Diproses & Dikemas",
    desc: "Pembayaran terverifikasi. Penjual sedang menyiapkan dan mengemas produk grosirmu.",
    detail: "Proses sortasi dan pemeriksaan kualitas produk.",
  },
  {
    icon: Truck,
    status: "4. Pengiriman Kurir",
    desc: "Produkmu sedang dalam perjalanan dikirim langsung oleh armada kurir toko.",
    detail: "Pantau pengiriman real-time melalui halaman detail pesanan.",
  },
  {
    icon: PackageCheck,
    status: "5. Pesanan Diterima",
    desc: "Produk grosir telah tiba di alamat tujuan dan dikonfirmasi selesai.",
    detail: "Periksa kelengkapan dan kondisi fisik barang saat diterima.",
  },
  {
    icon: Star,
    status: "6. Beri Ulasan & Rating",
    desc: "Bagikan pengalamanmu berbelanja grosir untuk mendukung toko petani.",
    detail: "Ulasan positif membantu reputasi toko petani lokal.",
  },
];

const KEUNTUNGAN_LIST = [
  {
    icon: BadgePercent,
    title: "Diskon Harga Grosir",
    desc: "Potongan harga khusus bertingkat yang lebih murah dibanding harga eceran.",
  },
  {
    icon: Boxes,
    title: "Variasi Ukuran Kemasan",
    desc: "Bebas memilih pecahan kemasan (1 kg, 2 kg, 5 kg, 10 kg) sesuai kebutuhan bisnis.",
  },
  {
    icon: HandshakeIcon,
    title: "Langsung dari Toko Tani",
    desc: "Transaksi transparan tanpa perantara untuk jaminan kesegaran maksimal.",
  },
  {
    icon: Truck,
    title: "Gratis / Hemat Ongkir",
    desc: "Bebas biaya kirim untuk pemesanan minimal 300 kg ke wilayah terjangkau.",
  },
  {
    icon: Clock,
    title: "Pengiriman Terjadwal",
    desc: "Koordinasi langsung dengan penjual mengenai estimasi dan jadwal tiba.",
  },
  {
    icon: Package,
    title: "Jaminan Kualifikasi Produk",
    desc: "Setiap barang melalui pemeriksaan standar kesegaran sebelum dikirim.",
  },
];

const LANGKAH_PEMESANAN = [
  {
    step: 1,
    title: "Tentukan Kuantitas Pesanan",
    desc: "Masukkan jumlah kebutuhan grosir Anda (minimal 100 kg atau disesuaikan dengan kuota stok).",
  },
  {
    step: 2,
    title: "Atur Spesifikasi Kemasan",
    desc: "Pilih rincian ukuran kemasan pembungkus (1 kg, 2 kg, 5 kg, atau 10 kg).",
  },
  {
    step: 3,
    title: "Lengkapi Alamat Pengiriman",
    desc: "Tentukan lokasi pengiriman dan sertakan catatan khusus jika diperlukan.",
  },
  {
    step: 4,
    title: "Pilih Metode Pembayaran",
    desc: "Tinjau estimasi rincian harga, ongkir, serta diskon grosir sebelum mengirim pengajuan.",
  },
  {
    step: 5,
    title: "Kirim Pengajuan ke Penjual",
    desc: "Kirim pengajuan dan tunggu konfirmasi penjual untuk melanjutkan ke pembayaran.",
  },
];

const FAQS = [
  {
    q: "Berapa minimum pemesanan grosiran?",
    a: "Minimum pemesanan grosir standar adalah 100 kg. Namun jika pesanan melebihi stok yang tersedia saat ini, sistem akan otomatis menyesuaikan ke batas stok + 1 kg (sistem Pre-Order / Booking).",
  },
  {
    q: "Bagaimana cara memilih ukuran kemasan?",
    a: "Pada Tahap 2 pemesanan, Anda bisa menentukan pecahan ukuran plastik/kemasan (misal 5 kg atau 10 kg). Sistem akan otomatis menghitung total bungkus yang dibutuhkan.",
  },
  {
    q: "Kapan diskon grosir mulai berlaku?",
    a: "Diskon potongan harga grosir langsung terpotong pada subtotal pesanan begitu kuantitas memenuhi syarat minimal grosir.",
  },
  {
    q: "Apakah syarat Gratis Ongkir berlaku otomatis?",
    a: "Ya, promo Gratis Ongkir berlaku otomatis jika total pesanan Anda mencapai 300 kg atau lebih.",
  },
  {
    q: "Bagaimana jika pesanan dimasukkan sebagai Pre-Order?",
    a: "Jika pesanan melebihi stok toko, sisa kuantitas akan diproses secara Pre-Order. Penjual akan mengonfirmasi estimasi tanggal panen/stok siap kirim.",
  },
];

export default function GrosirKeuntunganPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<"keuntungan" | "langkah" | "alur">(
    "keuntungan",
  );
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const TABS = [
    { id: "keuntungan", label: "Keuntungan" },
    { id: "langkah", label: "Cara Pesan" },
    { id: "alur", label: "Alur Status" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/70 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.push(`/produk/${id}/grosir`)}
          className="p-2 hover:bg-gray-100 rounded-xl transition-all active:scale-95 text-gray-700"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-semibold text-sm text-gray-900 text-center flex-1">
          Panduan Pembelian Grosir
        </h1>
        <div className="w-8" />
      </div>

      <div className="max-w-xl mx-auto px-4 py-5 space-y-5">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-primary-600 to-emerald-700 rounded-3xl p-6 text-white shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-3">
            <Sparkles size={20} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold relative z-10 tracking-tight">
            Mengapa Belanja Grosir di Agro?
          </h2>
          <p className="text-emerald-100/90 text-xs mt-1 relative z-10 leading-relaxed font-normal">
            Solusi pasokan kuota besar dengan harga spesial dan jaminan mutu
            langsung dari toko petani pilihan.
          </p>
        </div>

        {/* 3 Segmented Tabs */}
        <div className="bg-gray-200/70 p-1 rounded-2xl flex gap-1 border border-gray-200/80">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-primary-700 shadow-xs"
                  : "text-gray-500 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Keuntungan Pembelian Grosir */}
        {activeTab === "keuntungan" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                Keuntungan Pembelian Grosir
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {KEUNTUNGAN_LIST.map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-4 flex gap-3 border border-gray-200/70 shadow-xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-100/60 mt-0.5">
                    <item.icon size={17} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-gray-900">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Langkah Pemesanan Grosir */}
        {activeTab === "langkah" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="mb-1">
              <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                Langkah Pemesanan Grosir
              </h3>
              <p className="text-xs text-gray-500 font-normal">
                Alur praktis mengajukan pesanan grosir dalam 5 langkah mudah
              </p>
            </div>

            <div className="space-y-2.5">
              {LANGKAH_PEMESANAN.map((s) => (
                <div
                  key={s.step}
                  className="flex gap-3 bg-white rounded-2xl p-3.5 border border-gray-200/70 shadow-xs items-start"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5 shadow-xs">
                    {s.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-gray-900">
                      {s.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed font-normal">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Alur Status Pengajuan */}
        {activeTab === "alur" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="mb-1">
              <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                Alur Status Pengajuan
              </h3>
              <p className="text-xs text-gray-500 font-normal">
                Tahapan proses transaksi grosir dari pengajuan hingga pesanan
                selesai
              </p>
            </div>

            <div className="relative pl-2">
              <div className="absolute left-[21px] top-3 bottom-3 w-0.5 bg-gray-200" />

              <div className="space-y-3">
                {STATUS_FLOW.map((s, idx) => (
                  <div key={idx} className="flex gap-3.5 relative items-start">
                    <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center shrink-0 relative z-10 mt-1 shadow-xs">
                      <s.icon size={15} />
                    </div>
                    <div className="flex-1 bg-white rounded-2xl p-3.5 border border-gray-200/80 shadow-xs">
                      <h4 className="font-semibold text-xs text-gray-900">
                        {s.status}
                      </h4>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed font-normal">
                        {s.desc}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1 font-medium">
                        💡 {s.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAQ Accordion */}
        <div className="pt-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 tracking-tight">
            Pertanyaan Umum (FAQ)
          </h3>
          <div className="space-y-2">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-3.5 text-left hover:bg-gray-50/80 transition-colors"
                >
                  <span className="font-medium text-xs text-gray-800 pr-3">
                    {faq.q}
                  </span>
                  {openFaq === idx ? (
                    <ChevronUp
                      size={15}
                      className="text-primary-600 shrink-0"
                    />
                  ) : (
                    <ChevronDown size={15} className="text-gray-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-3.5 pb-3.5">
                    <p className="text-[11px] text-gray-500 leading-relaxed border-t border-gray-100 pt-2.5 font-normal">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="bg-primary-50/60 border border-primary-100 rounded-3xl p-6 text-center space-y-2">
          <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-primary-200/60">
            <CheckCircle2 size={22} />
          </div>
          <h3 className="font-semibold text-sm text-gray-900">
            Siap Mengajukan Pesanan Grosir?
          </h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto font-normal">
            Kembali ke produk dan tentukan kuantitas pesanan Anda sekarang.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push(`/produk/${id}/grosir`)}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium text-xs sm:text-sm shadow-sm hover:bg-primary-700 active:scale-[0.99] transition-all"
            >
              Kembali &amp; Pesan Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
