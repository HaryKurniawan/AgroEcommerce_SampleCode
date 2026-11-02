// =============================================================
// EMPTY STATE COMPONENT — Ecommerce App
// =============================================================
// Usage:
//   <EmptyState
//     illustration="/empty-cart.svg"
//     title="Keranjang masih kosong"
//     description="Deskripsi singkat"
//     actionLabel="Mulai Belanja"
//     onAction={() => router.push('/katalog')}
//   />
// =============================================================

import React from "react";
import Image from "next/image";

interface EmptyStateProps {
  /** Path to SVG/image in /public, e.g. '/empty-cart.svg' */
  illustration: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  illustration,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
    >
      {/* Illustration */}
      <div className="relative w-52 h-52 mb-6 select-none">
        <Image
          src={illustration}
          alt={title}
          fill
          className="object-contain drop-shadow-sm"
          priority
        />
      </div>

      {/* Text */}
      <h2 className="font-display font-semibold text-gray-900 text-xl mb-2 leading-tight">
        {title}
      </h2>
      <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
        {description}
      </p>

      {/* Actions */}
      {(actionLabel || secondaryLabel) && (
        <div className="flex flex-col gap-3 w-full max-w-xs mt-7">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="w-full bg-primary-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-primary-700 active:scale-[0.98] transition-all"
            >
              {actionLabel}
            </button>
          )}
          {secondaryLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="w-full border border-gray-200 text-gray-600 font-semibold py-3 rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all text-sm"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
