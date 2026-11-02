"use client";

import React, { useState, useEffect, useCallback } from "react";

/**
 * Generic BottomSheet component with backdrop and slide-up/down animations.
 */
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  React.useLayoutEffect(() => {
    if (isOpen) {
      Promise.resolve().then(() => {
        setShouldRender(true);
        setIsClosing(false);
      });
      // Prevent scrolling when open
      document.body.style.overflow = "hidden";
    } else if (shouldRender) {
      // Trigger closing animation
      Promise.resolve().then(() => setIsClosing(true));
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
        document.body.style.overflow = "unset";
      }, 300); // Wait for animation
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, shouldRender]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        handleClose();
      }
    },
    [handleClose],
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  if (!shouldRender) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isClosing ? "animate-backdrop-out" : "animate-backdrop-in"}`}
        onClick={handleClose}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Tutup"
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col ${isClosing ? "animate-sheet-down" : "animate-sheet-up"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2 border-b border-gray-50">
          <h3 className="font-display font-semibold text-gray-900 text-lg">
            {title}
          </h3>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">{children}</div>

        {/* Optional Footer */}
        {footer && <div className="p-6 border-t border-gray-50">{footer}</div>}
      </div>
    </>
  );
};

export default BottomSheet;
