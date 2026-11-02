import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  isVerifiedB2B?: boolean;
  b2bVerification?: Record<string, unknown>;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  isLoginModalOpen: boolean;
  isPhoneVerificationModalOpen: boolean;
  showOnboarding: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  setHasHydrated: (state: boolean) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openPhoneVerificationModal: () => void;
  closePhoneVerificationModal: () => void;
  triggerOnboarding: () => void;
  dismissOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      isLoginModalOpen: false,
      isPhoneVerificationModalOpen: false,
      showOnboarding: false,
      setAuth: (user) => {
        set({ user, isAuthenticated: true });
      },
      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoginModalOpen: false,
          isPhoneVerificationModalOpen: false,
        });
      },
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
      openLoginModal: () => {
        set({ isLoginModalOpen: true });
      },
      closeLoginModal: () => {
        set({ isLoginModalOpen: false });
      },
      openPhoneVerificationModal: () => {
        set({ isPhoneVerificationModalOpen: true });
      },
      closePhoneVerificationModal: () => {
        set({ isPhoneVerificationModalOpen: false });
      },
      triggerOnboarding: () => {
        // Only show if not already dismissed permanently
        const done = localStorage.getItem("agro_onboarding_done");
        if (!done) {
          set({ showOnboarding: true });
        }
      },
      dismissOnboarding: () => {
        localStorage.setItem("agro_onboarding_done", "1");
        set({ showOnboarding: false });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
