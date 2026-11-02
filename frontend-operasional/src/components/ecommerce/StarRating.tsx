"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

const LABELS: Record<number, string> = {
  1: "Sangat Buruk",
  2: "Buruk",
  3: "Cukup",
  4: "Bagus",
  5: "Sangat Bagus",
};

const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  readonly = false,
  size = 28,
}) => {
  const [hovered, setHovered] = useState(0);

  const active = hovered || value;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-transform ${!readonly ? "hover:scale-110 active:scale-95 cursor-pointer" : "cursor-default"}`}
          >
            <Star
              size={size}
              className={`transition-colors ${
                star <= active
                  ? "fill-amber-400 text-amber-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
      {!readonly && active > 0 && (
        <span className="text-xs font-semibold text-amber-500">
          {active >= 1 && active <= 5
            ? LABELS[active as keyof typeof LABELS]
            : ""}
        </span>
      )}
    </div>
  );
};

export default StarRating;
