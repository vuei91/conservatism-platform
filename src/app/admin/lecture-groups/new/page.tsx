"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  description: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function NewLectureGroupPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      difficulty: "beginner",
      is_published: true,
      is_featured: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: created, error } = await supabase
      .from("lectures")
      .insert({
        title: data.title,
        description: data.description || null,
        difficulty: data.difficulty,
        is_published: data.is_published,
        is_featured: data.is_featured,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["lecture-groups"] });
    router.push(`/admin/lecture-groups/${created.id}/edit`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">강의 생성</h1>
        <p className="mt-2 text-gray-600">새로운 강의를 생성하세요</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="강의 제목 *"
              {...register("title")}
              error={errors.title?.message}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                설명
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
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
                {isLoading ? "생성 중..." : "생성 후 영상 추가"}
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
