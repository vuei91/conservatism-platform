import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LecturePlayer } from "./lecture-player";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ curriculum?: string }>;
}

export default async function LecturePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { curriculum: curriculumId } = await searchParams;
  const supabase = await createClient();

  const { data: lecture, error } = await supabase
    .from("videos")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single();

  if (error || !lecture) {
    notFound();
  }

  // Get related videos
  let relatedLectures: (typeof lecture)[] = [];
  if (lecture.category_id) {
    const { data } = await supabase
      .from("videos")
      .select("*, category:categories(*)")
      .eq("is_published", true)
      .eq("category_id", lecture.category_id)
      .neq("id", id)
      .limit(4);
    relatedLectures = data || [];
  }

  // Get lectures (curriculums) containing this video
  const { data: curriculumData } = await supabase
    .from("lecture_videos")
    .select("curriculum:lectures(*)")
    .eq("video_id", id);

  const curriculums =
    curriculumData?.map((lv) => lv.curriculum).filter(Boolean) || [];

  // Get lecture videos if curriculumId is provided
  let curriculumLectures: {
    id: string;
    order: number;
    lecture: typeof lecture;
  }[] = [];
  let activeCurriculum: (typeof curriculums)[0] | null = null;

  if (curriculumId) {
    const { data: lvData } = await supabase
      .from("lecture_videos")
      .select("id, order, lecture:videos(*, category:categories(*))")
      .eq("lecture_id", curriculumId)
      .order("order", { ascending: true });

    if (lvData) {
      curriculumLectures = lvData as typeof curriculumLectures;
    }

    activeCurriculum = curriculums.find((c) => c?.id === curriculumId) || null;
  }

  return (
    <LecturePlayer
      lecture={lecture}
      relatedLectures={relatedLectures}
      curriculums={curriculums}
      curriculumLectures={curriculumLectures}
      activeCurriculum={activeCurriculum}
    />
  );
}
