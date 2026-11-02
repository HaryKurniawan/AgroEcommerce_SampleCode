import { useState, useEffect } from "react";

import { bannerApi } from "@/lib/ecommerce-api";

export function useBanners() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await bannerApi.getBanners();
        setBanners(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch banners", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  return { banners, loading };
}
