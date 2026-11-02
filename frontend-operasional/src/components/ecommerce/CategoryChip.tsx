"use client";

// =====================================================
// CATEGORY CHIP — CHIP KATEGORI
// =====================================================

import type { Category } from "@/types";

interface CategoryChipProps {
  category: Category;
  isActive?: boolean;
  onClick?: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  isActive = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all duration-200 ${
        isActive
          ? "bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-200"
          : "bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50"
      }`}
    >
      <span className="text-lg">{category.icon}</span>
      <span className="text-sm font-medium whitespace-nowrap">
        {category.nama}
      </span>
    </button>
  );
};

export default CategoryChip;
