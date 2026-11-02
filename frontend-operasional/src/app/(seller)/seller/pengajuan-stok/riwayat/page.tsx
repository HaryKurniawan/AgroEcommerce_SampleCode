"use client";

// This is a redirect to the main pengajuan-stok page
// The main page shows the history/list of stock requests

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StockRequestHistoryPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main pengajuan-stok page which shows the history
    router.replace("/seller/pengajuan-stok");
  }, [router]);

  return null;
}
