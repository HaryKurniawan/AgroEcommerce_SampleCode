/**
 * useCheckoutData Hook
 * Handle data fetching untuk checkout (cart items & addresses)
 */

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { cartApi, addressesApi } from "@/lib/ecommerce-api";
import type { ApiOrderItem, ApiAddressData } from "@/types";

import { mapCartItemsToOrderItems, type RawCartItem } from "./checkout-helpers";

export function useCheckoutData() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ApiOrderItem[]>([]);
  const [addresses, setAddresses] = useState<ApiAddressData[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);

        // 1. Fetch Cart
        const cartRes = await cartApi.get();
        const body = cartRes.data;
        const inner = body?.data;
        const itemsRaw = (
          Array.isArray(inner?.item)
            ? inner.item
            : Array.isArray(body?.item)
              ? body.item
              : []
        ) as RawCartItem[];

        // Filter if specific items are selected from cart
        const selectedIdsParam = searchParams.get("items");
        const selectedIds = selectedIdsParam
          ? selectedIdsParam.split(",")
          : null;

        const mappedItems = mapCartItemsToOrderItems(itemsRaw, selectedIds);
        setItems(mappedItems);

        // 2. Fetch Addresses
        const addressRes = await addressesApi.getAll();
        const rawAddresses: ApiAddressData[] = Array.isArray(
          addressRes.data?.data,
        )
          ? addressRes.data.data
          : Array.isArray(addressRes.data)
            ? addressRes.data
            : [];

        // STRICT GUARD: If no valid address with a city, force redirect to address form
        const hasValidAddress = rawAddresses.some((a) => a.alamat && a.kota);
        if (!hasValidAddress) {
          if (typeof window !== "undefined") {
            window.location.href = "/profil/alamat/form";
            return;
          }
        }

        setAddresses(rawAddresses);

        // Set default address or read from searchParams
        const queryAddressId = searchParams.get("addressId");

        if (queryAddressId) {
          const isValidAddress = rawAddresses.some(
            (a) => String(a.id) === queryAddressId,
          );
          if (isValidAddress) {
            setSelectedAddressId(queryAddressId);
          } else {
            // Fallback if not valid
            const defaultAddr = rawAddresses.find(
              (a: ApiAddressData) => a.isDefault,
            );
            if (defaultAddr && defaultAddr.id) {
              setSelectedAddressId(String(defaultAddr.id));
            } else if (rawAddresses.length > 0 && rawAddresses[0].id) {
              setSelectedAddressId(String(rawAddresses[0].id));
            }
          }
        } else {
          const defaultAddr = rawAddresses.find(
            (a: ApiAddressData) => a.isDefault,
          );
          if (defaultAddr && defaultAddr.id) {
            setSelectedAddressId(String(defaultAddr.id));
          } else if (rawAddresses.length > 0 && rawAddresses[0].id) {
            setSelectedAddressId(String(rawAddresses[0].id));
          }
        }
      } catch (error) {
        console.error("Error loading checkout data:", error);
      } finally {
        setLoading(false);
      }
    },
    [searchParams],
  );

  return {
    items,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    loading,
    loadData,
  };
}
