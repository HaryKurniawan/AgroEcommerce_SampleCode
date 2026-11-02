"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Building2, Search } from "lucide-react";
import toast from "react-hot-toast";

import { apiClient } from "@/lib/api-client";
import ActionModal from "@/components/ActionModal";

interface B2bRequest {
  id_pengguna: string;
  email: string;
  nama: string;
  noTelepon: string;
  namaPerusahaan: string;
  npwpPerusahaan: string;
  nibPerusahaan: string;
  statusVerifikasiPerusahaan: string;
  createdAt: string;
}

export default function VerifikasiB2bPage() {
  const [requests, setRequests] = useState<B2bRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedRequest, setSelectedRequest] = useState<B2bRequest | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"DISETUJUI" | "DITOLAK" | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/pengguna/admin/b2b-verifications");
      setRequests(res.data?.data || res.data || []);
    } catch (error: any) {
      toast.error("Gagal mengambil data pengajuan B2B");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleActionClick = (
    req: B2bRequest,
    action: "DISETUJUI" | "DITOLAK",
  ) => {
    setSelectedRequest(req);
    setActionType(action);
    setIsModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return;

    setIsSubmitting(true);
    try {
      await apiClient.patch(
        `/pengguna/admin/b2b-verifications/${selectedRequest.id_pengguna}/status`,
        {
          status: actionType,
        },
      );
      toast.success(
        `Pengajuan perusahaan berhasil ${actionType.toLowerCase()}`,
      );
      setIsModalOpen(false);
      fetchRequests();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal mengubah status pengajuan",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.namaPerusahaan?.toLowerCase().includes(search.toLowerCase()) ||
      r.nama?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="text-primary-600" />
          Verifikasi Akun Perusahaan (B2B)
        </h1>
        <p className="text-gray-500 mt-1">
          Tinjau dan setujui pendaftaran perusahaan untuk mendapatkan akses
          grosir.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari nama perusahaan atau pengguna..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Perusahaan</th>
                <th className="px-6 py-4">Pemohon</th>
                <th className="px-6 py-4">Dokumen</th>
                <th className="px-6 py-4">Tanggal Pengajuan</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <Building2
                      size={40}
                      className="mx-auto mb-3 text-gray-300"
                    />
                    Belum ada pengajuan verifikasi perusahaan yang tertunda.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id_pengguna} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {req.namaPerusahaan}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {req.nama}
                      </div>
                      <div className="text-xs text-gray-500">{req.email}</div>
                      <div className="text-xs text-gray-500">
                        {req.noTelepon || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs bg-gray-100 inline-block px-2 py-1 rounded mb-1">
                        <span className="font-semibold text-gray-500">
                          NPWP:
                        </span>{" "}
                        {req.npwpPerusahaan}
                      </div>
                      <br />
                      <div className="text-xs bg-gray-100 inline-block px-2 py-1 rounded">
                        <span className="font-semibold text-gray-500">
                          NIB:
                        </span>{" "}
                        {req.nibPerusahaan}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(req.createdAt).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleActionClick(req, "DISETUJUI")}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle size={14} /> Setujui
                        </button>
                        <button
                          onClick={() => handleActionClick(req, "DITOLAK")}
                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5"
                        >
                          <XCircle size={14} /> Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        icon={
          actionType === "DISETUJUI" ? (
            <CheckCircle size={40} className="text-emerald-500" />
          ) : (
            <XCircle size={40} className="text-red-500" />
          )
        }
        title={
          actionType === "DISETUJUI"
            ? "Setujui Pengajuan B2B"
            : "Tolak Pengajuan B2B"
        }
        description={`Apakah Anda yakin ingin ${actionType === "DISETUJUI" ? "menyetujui" : "menolak"} pengajuan dari perusahaan ${selectedRequest?.namaPerusahaan}?`}
        primaryButton={{
          label: isSubmitting
            ? "Memproses..."
            : actionType === "DISETUJUI"
              ? "Ya, Setujui"
              : "Ya, Tolak",
          onClick: handleConfirmAction,
          danger: actionType === "DITOLAK",
          className:
            actionType === "DISETUJUI"
              ? "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
              : undefined,
        }}
        secondaryButton={{
          label: "Batal",
          onClick: () => setIsModalOpen(false),
          disabled: isSubmitting,
        }}
      />
    </div>
  );
}
