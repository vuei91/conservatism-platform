"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  FolderOpen,
  Users,
  BarChart3,
  Video,
  Layers,
} from "lucide-react";
import { Card, CardContent, Skeleton } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      title: "영상 관리",
      description: "영상 등록, 수정, 삭제",
      icon: Video,
      href: "/admin/lectures",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "강의 관리",
      description: "영상을 묶어 강의 생성 및 관리",
      icon: Layers,
      href: "/admin/lecture-groups",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "커리큘럼 관리",
      description: "강의를 묶어 커리큘럼 생성 및 관리",
      icon: FolderOpen,
      href: "/admin/curriculums",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "카테고리 관리",
      description: "카테고리 추가 및 수정",
      icon: BookOpen,
      href: "/admin/categories",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "멤버 관리",
      description: "멤버 권한 관리",
      icon: Users,
      href: "/admin/members",
      color: "bg-pink-100 text-pink-600",
    },
    {
      title: "통계",
      description: "방문자 및 시청 통계",
      icon: BarChart3,
      href: "/admin/stats",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="mt-2 text-gray-600">플랫폼 콘텐츠를 관리하세요</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div
                  className={`mb-4 inline-flex rounded-lg p-3 ${item.color}`}
                >
                  <item.icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{item.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
