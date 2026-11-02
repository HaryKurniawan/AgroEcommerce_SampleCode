"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";

/**
 * Reusable modal for forms with colorful header and action buttons.
 */
interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  headerColor?: string; // Kept for backwards compatibility but rendered as modern layout
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  submitLoading?: boolean;
  maxWidth?: string; // e.g. 'max-w-lg', 'max-w-2xl'
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  submitLabel = "Simpan",
  submitLoading = false,
  maxWidth = "max-w-md",
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen) return null;
  if (!mounted) return null;

  const modalJSX = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
      {/* Backdrop overlay for closing on click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`bg-white rounded-[24px] border border-slate-100 shadow-2xl w-full ${maxWidth} overflow-hidden max-h-[90vh] flex flex-col relative z-10`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-medium text-slate-800">{title}</h3>
            {subtitle && (
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all active:scale-95"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={onSubmit}
          className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-600"
        >
          {children}

          <div className="flex gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-50/80 hover:bg-slate-100/60 border border-slate-200/40 text-slate-500 rounded-xl text-xs font-medium transition-all active:scale-[0.98]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              {submitLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
};

export default FormModal;
