"use client";

import { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";

export default function FullScreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable fullscreen mode: ${err.message}`,
        );
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      title={isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}
      className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:bg-primary-600 hover:border-primary-600 transition-colors flex items-center justify-center relative group shadow-sm"
    >
      {isFullscreen ? (
        <Minimize
          size={18}
          className="text-slate-700 group-hover:text-white transition-colors"
        />
      ) : (
        <Maximize
          size={18}
          className="text-slate-700 group-hover:text-white transition-colors"
        />
      )}
    </button>
  );
}
