"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

const signupSchema = z
  .object({
    email: z.string().email("올바른 이메일을 입력하세요"),
    password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
    confirmPassword: z.string(),
    name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "이용약관에 동의해주세요",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    // 이메일 중복 체크
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", data.email)
      .single();

    if (existingUser) {
      setError("이미 가입된 이메일입니다.");
      setIsLoading(false);
      return;
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    });

    if (error) {
      // 에러 메시지 한글화
      if (
        error.message.includes("already registered") ||
        error.message.includes("already been registered")
      ) {
        setError("이미 가입된 이메일입니다.");
      } else if (error.message.includes("invalid email")) {
        setError("올바른 이메일 형식이 아닙니다.");
      } else if (error.message.includes("password")) {
        setError("비밀번호는 6자 이상이어야 합니다.");
      } else {
        setError("회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }
      setIsLoading(false);
      return;
    }

    // Resend를 통해 인증 메일 발송
    if (authData.user) {
      const res = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          userId: authData.user.id,
        }),
      });

      if (!res.ok) {
        // 메일 발송 실패 시 세션 정리 (미인증 상태로 로그인 방지)
        await supabase.auth.signOut();
        setError("인증 메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
        setIsLoading(false);
        return;
      }

      setSignupEmail(data.email);
      setShowEmailModal(true);
      // 이메일 인증 전까지 로그인 방지
      await supabase.auth.signOut();
      setIsLoading(false);
    } else {
      router.refresh();
      router.push("/");
    }
  };

  const handleSocialLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      {/* 이메일 인증 안내 모달 */}
      {showEmailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-verify-title"
        >
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2
              id="email-verify-title"
              className="mb-2 text-xl font-bold text-gray-900"
            >
              이메일 인증을 완료해주세요
            </h2>
            <p className="mb-1 text-sm text-gray-600">
              <span className="font-medium text-gray-900">{signupEmail}</span>
              (으)로
            </p>
            <p className="mb-6 text-sm text-gray-600">
              인증 메일을 발송했습니다. 메일함을 확인해주세요.
            </p>
            <Button
              type="button"
              className="w-full"
              onClick={() => router.push("/login")}
            >
              로그인 페이지로 이동
            </Button>
            <p className="mt-3 text-xs text-gray-400">
              메일이 오지 않으면 스팸함을 확인해주세요
            </p>
          </div>
        </div>
      )}

      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
            <p className="mt-2 text-sm text-gray-600">
              계정을 만들어 학습 기록을 저장하세요
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="이름(닉네임)"
              type="text"
              {...register("name")}
              error={errors.name?.message}
            />
            <Input
              label="이메일"
              type="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              label="비밀번호"
              type="password"
              {...register("password")}
              error={errors.password?.message}
            />
            <Input
              label="비밀번호 확인"
              type="password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />

            <div className="space-y-2">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  {...register("agreeTerms")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    이용약관
                  </Link>
                  {" 및 "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    개인정보처리방침
                  </Link>
                  에 동의합니다.
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-sm text-red-500">
                  {errors.agreeTerms.message}
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "가입 중..." : "회원가입"}
            </Button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-4 text-sm text-gray-500">또는</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <Button type="button" variant="outline" className="w-full" disabled>
            X(Twitter)로 가입 (준비중)
          </Button>

          <p className="mt-6 text-center text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              로그인
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
