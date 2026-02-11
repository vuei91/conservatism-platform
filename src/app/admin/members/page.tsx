"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, User } from "lucide-react";
import Link from "next/link";
import { Button, Card, CardContent, Skeleton } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export default function MembersPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const [members, setMembers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const fetchMembers = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setMembers(data);
      setIsLoading(false);
    };

    if (user?.role === "admin") {
      fetchMembers();
    }
  }, [user]);

  const handleRoleChange = async (
    memberId: string,
    newRole: "user" | "admin",
  ) => {
    if (memberId === user?.id) {
      alert("자신의 권한은 변경할 수 없습니다.");
      return;
    }

    setUpdatingId(memberId);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", memberId);

    if (error) {
      alert("권한 변경에 실패했습니다.");
    } else {
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
      );
    }
    setUpdatingId(null);
  };

  if (isAuthLoading || !user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          관리자 대시보드
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">멤버 관리</h1>
        <p className="mt-1 text-gray-600">멤버의 권한을 관리합니다.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <Card key={member.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-full p-2 ${
                      member.role === "admin"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {member.role === "admin" ? (
                      <Shield className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.name || "이름 없음"}
                      {member.id === user.id && (
                        <span className="ml-2 text-xs text-gray-500">(나)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      member.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {member.role === "admin" ? "관리자" : "일반 사용자"}
                  </span>

                  {member.id !== user.id && (
                    <Button
                      size="sm"
                      variant={member.role === "admin" ? "outline" : "primary"}
                      disabled={updatingId === member.id}
                      onClick={() =>
                        handleRoleChange(
                          member.id,
                          member.role === "admin" ? "user" : "admin",
                        )
                      }
                    >
                      {updatingId === member.id
                        ? "변경 중..."
                        : member.role === "admin"
                          ? "일반으로 변경"
                          : "관리자로 변경"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
