"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, User, Lock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";

const profileSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "현재 비밀번호를 입력하세요"),
    newPassword: z.string().min(6, "새 비밀번호는 6자 이상이어야 합니다"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Profile state
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Password state
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user) {
      profileForm.reset({ name: user.name || "" });
    }
  }, [user, authLoading, router, profileForm]);

  const onProfileSubmit = async (data: ProfileForm) => {
    setIsProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);

    const supabase = createClient();

    // Update auth metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: { name: data.name },
    });

    if (authError) {
      setProfileError("프로필 업데이트에 실패했습니다.");
      setIsProfileLoading(false);
      return;
    }

    // Update profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ name: data.name, updated_at: new Date().toISOString() })
      .eq("id", user!.id);

    if (profileError) {
      setProfileError("프로필 업데이트에 실패했습니다.");
      setIsProfileLoading(false);
      return;
    }

    setProfileSuccess(true);
    setIsProfileLoading(false);

    // Refresh user data
    window.location.reload();
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setIsPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    const supabase = createClient();

    // 현재 비밀번호 확인을 위해 재로그인 시도
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user!.email,
      password: data.currentPassword,
    });

    if (signInError) {
      setPasswordError("현재 비밀번호가 올바르지 않습니다.");
      setIsPasswordLoading(false);
      return;
    }

    // 새 비밀번호로 업데이트
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (updateError) {
      console.error("Password update error:", updateError.message);

      if (
        updateError.message.includes("same as") ||
        updateError.message.includes("different from")
      ) {
        setPasswordError("새 비밀번호는 기존 비밀번호와 달라야 합니다.");
      } else if (
        updateError.message.includes("at least") ||
        updateError.message.includes("too short")
      ) {
        setPasswordError("비밀번호는 6자 이상이어야 합니다.");
      } else if (updateError.message.includes("weak")) {
        setPasswordError(
          "비밀번호가 너무 약합니다. 더 복잡한 비밀번호를 사용해주세요.",
        );
      } else {
        setPasswordError(`비밀번호 변경 실패: ${updateError.message}`);
      }
      setIsPasswordLoading(false);
      return;
    }

    setPasswordSuccess(true);
    setIsPasswordLoading(false);
    passwordForm.reset();
  };

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-8 h-8 w-32 rounded bg-gray-200" />
          <div className="h-64 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/mypage"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          마이페이지로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">프로필 설정</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <User className="h-4 w-4" />
          프로필 정보
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "password"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Lock className="h-4 w-4" />
          비밀번호 변경
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <Card>
          <CardContent className="p-6">
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  이메일은 변경할 수 없습니다.
                </p>
              </div>

              <Input
                label="이름(닉네임)"
                type="text"
                {...profileForm.register("name")}
                error={profileForm.formState.errors.name?.message}
              />

              {profileError && (
                <p className="text-sm text-red-500">{profileError}</p>
              )}
              {profileSuccess && (
                <p className="text-sm text-green-600">
                  프로필이 업데이트되었습니다.
                </p>
              )}

              <Button type="submit" disabled={isProfileLoading}>
                {isProfileLoading ? "저장 중..." : "프로필 저장"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <Card>
          <CardContent className="p-6">
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <Input
                label="현재 비밀번호"
                type="password"
                {...passwordForm.register("currentPassword")}
                error={passwordForm.formState.errors.currentPassword?.message}
              />

              <Input
                label="새 비밀번호"
                type="password"
                placeholder="6자 이상 입력"
                {...passwordForm.register("newPassword")}
                error={passwordForm.formState.errors.newPassword?.message}
              />

              <Input
                label="새 비밀번호 확인"
                type="password"
                placeholder="새 비밀번호를 다시 입력"
                {...passwordForm.register("confirmPassword")}
                error={passwordForm.formState.errors.confirmPassword?.message}
              />

              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm text-green-600">
                  비밀번호가 변경되었습니다.
                </p>
              )}

              <Button type="submit" disabled={isPasswordLoading}>
                {isPasswordLoading ? "변경 중..." : "비밀번호 변경"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
