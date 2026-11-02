import { useEffect } from "react";

import { useAuthStore } from "@/src/store/auth-store";
import { useProfile } from "@/src/hooks/profil/useProfile";

/**
 * Hook to sync profile data with auth store
 * This ensures consistency between login data and profile API data
 */
export const useSyncProfile = () => {
  const { user, setAuth, isAuthenticated, _hasHydrated } = useAuthStore();
  const { profile } = useProfile(isAuthenticated, _hasHydrated);

  useEffect(() => {
    // Only sync if we have both user and profile data
    if (user && profile && isAuthenticated) {
      // Check if there's a mismatch in name
      if (user.name !== profile.name) {
        console.warn("🔄 Syncing profile data with auth store");
        console.warn(`Auth store name: "${user.name}"`);
        console.warn(`Profile API name: "${profile.name}"`);

        // Update auth store with latest profile data
        setAuth({
          ...user,
          name: profile.name,
          role: profile.role,
        });
      }
    }
  }, [user, profile, isAuthenticated, setAuth]);

  return {
    isSynced: user?.name === profile?.name,
    authName: user?.name,
    profileName: profile?.name,
  };
};
