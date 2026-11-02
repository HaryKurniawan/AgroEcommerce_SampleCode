"use client";

import { useState, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";

import { useProfitReport } from "@/hooks/useProfitReport";
import { ProfitReportFilters } from "@/lib/api/profit-report";

import { ProfitSummaryCards } from "./ProfitSummaryCards";
import { ProfitReportFilters as FiltersComponent } from "./ProfitReportFilters";
import { ProfitTransactionsTable } from "./ProfitTransactionsTable";

interface ProfitReportTabProps {
  produkId: string;
}

export function ProfitReportTab({ produkId }: ProfitReportTabProps) {
  const [filters, setFilters] = useState<ProfitReportFilters>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading, error } = useProfitReport(produkId, filters);

  const handleFiltersChange = useCallback(
    (f: ProfitReportFilters) => setFilters(f),
    [],
  );
  const handlePageChange = useCallback(
    (page: number, limit: number) => setFilters((p) => ({ ...p, page, limit })),
    [],
  );

  if (error) {
    return (
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
        <AlertCircle size={18} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Gagal memuat laporan keuntungan</p>
          <p className="text-xs mt-0.5 text-red-500">
            {error instanceof Error
              ? error.message
              : "Terjadi kesalahan tidak terduga"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <ProfitSummaryCards summary={data?.summary} loading={isLoading} />

      {/* Filter */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <FiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          loading={isLoading}
        />
      </div>

      {/* Tabel */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-800">
            Riwayat Transaksi Keuntungan
          </h3>
          {isLoading && (
            <Loader2 size={14} className="animate-spin text-emerald-500" />
          )}
        </div>
        <ProfitTransactionsTable
          transactions={data?.transaksi ?? []}
          pagination={
            data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 }
          }
          loading={isLoading}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
