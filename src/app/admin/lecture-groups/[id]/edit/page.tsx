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
import { useLectures } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { getDifficultyLabel } from "@/lib/utils";
import type { Video, Category } from "@/types/database";

const schema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  description: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface VideoItem {
  id: string;
  video_id: string;
  order: number;
  video: Video & { category: Category | null };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditLectureGroupPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: allVideos = [] } = useLectures({ includeUnpublished: true });
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoItems, setVideoItems] = useState<VideoItem[]>([]);
  const [originalIds, setOriginalIds] = useState<string[]>([]);
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
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector("footer");
      if (!footer || !buttonAreaRef.current) return;
      setIsButtonFixed(footer.getBoundingClientRect().top > window.innerHeight);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: lecture, error: err } = await supabase
        .from("lectures")
        .select("*")
        .eq("id", id)
        .single();

      if (err || !lecture) {
        setError("강의를 찾을 수 없습니다");
        setIsDataLoading(false);
        return;
      }

      reset({
        title: lecture.title,
        description: lecture.description || "",
        difficulty: lecture.difficulty as
          | "beginner"
          | "intermediate"
          | "advanced",
        is_published: lecture.is_published,
        is_featured: lecture.is_featured,
      });

      const { data: lvData } = await supabase
        .from("lecture_videos")
        .select("*, video:videos(*, category:categories(*))")
        .eq("lecture_id", id)
        .order("order", { ascending: true });

      if (lvData) {
        setVideoItems(lvData as VideoItem[]);
        setOriginalIds(lvData.map((l) => l.id));
      }

      setIsDataLoading(false);
    };
    fetchData();
  }, [id, reset]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    const { error } = await supabase
      .from("lectures")
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

    const currentIds = videoItems.map((v) => v.id);
    const toDelete = originalIds.filter((oid) => !currentIds.includes(oid));
    const toAdd = videoItems.filter((v) => v.id.startsWith("temp_"));

    for (const did of toDelete) {
      await supabase.from("lecture_videos").delete().eq("id", did);
    }
    for (const item of toAdd) {
      await supabase.from("lecture_videos").insert({
        lecture_id: id,
        video_id: item.video_id,
        order: videoItems.indexOf(item),
      });
    }
    for (let i = 0; i < videoItems.length; i++) {
      if (!videoItems[i].id.startsWith("temp_")) {
        await supabase
          .from("lecture_videos")
          .update({ order: i })
          .eq("id", videoItems[i].id);
      }
    }

    await queryClient.invalidateQueries({ queryKey: ["lecture-groups"] });
    router.push("/admin/lecture-groups");
  };

  const addVideos = () => {
    if (selectedIds.length === 0) return;
    const newItems: VideoItem[] = selectedIds.map((vid, i) => {
      const video = allVideos.find((v) => v.id === vid);
      return {
        id: `temp_${Date.now()}_${i}`,
        video_id: vid,
        order: videoItems.length + i,
        video: video as Video & { category: Category | null },
      };
    });
    setVideoItems([...videoItems, ...newItems]);
    setSelectedIds([]);
    setShowSelector(false);
  };

  const toggleSelection = (vid: string) => {
    setSelectedIds((prev) =>
      prev.includes(vid) ? prev.filter((id) => id !== vid) : [...prev, vid],
    );
  };

  const removeVideo = (itemId: string) => {
    setVideoItems(videoItems.filter((v) => v.id !== itemId));
  };

  const handleDragStart = (i: number) => setDraggedIndex(i);
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === i) return;
    const mid =
      e.currentTarget.getBoundingClientRect().top +
      e.currentTarget.getBoundingClientRect().height / 2;
    setDragOverIndex(i);
    setDropPosition(e.clientY < mid ? "above" : "below");
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
    const list = [...videoItems];
    const [item] = list.splice(draggedIndex, 1);
    let ins = dragOverIndex;
    if (dropPosition === "below")
      ins = draggedIndex < dragOverIndex ? dragOverIndex : dragOverIndex + 1;
    else ins = draggedIndex < dragOverIndex ? dragOverIndex - 1 : dragOverIndex;
    list.splice(ins, 0, item);
    setVideoItems(list);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
  };

  const addedVideoIds = videoItems.map((v) => v.video_id);
  const availableVideos = allVideos.filter(
    (v) => !addedVideoIds.includes(v.id),
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
        <h1 className="text-3xl font-bold text-gray-900">강의 수정</h1>
        <p className="mt-2 text-gray-600">
          강의 정보를 수정하고 영상을 관리하세요
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="mb-4 text-lg font-semibold">기본 정보</h2>
          <div className="space-y-6">
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              포함된 영상 ({videoItems.length}개)
            </h2>
            <Button size="sm" onClick={() => setShowSelector(true)}>
              <Plus className="mr-1 h-4 w-4" />
              영상 추가
            </Button>
          </div>

          {videoItems.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              아직 추가된 영상이 없습니다.
            </p>
          ) : (
            <div className="space-y-0">
              {videoItems.map((item, index) => (
                <div key={item.id} className="relative">
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
                        {item.video.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.video.category && (
                          <Badge variant="info" className="text-xs">
                            {item.video.category.name}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {getDifficultyLabel(item.video.difficulty)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVideo(item.id)}
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

      {showSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-lg bg-white">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h3 className="text-lg font-semibold">영상 추가</h3>
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
                  onClick={addVideos}
                  disabled={selectedIds.length === 0}
                >
                  추가 ({selectedIds.length})
                </Button>
              </div>
            </div>
            <div className="overflow-y-auto p-4" style={{ maxHeight: "60vh" }}>
              {availableVideos.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  추가할 수 있는 영상이 없습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableVideos.map((video) => {
                    const isSelected = selectedIds.includes(video.id);
                    return (
                      <button
                        key={video.id}
                        onClick={() => toggleSelection(video.id)}
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
                              {video.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {video.category && (
                                <Badge variant="info" className="text-xs">
                                  {video.category.name}
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {getDifficultyLabel(video.difficulty)}
                              </span>
                              {!video.is_published && (
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

      <div
        ref={buttonAreaRef}
        className={`${isButtonFixed ? "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40" : "mt-8"} px-4 py-4`}
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
