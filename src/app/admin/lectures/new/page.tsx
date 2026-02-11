"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { useCategories } from "@/hooks";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/utils";

const lectureSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  youtube_url: z.string().url("올바른 URL을 입력하세요"),
  description: z.string().optional(),
  category_id: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  instructor: z.string().optional(),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});

type LectureForm = z.infer<typeof lectureSchema>;

export default function NewLecturePage() {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LectureForm>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      difficulty: "beginner",
      is_published: true,
      is_featured: false,
    },
  });

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
    const { error } = await supabase.from("lectures").insert({
      title: data.title,
      youtube_url: data.youtube_url,
      youtube_id: youtubeId,
      thumbnail_url: getYouTubeThumbnail(youtubeId),
      description: data.description || null,
      category_id: data.category_id || null,
      difficulty: data.difficulty,
      instructor: data.instructor || null,
      is_published: data.is_published,
      is_featured: data.is_featured,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/admin/lectures");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">강의 등록</h1>
        <p className="mt-2 text-gray-600">새로운 강의를 등록하세요</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="강의 제목 *"
              {...register("title")}
              error={errors.title?.message}
            />

            <Input
              label="유튜브 URL *"
              placeholder="https://www.youtube.com/watch?v=..."
              {...register("youtube_url")}
              error={errors.youtube_url?.message}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                강의 설명
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
                <span className="text-sm text-gray-700">추천 강의</span>
              </label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "등록 중..." : "강의 등록"}
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
