"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  showStrength?: boolean;
}

/**
 * PasswordInput Component
 * Input password dengan toggle visibility dan strength indicator
 * Compatible dengan react-hook-form
 *
 * @example
 * ```tsx
 * // With react-hook-form
 * <PasswordInput
 *   label="Password"
 *   error={errors.password?.message}
 *   showStrength
 *   {...register("password")}
 * />
 *
 * // Standalone
 * <PasswordInput
 *   label="Password"
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 * />
 * ```
 */
const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      error,
      showStrength = false,
      className = "",
      required = false,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const strength =
      showStrength && props.value
        ? getPasswordStrength(String(props.value))
        : null;

    return (
      <div className={className} suppressHydrationWarning>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative" suppressHydrationWarning>
          <input
            ref={ref}
            suppressHydrationWarning
            type={showPassword ? "text" : "password"}
            className={`w-full px-4 py-3 pr-12 rounded-xl border ${
              error ? "border-red-300" : "border-gray-200"
            } text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors bg-white`}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {error && <p className="mt-1.5 text-sm text-red-500 ml-1">{error}</p>}

        {showStrength &&
          props.value &&
          String(props.value).length > 0 &&
          !error &&
          strength && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      level <= strength.score ? strength.color : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs ml-1 ${strength.textColor}`}>
                {strength.label}
              </p>
            </div>
          )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;

/**
 * Get password strength
 */
function getPasswordStrength(password: string) {
  if (!password) return null;

  let score = 0;

  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Complexity
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const levels = [
    { label: "Sangat Lemah", color: "bg-red-500", textColor: "text-red-500" },
    { label: "Lemah", color: "bg-orange-500", textColor: "text-orange-500" },
    { label: "Sedang", color: "bg-yellow-500", textColor: "text-yellow-500" },
    { label: "Kuat", color: "bg-green-500", textColor: "text-green-500" },
    {
      label: "Sangat Kuat",
      color: "bg-green-600",
      textColor: "text-green-600",
    },
  ];

  return {
    score,
    ...levels[score],
  };
}
