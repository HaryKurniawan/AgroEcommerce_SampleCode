import { describe, it, expect } from "vitest";

import { extractArray } from "@/lib/api-helpers";

describe("extractArray", () => {
  it("should extract from { data: { data: { data: [...] } } } format", () => {
    const resp = { data: { data: { data: [1, 2, 3] } } };
    expect(extractArray(resp)).toEqual([1, 2, 3]);
  });

  it("should extract from { data: { data: [...] } } format", () => {
    const resp = { data: { data: [4, 5, 6] } };
    expect(extractArray(resp)).toEqual([4, 5, 6]);
  });

  it("should extract from { data: [...] } format", () => {
    const resp = { data: [7, 8, 9] };
    expect(extractArray(resp)).toEqual([7, 8, 9]);
  });

  it("should return empty array for null or undefined response", () => {
    expect(extractArray(null)).toEqual([]);
    expect(extractArray(undefined)).toEqual([]);
    expect(extractArray({})).toEqual([]);
  });
});
