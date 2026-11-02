import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Star,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Percent,
  ChevronRight,
  BarChart2,
  Edit,
} from "lucide-react";

import { formatRupiah } from "@/lib/ecommerce-api";

import { ProductItem } from "../_hooks/useSellerProducts";

interface EtalaseCardProps {
  product: ProductItem;
  onToggleStatus: (product: ProductItem) => void;
  onRemoveFromEtalase: (id: string) => void;
  isActionLoading: boolean;
  statusColor: (status: string) => string;
}

const EtalaseCard: React.FC<EtalaseCardProps> = ({
  product,
  onToggleStatus,
  onRemoveFromEtalase,
  isActionLoading,
  statusColor,
}) => {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // Jangan navigasi jika klik pada tombol action
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    router.push(`/seller/produk/${product.id}`);
  };

  const displayProductName = product.nama.replace(" - ", " ");

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-3xl border border-gray-100 p-5 hover:shadow-xl hover:border-emerald-100 transition-all group flex flex-col cursor-pointer relative"
    >
      <div className="flex gap-4 mb-4">
        <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center text-4xl shadow-inner border border-gray-50">
          {product.gambarUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={product.gambarUrl}
                alt={product.nama?.replace(" - ", " ")}
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            "📦"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                {displayProductName}
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${statusColor(
                  product.status,
                )}`}
              >
                {product.status}
              </span>
              <ChevronRight
                size={16}
                className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {product.diskonPersen && Number(product.diskonPersen) > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-medium bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg border border-orange-100">
                <Percent size={10} /> {product.diskonPersen}% OFF
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] font-medium bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg border border-amber-100">
              <Star size={10} fill="currentColor" /> {product.rating || 4.8}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 mb-4 bg-gray-50/50 -mx-5 px-5">
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            Harga Etalase
          </p>
          <p className="font-medium text-emerald-600">
            {formatRupiah(product.harga)}
            <span className="text-[10px] opacity-70 ml-0.5">
              /{product.satuan || "kg"}
            </span>
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            Stok Tersedia
          </p>
          <p
            className={`font-medium ${
              product.stok === 0 ? "text-red-500" : "text-gray-900"
            }`}
          >
            {product.stok} {product.satuan || "kg"}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/seller/produk/${product.id}`);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl text-xs font-medium hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          title="Lihat Detail"
        >
          <Edit size={14} /> Lihat Detail
        </button>

        <button
          onClick={() => onToggleStatus(product)}
          disabled={isActionLoading}
          className="p-3 bg-gray-100 text-gray-500 rounded-2xl hover:bg-gray-200 transition-all active:scale-90 disabled:opacity-50"
          title={product.status === "ACTIVE" ? "Sembunyikan" : "Tampilkan"}
        >
          {isActionLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : product.status === "ACTIVE" ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>
      </div>
    </div>
  );
};

export default EtalaseCard;
