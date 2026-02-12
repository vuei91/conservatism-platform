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
    .from("lectures")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single();

  if (error || !lecture) {
    notFound();
  }

  // Get related lectures
  let relatedLectures: (typeof lecture)[] = [];
  if (lecture.category_id) {
    const { data } = await supabase
      .from("lectures")
      .select("*, category:categories(*)")
      .eq("is_published", true)
      .eq("category_id", lecture.category_id)
      .neq("id", id)
      .limit(4);
    relatedLectures = data || [];
  }

  // Get curriculums containing this lecture
  const { data: curriculumData } = await supabase
    .from("curriculum_lectures")
    .select("curriculum:curriculums(*)")
    .eq("lecture_id", id);

  const curriculums =
    curriculumData?.map((cl) => cl.curriculum).filter(Boolean) || [];

  // Get curriculum lectures if curriculumId is provided
  let curriculumLectures: {
    id: string;
    order: number;
    lecture: typeof lecture;
  }[] = [];
  let activeCurriculum: (typeof curriculums)[0] | null = null;

  if (curriculumId) {
    const { data: clData } = await supabase
      .from("curriculum_lectures")
      .select("id, order, lecture:lectures(*, category:categories(*))")
      .eq("curriculum_id", curriculumId)
      .order("order", { ascending: true });

    if (clData) {
      curriculumLectures = clData as typeof curriculumLectures;
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
