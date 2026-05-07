"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Eye, EyeOff, Star, Layers, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Card, CardContent, Badge, Skeleton } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDifficultyLabel } from "@/lib/utils";

const PAGE_SIZE = 10;

function useLectureGroups() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["lecture-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lectures")
        .select("*, lecture_videos(id)")
        .order("order", { ascending: true });
      if (error) throw error;
      return data.map((l) => ({
        ...l,
        videoCount: l.lecture_videos?.length || 0,
      }));
    },
  });
}

export default function AdminLectureGroupsPage() {
  const { data: lectures = [], isLoading } = useLectureGroups();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(lectures.length / PAGE_SIZE);
  const paginatedLectures = lectures.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까? 포함된 영상 연결도 해제됩니다."))
      return;
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("lectures").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["lecture-groups"] });
    setDeletingId(null);
  };

  const togglePublish = async (id: string, current: boolean) => {
    const supabase = createClient();
    await supabase
      .from("lectures")
      .update({ is_published: !current })
      .eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["lecture-groups"] });
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    const supabase = createClient();
    await supabase
      .from("lectures")
      .update({ is_featured: !current })
      .eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["lecture-groups"] });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">강의 관리</h1>
          <p className="mt-2 text-gray-600">
            영상을 묶어 강의를 만들고 관리하세요
          </p>
        </div>
        <Link href="/admin/lecture-groups/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            강의 생성
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : lectures.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">등록된 강의가 없습니다.</p>
            <Link href="/admin/lecture-groups/new">
              <Button className="mt-4">첫 강의 생성하기</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">
            총 {lectures.length}개 강의
          </p>
          <div className="space-y-4">
            {paginatedLectures.map((lecture) => (
            <Card
              key={lecture.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <Link
                  href={`/admin/lecture-groups/${lecture.id}/edit`}
                  className="flex flex-1 items-center gap-4 min-w-0"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                    <Layers className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {lecture.title}
                      </h3>
                      {!lecture.is_published && (
                        <Badge variant="warning">비공개</Badge>
                      )}
                      {lecture.is_featured && (
                        <Badge variant="info">추천</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <span>{getDifficultyLabel(lecture.difficulty)}</span>
                      <span>•</span>
                      <span>{lecture.videoCount}개 영상</span>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFeatured(lecture.id, lecture.is_featured);
                    }}
                    title={lecture.is_featured ? "추천 해제" : "추천 설정"}
                  >
                    <Star
                      className={`h-4 w-4 ${lecture.is_featured ? "fill-yellow-400 text-yellow-400" : ""}`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      togglePublish(lecture.id, lecture.is_published);
                    }}
                    title={
                      lecture.is_published ? "비공개로 전환" : "공개로 전환"
                    }
                  >
                    {lecture.is_published ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(lecture.id);
                    }}
                    disabled={deletingId === lecture.id}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
          {totalPages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {getPageNumbers(currentPage, totalPages).map((page, i) =>
                page === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-sm text-gray-400">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={page === currentPage ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page as number)}
                    className="min-w-[36px]"
                  >
                    {page}
                  </Button>
                ),
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
