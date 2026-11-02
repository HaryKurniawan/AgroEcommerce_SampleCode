import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { useAuthStore } from "@/src/store/auth-store";

describe("useAuthStore (Login Logic)", () => {
  beforeEach(() => {
    // Clear localStorage and reset store before each test
    localStorage.clear();
    useAuthStore.getState().clearAuth();
    useAuthStore.setState({
      _hasHydrated: false,
      showOnboarding: false,
      isLoginModalOpen: false,
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should initialize with default unauthenticated state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state._hasHydrated).toBe(false);
  });

  it("should handle login (setAuth) correctly", () => {
    const mockUser = {
      id: "123",
      email: "test@example.com",
      name: "Test User",
      role: "KONSUMEN",
    };

    useAuthStore.getState().setAuth(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("should handle logout (clearAuth) correctly", () => {
    // First login
    const mockUser = { id: "123", email: "test@example.com", role: "KONSUMEN" };
    useAuthStore.getState().setAuth(mockUser);

    // Ensure logged in
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).not.toBeNull();

    // Then logout
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoginModalOpen).toBe(false);
  });

  it("should open and close login modal", () => {
    expect(useAuthStore.getState().isLoginModalOpen).toBe(false);

    useAuthStore.getState().openLoginModal();
    expect(useAuthStore.getState().isLoginModalOpen).toBe(true);

    useAuthStore.getState().closeLoginModal();
    expect(useAuthStore.getState().isLoginModalOpen).toBe(false);
  });

  it("should handle hydration properly", () => {
    useAuthStore.getState().setHasHydrated(true);
    expect(useAuthStore.getState()._hasHydrated).toBe(true);
  });
});
