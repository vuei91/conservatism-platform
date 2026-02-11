import { createClient } from "@/lib/supabase/server";
import { CurriculumCard } from "@/components/curriculum";
import { Button } from "@/components/ui";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    difficulty?: string;
  }>;
}

const difficulties = [
  { value: "beginner", label: "입문" },
  { value: "intermediate", label: "중급" },
  { value: "advanced", label: "심화" },
];

export default async function CurriculumsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("curriculums")
    .select(
      `
      *,
      curriculum_lectures(
        id,
        lecture:lectures(duration)
      )
    `,
    )
    .eq("is_published", true)
    .order("order", { ascending: true });

  if (params.difficulty) {
    query = query.eq(
      "difficulty",
      params.difficulty as "beginner" | "intermediate" | "advanced",
    );
  }

  const { data } = await query;

  const curriculums = (data || []).map((c) => ({
    ...c,
    lectureCount: c.curriculum_lectures?.length || 0,
    totalDuration:
      c.curriculum_lectures?.reduce(
        (acc: number, cl: { lecture: { duration: number | null } | null }) =>
          acc + (cl.lecture?.duration || 0),
        0,
      ) || 0,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">커리큘럼</h1>
        <p className="mt-2 text-gray-600">
          체계적인 학습을 위한 커리큘럼을 선택하세요
        </p>
      </div>

      {/* Difficulty Filter */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">난이도:</span>
        <Link href="/curriculums">
          <Button
            variant={!params.difficulty ? "primary" : "outline"}
            size="sm"
          >
            전체
          </Button>
        </Link>
        {difficulties.map((diff) => (
          <Link key={diff.value} href={`/curriculums?difficulty=${diff.value}`}>
            <Button
              variant={params.difficulty === diff.value ? "primary" : "outline"}
              size="sm"
            >
              {diff.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Curriculum Grid */}
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
    </div>
  );
}
