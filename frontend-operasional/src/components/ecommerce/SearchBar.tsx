import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  onFilterClick?: () => void;
  placeholder?: string;
  variant?: "default" | "glass";
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSearch,
  onFilterClick,
  placeholder = "Cari sayur, paket, toko...",
  variant = "default",
  className = "",
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  const isGlass = variant === "glass";

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      <div
        className={`relative flex-1 flex items-center rounded-xl transition-all duration-200 border 
          ${
            isGlass
              ? "bg-white/20 backdrop-blur-md border-white/30 focus-within:bg-white/30"
              : "bg-white border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-primary-100 focus-within:border-primary-400"
          }`}
      >
        <Search
          size={18}
          className={`absolute left-3.5 ${isGlass ? "text-white/80" : "text-gray-400"}`}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`w-full pl-10 pr-4 py-2.5 bg-transparent text-sm outline-none 
            ${isGlass ? "text-white/90 placeholder-white/60" : "text-gray-700 placeholder-gray-400"}
          `}
        />
      </div>
      {onFilterClick && (
        <button
          onClick={onFilterClick}
          className={`p-2.5 rounded-xl border transition-all active:scale-95
            ${isGlass ? "bg-white/20 border-white/30 text-white hover:bg-white/30" : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100"}
          `}
        >
          <SlidersHorizontal size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
