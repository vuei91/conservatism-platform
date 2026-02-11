"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      const supabase = createClient();

      // URL 해시에서 토큰 정보 확인 (Supabase가 #access_token=... 형태로 전달)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      // URL 파라미터에서 code 확인 (PKCE 플로우)
      const code = searchParams.get("code");

      if (code) {
        // PKCE 플로우: code를 세션으로 교환
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setIsValidSession(false);
          return;
        }
        setIsValidSession(true);
        // URL에서 code 제거
        router.replace("/reset-password");
        return;
      }

      if (accessToken && refreshToken && type === "recovery") {
        // 해시 기반 토큰으로 세션 설정
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          setIsValidSession(false);
          return;
        }

        setIsValidSession(true);
        // URL 해시 제거
        window.history.replaceState(null, "", "/reset-password");
        return;
      }

      // 이미 세션이 있는지 확인
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };

    handleAuth();
  }, [router, searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      console.error("Password update error:", error.message);

      if (
        error.message.includes("same as") ||
        error.message.includes("different from")
      ) {
        setError("새 비밀번호는 기존 비밀번호와 달라야 합니다.");
      } else if (
        error.message.includes("at least") ||
        error.message.includes("too short")
      ) {
        setError("비밀번호는 6자 이상이어야 합니다.");
      } else if (
        error.message.includes("session") ||
        error.message.includes("token")
      ) {
        setError("세션이 만료되었습니다. 비밀번호 찾기를 다시 진행해주세요.");
      } else if (error.message.includes("weak")) {
        setError(
          "비밀번호가 너무 약합니다. 더 복잡한 비밀번호를 사용해주세요.",
        );
      } else {
        setError(`비밀번호 변경 실패: ${error.message}`);
      }
      setIsLoading(false);
      return;
    }

    // 로그아웃 처리 (새 비밀번호로 다시 로그인하도록)
    await supabase.auth.signOut();

    setSuccess(true);
    setIsLoading(false);
  };

  // 세션 확인 중
  if (isValidSession === null) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-gray-500">확인 중...</div>
      </div>
    );
  }

  // 유효하지 않은 접근
  if (!isValidSession) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                유효하지 않은 링크
              </h1>
              <p className="mt-4 text-sm text-gray-600">
                비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.
                <br />
                다시 비밀번호 찾기를 진행해주세요.
              </p>
              <Link href="/forgot-password">
                <Button className="mt-6 w-full">비밀번호 찾기</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 비밀번호 변경 성공
  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                비밀번호 변경 완료
              </h1>
              <p className="mt-4 text-sm text-gray-600">
                비밀번호가 성공적으로 변경되었습니다.
                <br />새 비밀번호로 로그인해주세요.
              </p>
              <Link href="/login">
                <Button className="mt-6 w-full">로그인하기</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              새 비밀번호 설정
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              새로운 비밀번호를 입력해주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="새 비밀번호"
              type="password"
              placeholder="6자 이상 입력"
              {...register("password")}
              error={errors.password?.message}
            />
            <Input
              label="새 비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
