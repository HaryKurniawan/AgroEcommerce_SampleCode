import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { BellRing } from "lucide-react";

import { useNotifStore } from "@/store/notifikasi-store";
import { useAuthStore } from "@/store/auth-store";

export function useNotifSSE() {
  const { addNotification } = useNotifStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    let es: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      // Connect through Next.js proxy route
      es = new EventSource("/api/proxy/notifikasi/stream", {
        withCredentials: true,
      });

      es.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === "ping") return; // Ignore heartbeat

          addNotification(payload);

          // Show Toast notification
          toast(
            (t) => (
              <div className="flex items-start gap-3 w-full">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                  <BellRing size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {payload.judul}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {payload.pesan}
                  </p>
                </div>
              </div>
            ),
            {
              duration: 5000,
              position: "top-right",
              style: {
                minWidth: "300px",
                padding: "12px",
                borderRadius: "16px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              },
            },
          );
        } catch (err) {
          console.error("Error parsing SSE payload:", err);
        }
      };

      es.onerror = () => {
        es?.close();
        // Auto reconnect logic
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      es?.close();
      clearTimeout(reconnectTimeout);
    };
  }, [isAuthenticated, addNotification]);
}
