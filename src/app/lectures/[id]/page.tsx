import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getYouTubeThumbnail, getDifficultyLabel } from "@/lib/utils";
import { LecturePlayer } from "./lecture-player";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ v?: string; curriculum?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { v: videoId } = await searchParams;
  const supabase = await createClient();

  const { data: lecture } = await supabase
    .from("lectures")
    .select(
      `
      title,
      description,
      difficulty,
      lecture_videos(
        order,
        video:videos(id, youtube_id, title, thumbnail_url)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (!lecture) return { title: "강의를 찾을 수 없습니다" };

  const sortedVideos =
    lecture.lecture_videos?.sort(
      (a: { order: number }, b: { order: number }) => a.order - b.order,
    ) || [];

  // 현재 영상 또는 첫 번째 영상의 썸네일 사용
  const targetVideo = videoId
    ? sortedVideos.find(
        (lv: { video: { id: string } | null }) =>
          lv.video?.id === videoId,
      )?.video ?? sortedVideos[0]?.video
    : sortedVideos[0]?.video;

  const thumbnailUrl = targetVideo
    ? getYouTubeThumbnail(targetVideo.youtube_id, "maxres")
    : undefined;

  const title = lecture.title;
  const description =
    lecture.description ||
    `${getDifficultyLabel(lecture.difficulty)} · ${sortedVideos.length}개 영상`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "video.other",
      images: thumbnailUrl ? [{ url: thumbnailUrl, width: 1280, height: 720 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: thumbnailUrl ? [thumbnailUrl] : [],
    },
  };
}

export default async function LecturePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { v: videoId, curriculum: curriculumId } = await searchParams;
  const supabase = await createClient();

  // 강의(lectures 테이블) 조회 + 포함된 영상들
  const { data: lecture, error } = await supabase
    .from("lectures")
    .select(
      `
      *,
      lecture_videos(
        id,
        order,
        video:videos(*, category:categories(*))
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !lecture) {
    notFound();
  }

  const sortedVideos =
    lecture.lecture_videos?.sort(
      (a: { order: number }, b: { order: number }) => a.order - b.order,
    ) || [];

  // 현재 재생할 영상 결정
  const activeVideo = videoId
    ? sortedVideos.find(
        (lv: { video: { id: string } | null }) => lv.video?.id === videoId,
      )?.video
    : sortedVideos[0]?.video;

  if (!activeVideo) {
    notFound();
  }

  // 관련 강의 (같은 난이도)
  const { data: relatedData } = await supabase
    .from("lectures")
    .select(
      "*, lecture_videos(id, video:videos(thumbnail_url, youtube_id, duration))",
    )
    .eq("is_published", true)
    .eq("difficulty", lecture.difficulty)
    .neq("id", id)
    .limit(4);

  const relatedLectures = (relatedData || []).map((l) => ({
    ...l,
    lectureCount: l.lecture_videos?.length || 0,
    totalDuration:
      l.lecture_videos?.reduce(
        (acc: number, lv: { video: { duration: number | null } | null }) =>
          acc + (lv.video?.duration || 0),
        0,
      ) || 0,
  }));

  return (
    <LecturePlayer
      lecture={lecture}
      sortedVideos={sortedVideos}
      activeVideo={activeVideo}
      relatedLectures={relatedLectures}
      curriculumId={curriculumId}
    />
  );
}
