import { describe, it, expect, vi, beforeEach } from "vitest";

import { login, register, logout } from "@/lib/auth";
import { UserRole } from "@/types";
import { apiClient } from "@/lib/api-client";

// Mock apiClient
vi.mock("@/lib/api-client", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("auth lib", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("login should send correct request and return data", async () => {
    const mockResponse = {
      data: { data: { accessToken: "token-123", user: { id: "user-1" } } },
    };
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse as any);

    const result = await login({ email: "test@test.com", password: "123" });

    expect(apiClient.post).toHaveBeenCalledWith("/auth/login", {
      email: "test@test.com",
      password: "123",
      allowedRoles: ["CUSTOMER", "SELLER"],
    });
    expect(result.accessToken).toBe("token-123");
  });

  it("register should send correct request and return data", async () => {
    const mockResponse = {
      data: { data: { accessToken: "token-123", user: { id: "user-1" } } },
    };
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse as any);

    const result = await register({
      email: "r@r.com",
      password: "p",
      name: "N",
      role: UserRole.KONSUMEN,
    });

    expect(apiClient.post).toHaveBeenCalledWith("/auth/register", {
      email: "r@r.com",
      password: "p",
      name: "N",
      role: UserRole.KONSUMEN,
    });
    expect(result.user.id).toBe("user-1");
  });

  it("logout should call logout endpoint", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({} as any);
    await logout();
    expect(apiClient.post).toHaveBeenCalledWith("/auth/logout");
  });
});
