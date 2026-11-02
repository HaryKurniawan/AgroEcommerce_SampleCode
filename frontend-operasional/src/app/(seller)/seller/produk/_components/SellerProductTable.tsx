"use client";

import React from "react";
import Image from "next/image";
import { Warehouse, Edit, Store, Loader2 } from "lucide-react";

interface SellerProductTableProps {
  products: any[];
  loading: boolean;
  onEdit: (product: any) => void;
  onAddToEtalase: (id: string) => void;
  actionLoadingId: string | null;
  statusColor: (s: string) => string;
}

const SellerProductTable: React.FC<SellerProductTableProps> = ({
  products,
  loading,
  onEdit,
  onAddToEtalase,
  actionLoadingId,
  statusColor,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto text-[13px]">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-6 py-4">Item (Storage)</th>
              <th className="px-6 py-4">Kategori</th>
              <th className="px-6 py-4 text-center">Stok Fisik</th>
              <th className="px-6 py-4 text-center">Status Etalase</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <Warehouse className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    Storage gudang kosong.
                  </p>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-emerald-50/20 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-lg shadow-inner group-hover:scale-105 transition-transform">
                        {p.gambarUrl ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={p.gambarUrl}
                              alt={p.nama?.replace(" - ", " ") || "Produk"}
                              fill
                              sizes="40px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          "📦"
                        )}
                      </div>
                      <span className="font-bold text-gray-900 truncate max-w-[150px]">
                        {p.nama?.replace(" - ", " ")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {p.category?.nama || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                      <div className="inline-flex items-baseline gap-1 bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg">
                        <span
                          className={`font-bold text-sm ${p.stok > 0 ? "text-gray-900" : "text-red-500"}`}
                        >
                          {p.stok}
                        </span>
                        <span className="text-gray-500 text-[10px]">
                          {p.satuan || "kg"}
                        </span>
                      </div>
                      {p.grades && p.grades.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {p.grades.map(
                            (g: {
                              id: string;
                              grade: string;
                              stok: number;
                            }) => (
                              <span
                                key={g.id}
                                className="text-[9px] px-1.5 py-0.5 border border-gray-100 bg-gray-50 rounded font-bold text-gray-400"
                                title={`Stok Grade ${g.grade}`}
                              >
                                {g.grade}:{g.stok}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase border ${statusColor(p.status)}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.status === "DRAFT" ? (
                      <button
                        onClick={() => onAddToEtalase(p.id)}
                        disabled={actionLoadingId === p.id}
                        className="text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl hover:bg-emerald-100 font-bold text-xs inline-flex items-center gap-1.5 transition-all disabled:opacity-50 active:scale-95"
                      >
                        {actionLoadingId === p.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <Store size={14} /> Ke Etalase
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => onEdit(p)}
                        className="text-blue-600 bg-blue-50 px-3 py-2 rounded-xl hover:bg-blue-100 font-bold text-xs inline-flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Edit size={14} /> Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerProductTable;
