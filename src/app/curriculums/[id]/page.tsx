import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, Layers, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import {
  formatDuration,
  getDifficultyLabel,
  getDifficultyColor,
  getYouTubeThumbnail,
} from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CurriculumDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: curriculum, error } = await supabase
    .from("curriculums")
    .select(
      `
      *,
      curriculum_lectures(
        id,
        order,
        lecture:lectures(
          *,
          lecture_videos(
            id,
            order,
            video:videos(*)
          )
        )
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !curriculum) {
    notFound();
  }

  const sortedLectures =
    curriculum.curriculum_lectures?.sort(
      (a: { order: number }, b: { order: number }) => a.order - b.order,
    ) || [];

  const totalVideoCount = sortedLectures.reduce(
    (acc: number, cl: { lecture: { lecture_videos?: unknown[] } | null }) =>
      acc + (cl.lecture?.lecture_videos?.length || 0),
    0,
  );

  const totalDuration = sortedLectures.reduce(
    (
      acc: number,
      cl: {
        lecture: {
          lecture_videos?: { video: { duration: number | null } | null }[];
        } | null;
      },
    ) =>
      acc +
      (cl.lecture?.lecture_videos?.reduce(
        (vAcc: number, lv: { video: { duration: number | null } | null }) =>
          vAcc + (lv.video?.duration || 0),
        0,
      ) || 0),
    0,
  );

  // 첫 번째 강의의 첫 번째 영상 ID (학습 시작용)
  const firstLecture = sortedLectures[0]?.lecture;
  const firstVideo = firstLecture?.lecture_videos?.sort(
    (a: { order: number }, b: { order: number }) => a.order - b.order,
  )?.[0]?.video;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4">
          <Badge className={getDifficultyColor(curriculum.difficulty)}>
            {getDifficultyLabel(curriculum.difficulty)}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{curriculum.title}</h1>
        {curriculum.description && (
          <p className="mt-4 text-lg text-gray-600">{curriculum.description}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Layers className="h-4 w-4" />
            {sortedLectures.length}개 강의
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {totalVideoCount}개 영상
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />총 {Math.round(totalDuration / 60)}분
          </span>
        </div>

        {firstVideo && (
          <div className="mt-6">
            <Link href={`/lectures/${firstVideo.id}?curriculum=${id}`}>
              <Button size="lg">
                <Play className="mr-2 h-5 w-5" />
                학습 시작하기
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Lecture List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">강의 목록</h2>
        <div className="space-y-4">
          {sortedLectures.map(
            (
              cl: {
                id: string;
                order: number;
                lecture: {
                  id: string;
                  title: string;
                  description: string | null;
                  difficulty: string;
                  thumbnail_url: string | null;
                  lecture_videos?: {
                    id: string;
                    order: number;
                    video: {
                      id: string;
                      title: string;
                      youtube_id: string;
                      thumbnail_url: string | null;
                      duration: number | null;
                      instructor: string | null;
                    } | null;
                  }[];
                } | null;
              },
              index: number,
            ) => {
              const lecture = cl.lecture;
              if (!lecture) return null;

              const sortedVideos =
                lecture.lecture_videos?.sort(
                  (a: { order: number }, b: { order: number }) =>
                    a.order - b.order,
                ) || [];

              const lectureDuration = sortedVideos.reduce(
                (
                  acc: number,
                  lv: { video: { duration: number | null } | null },
                ) => acc + (lv.video?.duration || 0),
                0,
              );

              const firstVid = sortedVideos[0]?.video;
              const thumbSrc =
                lecture.thumbnail_url ||
                firstVid?.thumbnail_url ||
                (firstVid?.youtube_id
                  ? getYouTubeThumbnail(firstVid.youtube_id)
                  : null);

              return (
                <Card key={cl.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 mt-1">
                        {index + 1}
                      </div>
                      {thumbSrc && (
                        <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded bg-gray-100">
                          <Image
                            src={thumbSrc}
                            alt={lecture.title}
                            fill
                            className="object-cover"
                            sizes="144px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">
                          {lecture.title}
                        </h3>
                        {lecture.description && (
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                            {lecture.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span>{sortedVideos.length}개 영상</span>
                          {lectureDuration > 0 && (
                            <span>{formatDuration(lectureDuration)}</span>
                          )}
                          <Badge
                            className={`text-xs ${getDifficultyColor(lecture.difficulty as "beginner" | "intermediate" | "advanced")}`}
                          >
                            {getDifficultyLabel(
                              lecture.difficulty as
                                | "beginner"
                                | "intermediate"
                                | "advanced",
                            )}
                          </Badge>
                        </div>

                        {/* 영상 목록 (접힌 상태로 표시) */}
                        {sortedVideos.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {sortedVideos.map(
                              (
                                lv: {
                                  id: string;
                                  video: {
                                    id: string;
                                    title: string;
                                    duration: number | null;
                                  } | null;
                                },
                                vIdx: number,
                              ) => {
                                if (!lv.video) return null;
                                return (
                                  <Link
                                    key={lv.id}
                                    href={`/lectures/${lv.video.id}?curriculum=${id}`}
                                    className="flex items-center gap-2 rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                                  >
                                    <Play className="h-3 w-3 shrink-0" />
                                    <span className="truncate">
                                      {vIdx + 1}. {lv.video.title}
                                    </span>
                                    {lv.video.duration && (
                                      <span className="ml-auto shrink-0 text-xs text-gray-400">
                                        {formatDuration(lv.video.duration)}
                                      </span>
                                    )}
                                  </Link>
                                );
                              },
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}
