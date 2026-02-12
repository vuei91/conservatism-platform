"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Shield, User, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  Skeleton,
  Modal,
  Input,
} from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export default function MembersPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const [members, setMembers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleDeleteMember = async () => {
    if (!deleteTarget || deleteConfirmation !== "강제탈퇴") return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch("/api/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deleteTarget.id, isAdmin: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteError(data.error || "회원 삭제에 실패했습니다.");
        setIsDeleting(false);
        return;
      }

      // 목록에서 제거
      setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleteConfirmation("");
    } catch {
      setDeleteError("서버 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
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
                    <>
                      <Button
                        size="sm"
                        variant={
                          member.role === "admin" ? "outline" : "primary"
                        }
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteTarget(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteConfirmation("");
          setDeleteError(null);
        }}
        title="회원 강제 탈퇴"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <p className="font-medium text-red-800">
                {deleteTarget?.name || deleteTarget?.email} 회원을
                탈퇴시키시겠습니까?
              </p>
              <ul className="mt-2 space-y-1 text-sm text-red-700">
                <li>• 해당 회원의 모든 데이터가 삭제됩니다.</li>
                <li>• 이 작업은 되돌릴 수 없습니다.</li>
              </ul>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm text-gray-600">
              강제 탈퇴를 확인하려면{" "}
              <span className="font-semibold text-red-600">강제탈퇴</span>를
              입력해주세요.
            </p>
            <Input
              type="text"
              placeholder="강제탈퇴"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
            />
          </div>

          {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteConfirmation("");
                setDeleteError(null);
              }}
            >
              취소
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteConfirmation !== "강제탈퇴" || isDeleting}
              onClick={handleDeleteMember}
            >
              {isDeleting ? "처리 중..." : "강제 탈퇴"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
