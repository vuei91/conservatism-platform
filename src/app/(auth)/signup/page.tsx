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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
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

    // 이메일 확인이 필요한 경우
    if (authData.user && !authData.session) {
      router.push("/login?message=이메일을 확인하여 가입을 완료하세요");
    } else {
      // 이메일 확인 없이 바로 로그인된 경우
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
