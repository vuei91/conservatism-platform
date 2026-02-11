"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setIsLoading(false);
      return;
    }

    // 강제로 페이지 새로고침하여 서버 컴포넌트 갱신
    window.location.href = "/";
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
            <h1 className="text-2xl font-bold text-gray-900">로그인</h1>
            <p className="mt-2 text-sm text-gray-600">
              계정에 로그인하여 학습을 계속하세요
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-4 text-sm text-gray-500">또는</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <Button type="button" variant="outline" className="w-full" disabled>
            X(Twitter)로 로그인 (준비중)
          </Button>

          <p className="mt-6 text-center text-sm text-gray-600">
            계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:underline"
            >
              회원가입
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
