"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  BookOpen,
  Eye,
  FolderOpen,
  FileText,
  Heart,
} from "lucide-react";
import { Card, CardContent, Skeleton } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";

interface Stats {
  totalUsers: number;
  totalLectures: number;
  totalCurriculums: number;
  totalViews: number;
  totalNotes: number;
  totalFavorites: number;
  recentUsers: number;
  topLectures: { id: string; title: string; view_count: number }[];
}

export default function StatsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isAuthLoading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();

      const [
        { count: totalUsers },
        { count: totalLectures },
        { count: totalCurriculums },
        { data: lectures },
        { count: totalNotes },
        { count: totalFavorites },
        { count: recentUsers },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("videos").select("*", { count: "exact", head: true }),
        supabase.from("lectures").select("*", { count: "exact", head: true }),
        supabase
          .from("videos")
          .select("id, title, view_count")
          .order("view_count", { ascending: false })
          .limit(5),
        supabase.from("notes").select("*", { count: "exact", head: true }),
        supabase.from("favorites").select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte(
            "created_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          ),
      ]);

      const totalViews =
        lectures?.reduce((sum, l) => sum + (l.view_count || 0), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalLectures: totalLectures || 0,
        totalCurriculums: totalCurriculums || 0,
        totalViews,
        totalNotes: totalNotes || 0,
        totalFavorites: totalFavorites || 0,
        recentUsers: recentUsers || 0,
        topLectures: lectures || [],
      });
      setIsLoading(false);
    };

    if (user?.role === "admin") {
      fetchStats();
    }
  }, [user]);

  if (isAuthLoading || !user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "전체 회원",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-sequoia-100 text-sequoia-600",
    },
    {
      label: "최근 7일 가입",
      value: stats?.recentUsers || 0,
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "전체 강의",
      value: stats?.totalLectures || 0,
      icon: BookOpen,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "전체 커리큘럼",
      value: stats?.totalCurriculums || 0,
      icon: FolderOpen,
      color: "bg-orange-100 text-orange-600",
    },
    {
      label: "총 조회수",
      value: stats?.totalViews || 0,
      icon: Eye,
      color: "bg-pink-100 text-pink-600",
    },
    {
      label: "작성된 노트",
      value: stats?.totalNotes || 0,
      icon: FileText,
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      label: "즐겨찾기",
      value: stats?.totalFavorites || 0,
      icon: Heart,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
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
        <h1 className="text-2xl font-bold text-gray-900">통계</h1>
        <p className="mt-1 text-gray-600">플랫폼 현황을 확인하세요.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div
                    className={`mb-2 inline-flex rounded-lg p-2 ${stat.color}`}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              인기 강의 TOP 5
            </h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {stats?.topLectures.map((lecture, index) => (
                    <div
                      key={lecture.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium ${
                            index === 0
                              ? "bg-yellow-100 text-yellow-700"
                              : index === 1
                                ? "bg-gray-100 text-gray-700"
                                : index === 2
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-50 text-gray-500"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="text-gray-900">{lecture.title}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {lecture.view_count.toLocaleString()}회
                      </span>
                    </div>
                  ))}
                  {stats?.topLectures.length === 0 && (
                    <p className="p-4 text-center text-gray-500">
                      강의가 없습니다.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
