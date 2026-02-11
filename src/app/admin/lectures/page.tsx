"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit2, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { Button, Card, CardContent, Badge, Skeleton } from "@/components/ui";
import { useLectures } from "@/hooks";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { getDifficultyLabel, getYouTubeThumbnail } from "@/lib/utils";

export default function AdminLecturesPage() {
  const { data: lectures = [], isLoading } = useLectures({
    includeUnpublished: true,
  });
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("lectures").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["lectures"] });
    setDeletingId(null);
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    await supabase
      .from("lectures")
      .update({ is_published: !currentStatus })
      .eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["lectures"] });
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    const supabase = createClient();
    await supabase
      .from("lectures")
      .update({ is_featured: !currentStatus })
      .eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["lectures"] });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">강의 관리</h1>
          <p className="mt-2 text-gray-600">강의를 등록하고 관리하세요</p>
        </div>
        <Link href="/admin/lectures/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            강의 등록
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
            <Link href="/admin/lectures/new">
              <Button className="mt-4">첫 강의 등록하기</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lectures.map((lecture) => (
            <Card key={lecture.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                  <Image
                    src={
                      lecture.thumbnail_url ||
                      getYouTubeThumbnail(lecture.youtube_id)
                    }
                    alt={lecture.title}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {lecture.title}
                    </h3>
                    {!lecture.is_published && (
                      <Badge variant="warning">비공개</Badge>
                    )}
                    {lecture.is_featured && <Badge variant="info">추천</Badge>}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    {lecture.category && <span>{lecture.category.name}</span>}
                    <span>•</span>
                    <span>{getDifficultyLabel(lecture.difficulty)}</span>
                    <span>•</span>
                    <span>조회수 {lecture.view_count}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      toggleFeatured(lecture.id, lecture.is_featured)
                    }
                    title={lecture.is_featured ? "추천 해제" : "추천 설정"}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        lecture.is_featured
                          ? "fill-yellow-400 text-yellow-400"
                          : ""
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      togglePublish(lecture.id, lecture.is_published)
                    }
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
                  <Link href={`/admin/lectures/${lecture.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(lecture.id)}
                    disabled={deletingId === lecture.id}
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
