"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  const handleSession = useCallback(
    async (session: Session | null) => {
      if (session?.user) {
        const supabase = createClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    },
    [setUser, setLoading],
  );

  useEffect(() => {
    const supabase = createClient();

    // 1. 먼저 현재 세션을 즉시 확인 (새로고침 시 빠른 복원)
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // 2. 이후 auth 상태 변경 구독 (로그인/로그아웃/토큰 갱신)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // INITIAL_SESSION은 getSession()에서 이미 처리했으므로 스킵
      if (event === "INITIAL_SESSION") return;

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        handleSession(session);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleSession, setUser, setLoading]);

  return { user, isLoading };
}
