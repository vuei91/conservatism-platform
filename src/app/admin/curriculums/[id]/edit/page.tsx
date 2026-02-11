"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  Button,
  Input,
  Card,
  CardContent,
  Skeleton,
  Badge,
} from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { useLectures } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { getDifficultyLabel } from "@/lib/utils";
import type { Lecture, Category } from "@/types/database";

const curriculumSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  description: z.string().optional(),
  learning_goals: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});

type CurriculumForm = z.infer<typeof curriculumSchema>;

interface CurriculumLecture {
  id: string;
  lecture_id: string;
  order: number;
  lecture: Lecture & { category: Category | null };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCurriculumPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: allLectures = [] } = useLectures({ includeUnpublished: true });
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [curriculumLectures, setCurriculumLectures] = useState<
    CurriculumLecture[]
  >([]);
  const [showLectureSelector, setShowLectureSelector] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CurriculumForm>({
    resolver: zodResolver(curriculumSchema),
  });

  useEffect(() => {
    const fetchCurriculum = async () => {
      const supabase = createClient();

      // 커리큘럼 정보 가져오기
      const { data: curriculum, error: currError } = await supabase
        .from("curriculums")
        .select("*")
        .eq("id", id)
        .single();

      if (currError || !curriculum) {
        setError("커리큘럼을 찾을 수 없습니다");
        setIsDataLoading(false);
        return;
      }

      reset({
        title: curriculum.title,
        description: curriculum.description || "",
        learning_goals: curriculum.learning_goals || "",
        difficulty: curriculum.difficulty as
          | "beginner"
          | "intermediate"
          | "advanced",
        is_published: curriculum.is_published,
        is_featured: curriculum.is_featured,
      });

      // 커리큘럼에 포함된 강의 가져오기
      const { data: lectures } = await supabase
        .from("curriculum_lectures")
        .select("*, lecture:lectures(*, category:categories(*))")
        .eq("curriculum_id", id)
        .order("order", { ascending: true });

      if (lectures) {
        setCurriculumLectures(lectures as CurriculumLecture[]);
      }

      setIsDataLoading(false);
    };

    fetchCurriculum();
  }, [id, reset]);

  const onSubmit = async (data: CurriculumForm) => {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("curriculums")
      .update({
        title: data.title,
        description: data.description || null,
        learning_goals: data.learning_goals || null,
        difficulty: data.difficulty,
        is_published: data.is_published,
        is_featured: data.is_featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["curriculums"] });
    router.push("/admin/curriculums");
  };

  const addLecture = async (lectureId: string) => {
    const supabase = createClient();
    const newOrder = curriculumLectures.length;

    const { data, error } = await supabase
      .from("curriculum_lectures")
      .insert({
        curriculum_id: id,
        lecture_id: lectureId,
        order: newOrder,
      })
      .select("*, lecture:lectures(*, category:categories(*))")
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setCurriculumLectures([...curriculumLectures, data as CurriculumLecture]);
    setShowLectureSelector(false);
  };

  const removeLecture = async (curriculumLectureId: string) => {
    if (!confirm("이 강의를 커리큘럼에서 제거하시겠습니까?")) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("curriculum_lectures")
      .delete()
      .eq("id", curriculumLectureId);

    if (error) {
      setError(error.message);
      return;
    }

    setCurriculumLectures(
      curriculumLectures.filter((cl) => cl.id !== curriculumLectureId),
    );
  };

  // 이미 추가된 강의 ID 목록
  const addedLectureIds = curriculumLectures.map((cl) => cl.lecture_id);
  const availableLectures = allLectures.filter(
    (l) => !addedLectureIds.includes(l.id),
  );

  if (isDataLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-10 w-48" />
        <Card>
          <CardContent className="p-6 space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">커리큘럼 수정</h1>
        <p className="mt-2 text-gray-600">
          커리큘럼 정보를 수정하고 강의를 관리하세요
        </p>
      </div>

      {/* 기본 정보 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold">기본 정보</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="커리큘럼 제목 *"
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
                학습 목표
              </label>
              <textarea
                {...register("learning_goals")}
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
                <span className="text-sm text-gray-700">추천 커리큘럼</span>
              </label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "저장 중..." : "저장"}
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

      {/* 강의 목록 */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              포함된 강의 ({curriculumLectures.length}개)
            </h2>
            <Button size="sm" onClick={() => setShowLectureSelector(true)}>
              <Plus className="mr-1 h-4 w-4" />
              강의 추가
            </Button>
          </div>

          {curriculumLectures.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              아직 추가된 강의가 없습니다.
            </p>
          ) : (
            <div className="space-y-2">
              {curriculumLectures.map((cl, index) => (
                <div
                  key={cl.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                >
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <span className="w-6 text-center text-sm text-gray-500">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {cl.lecture.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {cl.lecture.category && (
                        <Badge variant="info" className="text-xs">
                          {cl.lecture.category.name}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        {getDifficultyLabel(cl.lecture.difficulty)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLecture(cl.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 강의 선택 모달 */}
      {showLectureSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-lg bg-white">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold">강의 추가</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLectureSelector(false)}
              >
                닫기
              </Button>
            </div>
            <div className="overflow-y-auto p-4" style={{ maxHeight: "60vh" }}>
              {availableLectures.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  추가할 수 있는 강의가 없습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableLectures.map((lecture) => (
                    <button
                      key={lecture.id}
                      onClick={() => addLecture(lecture.id)}
                      className="w-full text-left rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
                    >
                      <p className="font-medium text-gray-900">
                        {lecture.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {lecture.category && (
                          <Badge variant="info" className="text-xs">
                            {lecture.category.name}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {getDifficultyLabel(lecture.difficulty)}
                        </span>
                        {!lecture.is_published && (
                          <Badge variant="warning" className="text-xs">
                            비공개
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
