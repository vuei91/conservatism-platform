"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { useCategories } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/utils";

const lectureSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  youtube_url: z.string().url("올바른 URL을 입력하세요"),
  description: z.string().optional(),
  category_id: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  instructor: z.string().optional(),
  duration: z.number().optional(),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});

type LectureForm = z.infer<typeof lectureSchema>;

export default function NewLecturePage() {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LectureForm>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      difficulty: "beginner",
      is_published: true,
      is_featured: false,
    },
  });

  const youtubeUrl = watch("youtube_url");

  const fetchYouTubeInfo = async () => {
    if (!youtubeUrl) return;

    setIsFetching(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/youtube?url=${encodeURIComponent(youtubeUrl)}`,
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "영상 정보를 가져올 수 없습니다");
        return;
      }

      setValue("title", data.title);
      setValue("description", data.description || "");
      setValue("instructor", data.channelTitle);
      if (data.duration) {
        setValue("duration", data.duration);
      }
    } catch {
      setError("영상 정보를 가져오는 중 오류가 발생했습니다");
    } finally {
      setIsFetching(false);
    }
  };

  const onSubmit = async (data: LectureForm) => {
    setIsLoading(true);
    setError(null);

    const youtubeId = extractYouTubeId(data.youtube_url);
    if (!youtubeId) {
      setError("올바른 유튜브 URL을 입력하세요");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("로그인이 필요합니다");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.from("videos").insert({
      title: data.title,
      youtube_url: data.youtube_url,
      youtube_id: youtubeId,
      thumbnail_url: getYouTubeThumbnail(youtubeId),
      description: data.description || null,
      category_id: data.category_id || null,
      difficulty: data.difficulty,
      instructor: data.instructor || null,
      duration: data.duration || null,
      is_published: data.is_published,
      is_featured: data.is_featured,
    });

    if (error) {
      console.error("Lecture insert error:", error);
      if (error.code === "42501" || error.message.includes("policy")) {
        setError("권한이 없습니다. 관리자 계정으로 로그인했는지 확인하세요.");
      } else {
        setError(`등록 실패: ${error.message}`);
      }
      setIsLoading(false);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["lectures"] });
    router.push("/admin/lectures");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">영상 등록</h1>
        <p className="mt-2 text-gray-600">새로운 영상을 등록하세요</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                유튜브 URL *
              </label>
              <div className="flex gap-2">
                <input
                  {...register("youtube_url")}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchYouTubeInfo}
                  disabled={isFetching || !youtubeUrl}
                >
                  {isFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "정보 가져오기"
                  )}
                </Button>
              </div>
              {errors.youtube_url && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.youtube_url.message}
                </p>
              )}
            </div>

            <Input
              label="영상 제목 *"
              {...register("title")}
              error={errors.title?.message}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                영상 설명
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                카테고리
              </label>
              <select
                {...register("category_id")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">선택 안함</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                난이도 *
              </label>
              <select
                {...register("difficulty")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="beginner">입문</option>
                <option value="intermediate">중급</option>
                <option value="advanced">심화</option>
              </select>
            </div>

            <Input label="강사명" {...register("instructor")} />

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("is_published")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">공개</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register("is_featured")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">추천 영상</span>
              </label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "등록 중..." : "영상 등록"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
