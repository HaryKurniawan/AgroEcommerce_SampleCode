"use client";

import React from "react";

/**
 * Reusable header for admin and seller pages with title, description, and optional actions.
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  iconColor?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  iconColor = "text-emerald-600",
  actions,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-display font-medium text-slate-800 flex items-center gap-2">
          {Icon && <Icon size={26} className={iconColor} />}
          {title}
        </h1>
        {description && (
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeader;
