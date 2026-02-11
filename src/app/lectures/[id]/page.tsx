import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LecturePlayer } from "./lecture-player";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LecturePage({ params }: PageProps) {
  const { id } = await params;
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

  return (
    <LecturePlayer
      lecture={lecture}
      relatedLectures={relatedLectures}
      curriculums={curriculums}
    />
  );
}
