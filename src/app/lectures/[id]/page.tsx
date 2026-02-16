import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LecturePlayer } from "./lecture-player";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ v?: string; curriculum?: string }>;
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
