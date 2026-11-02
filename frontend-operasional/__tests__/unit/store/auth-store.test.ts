import { describe, it, expect, beforeEach } from "vitest";

import { useAuthStore } from "@/store/auth-store";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  role: "CUSTOMER",
};

describe("authStore", () => {
  // Reset state sebelum setiap test
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoginModalOpen: false,
    });
  });

  it("should have correct initial state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should set auth data on setAuth", () => {
    useAuthStore.getState().setAuth(mockUser);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("should clear auth data on clearAuth", () => {
    useAuthStore.getState().setAuth(mockUser);
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should open and close login modal", () => {
    useAuthStore.getState().openLoginModal();
    expect(useAuthStore.getState().isLoginModalOpen).toBe(true);

    useAuthStore.getState().closeLoginModal();
    expect(useAuthStore.getState().isLoginModalOpen).toBe(false);
  });
});
