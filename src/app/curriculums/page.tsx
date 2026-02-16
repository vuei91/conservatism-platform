import { createClient } from "@/lib/supabase/server";
import { CurriculumCard } from "@/components/curriculum";
import { CurriculumsContent } from "./curriculums-content";

const PAGE_SIZE = 9;

interface PageProps {
  searchParams: Promise<{
    difficulty?: string;
    page?: string;
  }>;
}

export default async function CurriculumsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);
  const supabase = await createClient();

  let query = supabase
    .from("curriculums")
    .select(
      `
      *,
      curriculum_lectures(
        id,
        order,
        lecture:lectures(
          id,
          title,
          thumbnail_url,
          lecture_videos(
            id,
            video:videos(duration, youtube_id, thumbnail_url)
          )
        )
      )
    `,
      { count: "exact" },
    )
    .eq("is_published", true)
    .order("order", { ascending: true });

  if (params.difficulty) {
    query = query.eq(
      "difficulty",
      params.difficulty as "beginner" | "intermediate" | "advanced",
    );
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, count } = await query;
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  const curriculums = (data || []).map((c) => {
    const sortedLectures =
      c.curriculum_lectures?.sort(
        (a: { order: number }, b: { order: number }) => a.order - b.order,
      ) || [];

    const lectureCount = sortedLectures.length;

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
    const firstVideo = firstLecture?.lecture_videos?.[0]?.video;
    const thumbnail =
      c.thumbnail_url ||
      firstVideo?.thumbnail_url ||
      (firstVideo?.youtube_id
        ? `https://img.youtube.com/vi/${firstVideo.youtube_id}/mqdefault.jpg`
        : null);

    return {
      ...c,
      lectureCount,
      totalDuration,
      thumbnail,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">커리큘럼</h1>
        <p className="mt-2 text-gray-600">
          체계적인 학습을 위한 커리큘럼을 선택하세요
        </p>
      </div>

      <CurriculumsContent
        currentDifficulty={params.difficulty}
        currentPage={currentPage}
        totalPages={totalPages}
      >
        {curriculums.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500">커리큘럼이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {curriculums.map((curriculum) => (
              <CurriculumCard key={curriculum.id} curriculum={curriculum} />
            ))}
          </div>
        )}
      </CurriculumsContent>
    </div>
  );
}
