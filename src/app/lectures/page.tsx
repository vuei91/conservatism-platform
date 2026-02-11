import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { LectureGrid } from "@/components/lectures";
import { LectureFilters } from "./lecture-filters";
import { Skeleton } from "@/components/ui";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
    q?: string;
  }>;
}

export default async function LecturesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const categoriesResult = await supabase
    .from("categories")
    .select("*")
    .order("order", { ascending: true });

  const categories = categoriesResult.data || [];

  let query = supabase
    .from("lectures")
    .select("*, category:categories(*)")
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

  const { data: lectures } = await query;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">강의 목록</h1>
        <p className="mt-2 text-gray-600">
          보수주의 관련 강의를 탐색하고 학습하세요
        </p>
      </div>

      <div className="mb-8">
        <LectureFilters
          categories={categories}
          currentCategory={params.category}
          currentDifficulty={params.difficulty}
          searchQuery={params.q}
        />
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-gray-200"
              >
                <Skeleton className="aspect-video w-full" />
                <div className="p-4">
                  <Skeleton className="mb-2 h-4 w-20" />
                  <Skeleton className="mb-2 h-5 w-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <LectureGrid lectures={lectures || []} />
      </Suspense>
    </div>
  );
}
