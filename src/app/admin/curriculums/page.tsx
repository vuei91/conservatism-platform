"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Eye, EyeOff, Star, BookOpen } from "lucide-react";
import { Button, Card, CardContent, Badge, Skeleton } from "@/components/ui";
import { useCurriculums } from "@/hooks";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { getDifficultyLabel } from "@/lib/utils";

export default function AdminCurriculumsPage() {
  const { data: curriculums = [], isLoading } = useCurriculums();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("lectures").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["curriculums"] });
    setDeletingId(null);
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    await supabase
      .from("lectures")
      .update({ is_published: !currentStatus })
      .eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["curriculums"] });
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    await supabase
      .from("lectures")
      .update({ is_featured: !currentStatus })
      .eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["curriculums"] });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">커리큘럼 관리</h1>
          <p className="mt-2 text-gray-600">커리큘럼을 생성하고 관리하세요</p>
        </div>
        <Link href="/admin/curriculums/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            커리큘럼 생성
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : curriculums.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">등록된 커리큘럼이 없습니다.</p>
            <Link href="/admin/curriculums/new">
              <Button className="mt-4">첫 커리큘럼 생성하기</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {curriculums.map((curriculum) => (
            <Card
              key={curriculum.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <Link
                  href={`/admin/curriculums/${curriculum.id}/edit`}
                  className="flex flex-1 items-center gap-4 min-w-0"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {curriculum.title}
                      </h3>
                      {!curriculum.is_published && (
                        <Badge variant="warning">비공개</Badge>
                      )}
                      {curriculum.is_featured && (
                        <Badge variant="info">추천</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      <span>{getDifficultyLabel(curriculum.difficulty)}</span>
                      <span>•</span>
                      <span>{curriculum.lectureCount}개 강의</span>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFeatured(curriculum.id, curriculum.is_featured);
                    }}
                    title={curriculum.is_featured ? "추천 해제" : "추천 설정"}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        curriculum.is_featured
                          ? "fill-yellow-400 text-yellow-400"
                          : ""
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      togglePublish(curriculum.id, curriculum.is_published);
                    }}
                    title={
                      curriculum.is_published ? "비공개로 전환" : "공개로 전환"
                    }
                  >
                    {curriculum.is_published ? (
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
                      handleDelete(curriculum.id);
                    }}
                    disabled={deletingId === curriculum.id}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
