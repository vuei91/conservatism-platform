"use client";

import { useState, useEffect, use, useRef } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { getDifficultyLabel } from "@/lib/utils";
import type { Lecture } from "@/types/database";

const curriculumSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  description: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});

type CurriculumForm = z.infer<typeof curriculumSchema>;

interface CurriculumLectureItem {
  id: string;
  lecture_id: string;
  order: number;
  lecture: Lecture & { videoCount?: number };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCurriculumPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [curriculumLectures, setCurriculumLectures] = useState<
    CurriculumLectureItem[]
  >([]);
  const [originalIds, setOriginalIds] = useState<string[]>([]);
  const [allLectures, setAllLectures] = useState<
    (Lecture & { videoCount: number })[]
  >([]);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<"above" | "below" | null>(
    null,
  );
  const [isButtonFixed, setIsButtonFixed] = useState(true);
  const buttonAreaRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CurriculumForm>({
    resolver: zodResolver(curriculumSchema),
  });

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector("footer");
      if (!footer || !buttonAreaRef.current) return;
      const footerRect = footer.getBoundingClientRect();
      setIsButtonFixed(footerRect.top > window.innerHeight);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // 커리큘럼 정보
      const { data: curriculum, error: currErr } = await supabase
        .from("curriculums")
        .select("*")
        .eq("id", id)
        .single();

      if (currErr || !curriculum) {
        setError("커리큘럼을 찾을 수 없습니다");
        setIsDataLoading(false);
        return;
      }

      reset({
        title: curriculum.title,
        description: curriculum.description || "",
        difficulty: curriculum.difficulty as
          | "beginner"
          | "intermediate"
          | "advanced",
        is_published: curriculum.is_published,
        is_featured: curriculum.is_featured,
      });

      // 커리큘럼에 포함된 강의
      const { data: clData } = await supabase
        .from("curriculum_lectures")
        .select("*, lecture:lectures(*, lecture_videos(id))")
        .eq("curriculum_id", id)
        .order("order", { ascending: true });

      if (clData) {
        const mapped = clData.map((cl) => ({
          id: cl.id,
          lecture_id: cl.lecture_id,
          order: cl.order,
          lecture: {
            ...cl.lecture,
            videoCount: cl.lecture?.lecture_videos?.length || 0,
          },
        })) as CurriculumLectureItem[];
        setCurriculumLectures(mapped);
        setOriginalIds(mapped.map((m) => m.id));
      }

      // 모든 강의 목록
      const { data: lecturesData } = await supabase
        .from("lectures")
        .select("*, lecture_videos(id)")
        .order("order", { ascending: true });

      if (lecturesData) {
        setAllLectures(
          lecturesData.map((l) => ({
            ...l,
            videoCount: l.lecture_videos?.length || 0,
          })),
        );
      }

      setIsDataLoading(false);
    };
    fetchData();
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

    const currentIds = curriculumLectures.map((cl) => cl.id);
    const toDelete = originalIds.filter(
      (origId) => !currentIds.includes(origId),
    );
    const toAdd = curriculumLectures.filter((cl) => cl.id.startsWith("temp_"));

    for (const deleteId of toDelete) {
      await supabase.from("curriculum_lectures").delete().eq("id", deleteId);
    }

    for (const item of toAdd) {
      await supabase.from("curriculum_lectures").insert({
        curriculum_id: id,
        lecture_id: item.lecture_id,
        order: curriculumLectures.indexOf(item),
      });
    }

    for (let i = 0; i < curriculumLectures.length; i++) {
      const cl = curriculumLectures[i];
      if (!cl.id.startsWith("temp_")) {
        await supabase
          .from("curriculum_lectures")
          .update({ order: i })
          .eq("id", cl.id);
      }
    }

    await queryClient.invalidateQueries({ queryKey: ["curriculums"] });
    router.push("/admin/curriculums");
  };

  const addLectures = () => {
    if (selectedIds.length === 0) return;
    const newItems: CurriculumLectureItem[] = selectedIds.map(
      (lectureId, index) => {
        const lecture = allLectures.find((l) => l.id === lectureId);
        return {
          id: `temp_${Date.now()}_${index}`,
          lecture_id: lectureId,
          order: curriculumLectures.length + index,
          lecture: lecture as Lecture & { videoCount: number },
        };
      },
    );
    setCurriculumLectures([...curriculumLectures, ...newItems]);
    setSelectedIds([]);
    setShowSelector(false);
  };

  const toggleSelection = (lectureId: string) => {
    setSelectedIds((prev) =>
      prev.includes(lectureId)
        ? prev.filter((id) => id !== lectureId)
        : [...prev, lectureId],
    );
  };

  const removeLecture = (clId: string) => {
    setCurriculumLectures(curriculumLectures.filter((cl) => cl.id !== clId));
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDragOverIndex(index);
    setDropPosition(e.clientY < midY ? "above" : "below");

    const scrollThreshold = 80;
    if (e.clientY < scrollThreshold) window.scrollBy(0, -10);
    else if (e.clientY > window.innerHeight - scrollThreshold)
      window.scrollBy(0, 10);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    if (
      draggedIndex === null ||
      dragOverIndex === null ||
      draggedIndex === dragOverIndex
    ) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      setDropPosition(null);
      return;
    }
    const newList = [...curriculumLectures];
    const [draggedItem] = newList.splice(draggedIndex, 1);
    let insertIndex = dragOverIndex;
    if (dropPosition === "below") {
      insertIndex =
        draggedIndex < dragOverIndex ? dragOverIndex : dragOverIndex + 1;
    } else {
      insertIndex =
        draggedIndex < dragOverIndex ? dragOverIndex - 1 : dragOverIndex;
    }
    newList.splice(insertIndex, 0, draggedItem);
    setCurriculumLectures(newList);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">커리큘럼 수정</h1>
        <p className="mt-2 text-gray-600">
          커리큘럼 정보를 수정하고 강의를 관리하세요
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 기본 정보 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold">기본 정보</h2>
          <div className="space-y-6">
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
          </div>
        </CardContent>
      </Card>

      {/* 강의 목록 */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              포함된 강의 ({curriculumLectures.length}개)
            </h2>
            <Button size="sm" onClick={() => setShowSelector(true)}>
              <Plus className="mr-1 h-4 w-4" />
              강의 추가
            </Button>
          </div>

          {curriculumLectures.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              아직 추가된 강의가 없습니다.
            </p>
          ) : (
            <div className="space-y-0">
              {curriculumLectures.map((cl, index) => (
                <div key={cl.id} className="relative">
                  {dragOverIndex === index &&
                    dropPosition === "above" &&
                    draggedIndex !== index && (
                      <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 z-10">
                        <div className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-blue-500 rounded-full" />
                      </div>
                    )}
                  <div
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 rounded-lg border p-3 my-2 cursor-grab active:cursor-grabbing transition-all ${
                      draggedIndex === index
                        ? "opacity-50 border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <GripVertical className="h-5 w-5 text-gray-400 shrink-0" />
                    <span className="w-6 text-center text-sm text-gray-500">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {cl.lecture.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {getDifficultyLabel(cl.lecture.difficulty)}
                        </span>
                        <span className="text-xs text-gray-500">
                          • {cl.lecture.videoCount || 0}개 영상
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
                  {dragOverIndex === index &&
                    dropPosition === "below" &&
                    draggedIndex !== index && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 z-10">
                        <div className="absolute -left-1 -top-1 w-2.5 h-2.5 bg-blue-500 rounded-full" />
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 강의 선택 모달 */}
      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-lg bg-white">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h3 className="text-lg font-semibold">강의 추가</h3>
                {selectedIds.length > 0 && (
                  <p className="text-sm text-blue-600">
                    {selectedIds.length}개 선택됨
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedIds([]);
                    setShowSelector(false);
                  }}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={addLectures}
                  disabled={selectedIds.length === 0}
                >
                  추가 ({selectedIds.length})
                </Button>
              </div>
            </div>
            <div className="overflow-y-auto p-4" style={{ maxHeight: "60vh" }}>
              {availableLectures.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  추가할 수 있는 강의가 없습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableLectures.map((lecture) => {
                    const isSelected = selectedIds.includes(lecture.id);
                    return (
                      <button
                        key={lecture.id}
                        onClick={() => toggleSelection(lecture.id)}
                        className={`w-full text-left rounded-lg border p-3 transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-3 h-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">
                              {lecture.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {getDifficultyLabel(lecture.difficulty)}
                              </span>
                              <span className="text-xs text-gray-500">
                                • {lecture.videoCount}개 영상
                              </span>
                              {!lecture.is_published && (
                                <Badge variant="warning" className="text-xs">
                                  비공개
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 하단 저장 버튼 */}
      <div
        ref={buttonAreaRef}
        className={`${
          isButtonFixed
            ? "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40"
            : "mt-8"
        } px-4 py-4`}
      >
        <div
          className={`${isButtonFixed ? "mx-auto max-w-4xl" : ""} flex justify-end gap-3`}
        >
          <Button variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isLoading}>
            {isLoading ? "저장 중..." : "저장"}
          </Button>
        </div>
      </div>
    </div>
  );
}
