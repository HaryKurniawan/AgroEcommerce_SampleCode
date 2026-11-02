"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
  titleClassName?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actionLabel = "Lihat semua",
  actionHref,
  onActionClick,
  className = "mb-4",
  titleClassName = "",
}) => {
  const renderAction = () => {
    if (onActionClick) {
      return (
        <button
          onClick={onActionClick}
          className="text-primary-600 text-xs font-medium flex items-center gap-1 hover:underline group"
        >
          {actionLabel}{" "}
          <ChevronRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      );
    }

    if (actionHref) {
      return (
        <Link
          href={actionHref}
          className="text-primary-600 text-xs font-medium flex items-center gap-1 hover:underline group"
        >
          {actionLabel}{" "}
          <ChevronRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      );
    }

    return null;
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className="text-primary-600" />}
          <h2 className={`section-title !mb-0 ${titleClassName}`}>{title}</h2>
        </div>
        {subtitle && (
          <p className="text-[11px] text-gray-400 mt-0.5 hidden lg:block">
            {subtitle}
          </p>
        )}
      </div>
      {renderAction()}
    </div>
  );
};

export default SectionHeader;
