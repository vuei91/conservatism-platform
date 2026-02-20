import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, Layers, Play, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button, Badge } from "@/components/ui";
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

  const firstLecture = sortedLectures[0]?.lecture;
  const firstVideo = firstLecture?.lecture_videos?.sort(
    (a: { order: number }, b: { order: number }) => a.order - b.order,
  )?.[0]?.video;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-12 text-center">
        <Badge className={getDifficultyColor(curriculum.difficulty)}>
          {getDifficultyLabel(curriculum.difficulty)}
        </Badge>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          {curriculum.title}
        </h1>
        {curriculum.description && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            {curriculum.description}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
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

        {firstLecture && firstVideo && (
          <div className="mt-6">
            <Link
              href={`/lectures/${firstLecture.id}?v=${firstVideo.id}&curriculum=${id}`}
            >
              <Button size="lg">
                <Play className="mr-2 h-5 w-5" />
                학습 시작하기
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Diagram */}
      <div className="relative mx-auto max-w-3xl">
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

            const isLast = index === sortedLectures.length - 1;

            return (
              <div key={cl.id} className="relative flex gap-6">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sequoia-600 text-sm font-bold text-white shadow-md">
                    {index + 1}
                  </div>
                  {!isLast && <div className="w-0.5 flex-1 bg-sequoia-200" />}
                </div>

                {/* Node */}
                <div className={`flex-1 ${isLast ? "pb-0" : "pb-8"}`}>
                  <div className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      {/* Thumbnail */}
                      {thumbSrc && (
                        <Link
                          href={`/lectures/${lecture.id}?curriculum=${id}`}
                          className="relative h-32 w-full sm:h-auto sm:w-48 shrink-0 overflow-hidden bg-gray-100"
                        >
                          <Image
                            src={thumbSrc}
                            alt={lecture.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 192px"
                          />
                        </Link>
                      )}

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/lectures/${lecture.id}?curriculum=${id}`}
                              className="text-base font-semibold text-gray-900 hover:text-sequoia-600 transition-colors"
                            >
                              {lecture.title}
                            </Link>
                            {lecture.description && (
                              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                {lecture.description}
                              </p>
                            )}
                          </div>
                          <Link
                            href={`/lectures/${lecture.id}?curriculum=${id}`}
                            className="shrink-0 rounded-full bg-sequoia-50 p-2 text-sequoia-600 hover:bg-sequoia-100 transition-colors"
                            aria-label={`${lecture.title} 강의 보기`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
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
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {sortedVideos.length}개 영상
                          </span>
                          {lectureDuration > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(lectureDuration)}
                            </span>
                          )}
                        </div>

                        {/* Video list */}
                        {sortedVideos.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
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
                                    href={`/lectures/${lecture.id}?v=${lv.video.id}&curriculum=${id}`}
                                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600 hover:border-sequoia-300 hover:bg-sequoia-50 hover:text-sequoia-700 transition-colors"
                                    title={lv.video.title}
                                  >
                                    <Play className="h-2.5 w-2.5" />
                                    <span className="max-w-[120px] truncate">
                                      {vIdx + 1}. {lv.video.title}
                                    </span>
                                  </Link>
                                );
                              },
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
