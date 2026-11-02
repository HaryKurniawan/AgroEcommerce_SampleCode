/**
 * useCheckoutShipping Hook
 * Handle shipping cost calculation
 */

import { useState, useEffect } from "react";

import { logisticsApi } from "@/lib/ecommerce-api";
import type { ApiShippingInfo } from "@/types";

import { createDefaultShipping, type StoreGroup } from "./checkout-helpers";

export function useCheckoutShipping(
  selectedAddressId: string,
  groupedByStore: StoreGroup[],
  itemsLength: number,
) {
  const [shippingInfos, setShippingInfos] = useState<ApiShippingInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    const fetchShipping = async () => {
      if (itemsLength === 0) {
        setShippingInfos([]);
        return;
      }

      // Always set default shipping cost of 15000 for all stores
      const defaultShipping = createDefaultShipping(groupedByStore);

      // If address is selected, try to fetch actual shipping costs
      if (selectedAddressId) {
        setLoading(true);

        try {
          const storeRequests = groupedByStore.map((group) => ({
            tokoId: group.tokoId,
            totalWeightGram: group.totalWeightGram,
          }));

          const res = await logisticsApi.calculate({
            customerAddressId: selectedAddressId,
            stores: storeRequests,
          });

          if (!isActive) return;

          // The response from backend is doubly nested:
          // axios res.data -> { success: true, data: { statusCode: 200, data: [...] } }
          const rawData = res.data?.data?.data || res.data?.data;

          const infos = Array.isArray(rawData)
            ? rawData
            : Array.isArray(res.data)
              ? res.data
              : [];

          // Use fetched shipping if available, otherwise use default
          if (infos.length > 0) {
            setShippingInfos(infos);
          } else {
            setShippingInfos(defaultShipping);
          }
        } catch (err) {
          if (!isActive) return;
          console.error("Failed to calculate shipping", err);
          alert("Gagal menghitung ongkir: " + (err as any).message);
          // Fall back to default shipping on error
          setShippingInfos(defaultShipping);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      } else {
        // No address selected, use default shipping
        setShippingInfos(defaultShipping);
      }
    };

    fetchShipping();

    return () => {
      isActive = false;
    };
  }, [selectedAddressId, groupedByStore, itemsLength]);

  return {
    shippingInfos,
    loading,
  };
}
