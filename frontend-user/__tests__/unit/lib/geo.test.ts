import { describe, it, expect } from "vitest";

import { calculateDistance } from "@/lib/geo";

describe("calculateDistance (Haversine)", () => {
  it("should return 0 for identical coordinates", () => {
    expect(calculateDistance(-6.9175, 107.6191, -6.9175, 107.6191)).toBe(0);
  });

  it("should return ~120km between Bandung and Jakarta", () => {
    const d = calculateDistance(-6.9175, 107.6191, -6.2088, 106.8456);
    expect(d).toBeGreaterThan(100);
    expect(d).toBeLessThan(140);
  });

  it("should be the same in both directions", () => {
    const d1 = calculateDistance(-6.9175, 107.6191, -6.2088, 106.8456);
    const d2 = calculateDistance(-6.2088, 106.8456, -6.9175, 107.6191);
    expect(d1).toBeCloseTo(d2, 3);
  });
});
