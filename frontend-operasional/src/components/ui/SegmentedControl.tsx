"use client";

import React, { useRef, useEffect, useState } from "react";

export interface SegmentedControlOption {
  value: string;
  label: React.ReactNode;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlightStyle, setHighlightStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeItem = containerRef.current.querySelector<HTMLElement>(
      "[data-active='true']",
    );
    if (activeItem) {
      setHighlightStyle({
        left: activeItem.offsetLeft,
        width: activeItem.offsetWidth,
        opacity: 1,
      });
    }
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex p-1 bg-white rounded-2xl border border-slate-200 overflow-x-auto max-w-full hide-scrollbar ${className}`}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Animated Background Pill */}
      <div
        className="absolute top-1 bottom-1 bg-primary-600 rounded-xl transition-all duration-300 ease-out"
        style={{
          left: highlightStyle.left,
          width: highlightStyle.width,
          opacity: highlightStyle.opacity,
        }}
      />

      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            data-active={isActive}
            onClick={() => onChange(opt.value)}
            className={`relative z-10 px-5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${
              isActive ? "text-white" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
