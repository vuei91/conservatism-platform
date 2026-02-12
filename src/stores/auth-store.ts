import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Profile } from "@/types/database";

interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  isEmailVerified: boolean;
  setUser: (user: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  setEmailVerified: (verified: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isEmailVerified: true,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setEmailVerified: (isEmailVerified) => set({ isEmailVerified }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => sessionStorage),
      // isLoading은 persist하지 않음 — 항상 초기값 true로 시작해야 함
      partialize: (state) => ({
        user: state.user,
        isEmailVerified: state.isEmailVerified,
      }),
      onRehydrateStorage: () => (state) => {
        // rehydrate 완료 후: user가 있으면 일단 로그인 상태로 표시
        // (실제 세션 검증은 useAuth에서 비동기로 수행)
        if (state?.user) {
          state.setLoading(false);
        }
      },
    },
  ),
);
