import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useOrderEvents(tokoId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Construct URL with optional query params
    const url = new URL(
      "/api/proxy/ecom/pesanan-events/stream",
      window.location.origin,
    );
    if (tokoId) {
      url.searchParams.append("tokoId", tokoId);
    }

    const eventSource = new EventSource(url.toString(), {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[SSE] Order Event Received:", data);

        // Invalidate order list queries
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["courier-tasks"] });
        queryClient.invalidateQueries({ queryKey: ["courier-history"] });

        // Invalidate specific order detail query
        if (data.orderId) {
          queryClient.invalidateQueries({ queryKey: ["order", data.orderId] });
        }
      } catch (err) {
        console.error("[SSE] Failed to parse event data", err);
      }
    };

    eventSource.onerror = () => {
      // EventSource native auto-reconnects. Avoid console.error to prevent red Next.js dev overlay.
      if (eventSource.readyState === EventSource.CLOSED) {
        console.warn("[SSE] Connection closed, browser will auto-reconnect...");
      }
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient, tokoId]);
}
