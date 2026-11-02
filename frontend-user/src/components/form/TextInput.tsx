"use client";

import { LucideIcon } from "lucide-react";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "email" | "number" | "url";
  icon?: LucideIcon;
  maxLength?: number;
  className?: string;
}

/**
 * TextInput Component
 * Input text reusable dengan label, error, dan helper text
 *
 * @example
 * ```tsx
 * <TextInput
 *   value={name}
 *   onChange={setName}
 *   label="Nama Lengkap"
 *   placeholder="Masukkan nama"
 *   required
 * />
 * ```
 */
export default function TextInput({
  value,
  onChange,
  label,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  type = "text",
  icon: Icon,
  maxLength,
  className = "",
}: TextInputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon size={18} className="text-gray-400" />
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`
            w-full ${Icon ? "pl-10" : "pl-3"} pr-3 py-2 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? "border-red-500" : "border-gray-300"}
          `}
        />

        {maxLength && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs text-gray-400">
              {value.length}/{maxLength}
            </span>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {!error && helperText && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
