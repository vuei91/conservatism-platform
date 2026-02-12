"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const {
    user,
    isLoading,
    isEmailVerified,
    setUser,
    setLoading,
    setEmailVerified,
  } = useAuthStore();

  const forceLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setEmailVerified(true);
    setLoading(false);
  }, [setUser, setLoading, setEmailVerified]);

  const handleSession = useCallback(
    async (session: Session | null) => {
      if (session?.user) {
        const supabase = createClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        // 프로필이 없으면 삭제된 사용자 - 자동 로그아웃
        if (!profile) {
          await forceLogout();
          return;
        }

        setUser(profile);
        // 이메일 인증 상태 확인
        setEmailVerified(!!session.user.email_confirmed_at);
      } else {
        setUser(null);
        setEmailVerified(true);
      }
      setLoading(false);
    },
    [setUser, setLoading, setEmailVerified, forceLogout],
  );

  // 주기적으로 세션 유효성 체크 (강제 탈퇴 감지)
  useEffect(() => {
    if (!user) return;

    const checkSession = async () => {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        await forceLogout();
      }
    };

    // 5분마다 세션 체크
    const interval = setInterval(checkSession, 5 * 60 * 1000);

    // 윈도우 포커스 시에도 체크
    const handleFocus = () => checkSession();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user, forceLogout]);

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

  return { user, isLoading, isEmailVerified };
}
