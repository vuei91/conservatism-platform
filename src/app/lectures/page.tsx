import { createClient } from "@/lib/supabase/server";
import { CurriculumCard } from "@/components/curriculum";
import { LecturesContent } from "./lectures-content";

const PAGE_SIZE = 12;

interface PageProps {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function LecturesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);
  const supabase = await createClient();

  const categoriesResult = await supabase
    .from("categories")
    .select("*")
    .order("order", { ascending: true });

  const categories = categoriesResult.data || [];

  // 카테고리 필터: 해당 카테고리 영상을 포함하는 강의 ID 조회
  let filteredLectureIds: string[] | null = null;
  if (params.category) {
    const category = categories.find((c) => c.slug === params.category);
    if (category) {
      const { data: lvRows } = await supabase
        .from("lecture_videos")
        .select("lecture_id, video:videos!inner(category_id)")
        .eq("video.category_id", category.id);

      filteredLectureIds = [
        ...new Set((lvRows || []).map((r) => r.lecture_id)),
      ];
    }
  }

  let query = supabase
    .from("lectures")
    .select(
      `
      *,
      lecture_videos(
        id,
        order,
        video:videos(duration, youtube_id, thumbnail_url)
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

  if (params.q) {
    query = query.ilike("title", `%${params.q}%`);
  }

  if (filteredLectureIds !== null) {
    if (filteredLectureIds.length === 0) {
      query = query.in("id", ["00000000-0000-0000-0000-000000000000"]);
    } else {
      query = query.in("id", filteredLectureIds);
    }
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, count } = await query;
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  const lectures = (data || []).map((l) => {
    const sortedVideos =
      l.lecture_videos?.sort(
        (a: { order: number }, b: { order: number }) => a.order - b.order,
      ) || [];

    const thumbnails = sortedVideos
      .slice(0, 4)
      .map(
        (lv: {
          video: {
            youtube_id: string;
            thumbnail_url: string | null;
          } | null;
        }) =>
          lv.video?.thumbnail_url ||
          (lv.video?.youtube_id
            ? `https://img.youtube.com/vi/${lv.video.youtube_id}/mqdefault.jpg`
            : null),
      )
      .filter(Boolean) as string[];

    return {
      ...l,
      lectureCount: l.lecture_videos?.length || 0,
      totalDuration:
        l.lecture_videos?.reduce(
          (acc: number, lv: { video: { duration: number | null } | null }) =>
            acc + (lv.video?.duration || 0),
          0,
        ) || 0,
      thumbnails,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">강의 목록</h1>
        <p className="mt-2 text-gray-600">
          보수주의 관련 강의를 탐색하고 학습하세요
        </p>
      </div>

      <LecturesContent
        categories={categories}
        currentCategory={params.category}
        currentDifficulty={params.difficulty}
        searchQuery={params.q}
        currentPage={currentPage}
        totalPages={totalPages}
      >
        {lectures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500">강의가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lectures.map((lecture) => (
              <CurriculumCard key={lecture.id} curriculum={lecture} />
            ))}
          </div>
        )}
      </LecturesContent>
    </div>
  );
}
