"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUpDown, ChevronDown, Check } from "lucide-react";

export interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
}

export function SortDropdown({ value, onChange, options }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current active label
  const activeLabel =
    options.find((opt) => opt.value === value)?.label || "Urutkan";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 bg-white border rounded-xl px-3.5 py-2.5 shadow-sm transition-all shrink-0 w-full md:w-auto text-sm font-medium text-slate-700 hover:border-emerald-300 group ${
          isOpen
            ? "border-emerald-500 ring-4 ring-emerald-500/10"
            : "border-slate-200"
        }`}
      >
        <ArrowUpDown
          size={14}
          className={`transition-colors ${isOpen ? "text-emerald-500" : "text-slate-400 group-hover:text-emerald-500"}`}
        />
        <span className="flex-1 text-left whitespace-nowrap">
          {activeLabel}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu (Curtain + Bounce Effect) */}
      <div
        className={`absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg shadow-slate-200/50 py-1.5 z-50 origin-top overflow-hidden
          transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"}
        `}
      >
        <div className="flex flex-col">
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center justify-between transition-colors ${
                  isSelected
                    ? "bg-emerald-50/50 text-emerald-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {option.label}
                {isSelected && <Check size={14} className="text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
