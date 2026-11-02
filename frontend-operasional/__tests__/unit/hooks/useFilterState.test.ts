import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useFilterState } from "@/hooks/useFilterState";

describe("useFilterState", () => {
  it("should initialize with default values", () => {
    const { result } = renderHook(() => useFilterState());
    expect(result.current.selectedCategory).toBe("");
    expect(result.current.selectedStore).toBe("");
    expect(result.current.selectedPrice).toBe("Semua Harga");
    expect(result.current.sortBy).toBe("populer");
    expect(result.current.search).toBe("");
    expect(result.current.activeFiltersCount).toBe(0);
  });

  it("should initialize with provided initial values", () => {
    const { result } = renderHook(() =>
      useFilterState({ initialCategory: "cat-1", initialSort: "price_asc" }),
    );
    expect(result.current.selectedCategory).toBe("cat-1");
    expect(result.current.sortBy).toBe("price_asc");
  });

  it("should correctly count active filters", () => {
    const { result } = renderHook(() => useFilterState());
    act(() => {
      result.current.setSelectedCategory("cat-1");
      result.current.setSelectedStore("store-1");
    });
    expect(result.current.activeFiltersCount).toBe(2);
  });

  it("should reset all filters to defaults", () => {
    const { result } = renderHook(() =>
      useFilterState({
        initialCategory: "cat-1",
        initialStore: "store-1",
      }),
    );
    act(() => {
      result.current.resetFilters();
    });
    expect(result.current.selectedCategory).toBe("");
    expect(result.current.selectedStore).toBe("");
    expect(result.current.sortBy).toBe("populer");
  });
});
