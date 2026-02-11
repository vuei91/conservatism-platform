import { createClient } from "@/lib/supabase/server";
import { LectureGrid } from "@/components/lectures";
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

  let query = supabase
    .from("lectures")
    .select("*, category:categories(*)", { count: "exact" })
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (params.category) {
    const category = categories.find((c) => c.slug === params.category);
    if (category) {
      query = query.eq("category_id", category.id);
    }
  }

  if (params.difficulty) {
    query = query.eq(
      "difficulty",
      params.difficulty as "beginner" | "intermediate" | "advanced",
    );
  }

  if (params.q) {
    query = query.ilike("title", `%${params.q}%`);
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data: lectures, count } = await query;
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

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
        <LectureGrid lectures={lectures || []} />
      </LecturesContent>
    </div>
  );
}
