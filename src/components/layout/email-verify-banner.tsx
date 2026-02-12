"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";

export function EmailVerifyBanner() {
  const { user, isEmailVerified } = useAuthStore();
  const [dismissed, setDismissed] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || isEmailVerified || dismissed) return null;

  const handleResend = async () => {
    setIsSending(true);
    setError(null);
    const supabase = createClient();

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });

    setIsSending(false);
    if (resendError) {
      if (resendError.message.includes("rate limit")) {
        setError("잠시 후 다시 시도해주세요");
      } else {
        setError("발송 실패");
      }
    } else {
      setSent(true);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              이메일 인증이 완료되지 않았습니다.{" "}
              <span className="font-medium">{user.email}</span>로 발송된 인증
              메일을 확인해주세요.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {error ? (
              <span className="text-sm text-red-600">{error}</span>
            ) : sent ? (
              <span className="text-sm text-green-600">
                인증 메일 발송 완료
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={isSending}
                className="text-sm font-medium text-amber-700 hover:text-amber-900 disabled:opacity-50"
              >
                {isSending ? "발송 중..." : "인증 메일 재발송"}
              </button>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-amber-600 hover:text-amber-800"
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
