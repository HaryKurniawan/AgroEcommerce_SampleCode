"use client";

import { useState } from "react";
import { Megaphone, Send, Users } from "lucide-react";
import toast from "react-hot-toast";

import { apiClient } from "@/lib/api-client";

export default function AdminBroadcastPage() {
  const [judul, setJudul] = useState("");
  const [pesan, setPesan] = useState("");
  const [target, setTarget] = useState("ALL_USER");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !pesan) {
      toast.error("Judul dan pesan tidak boleh kosong");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/notifikasi/broadcast", {
        judul,
        pesan,
        target,
      });
      toast.success("Broadcast berhasil dikirim!");
      setJudul("");
      setPesan("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gagal mengirim broadcast");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 h-full p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 shadow-sm">
            <Megaphone size={20} />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-gray-900">
              Kirim Broadcast
            </h1>
            <p className="text-sm text-gray-500">
              Kirim notifikasi massal ke berbagai role pengguna
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Judul Notifikasi
              </label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                placeholder="Contoh: Info Penting Sistem!"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Pesan Notifikasi
              </label>
              <textarea
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm min-h-[120px] resize-y"
                placeholder="Tuliskan pesan lengkap di sini..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                Target Penerima
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: "ALL_USER", label: "Semua Konsumen" },
                  { id: "ALL_OPERASIONAL", label: "Semua Operasional" },
                  { id: "ROLE:PENJUAL", label: "Penjual Saja" },
                  { id: "ROLE:KURIR", label: "Kurir Saja" },
                  { id: "ROLE:ADMIN_CS", label: "Customer Service" },
                ].map((t) => (
                  <label
                    key={t.id}
                    className={`
                      flex items-center gap-2 px-3 py-2.5 border rounded-xl cursor-pointer transition-all
                      ${
                        target === t.id
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 hover:border-primary-200 hover:bg-gray-50 text-gray-600"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="target"
                      value={t.id}
                      checked={target === t.id}
                      onChange={(e) => setTarget(e.target.value)}
                      className="hidden"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        target === t.id
                          ? "border-primary-500"
                          : "border-gray-300"
                      }`}
                    >
                      {target === t.id && (
                        <div className="w-2 h-2 rounded-full bg-primary-600" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Kirim Broadcast
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
