"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button, Skeleton, Pagination } from "@/components/ui";
import type { Category } from "@/types/database";

interface LecturesContentProps {
  categories: Category[];
  currentCategory?: string;
  currentDifficulty?: string;
  searchQuery?: string;
  currentPage: number;
  totalPages: number;
  children: ReactNode;
}

const difficulties = [
  { value: "beginner", label: "입문" },
  { value: "intermediate", label: "중급" },
  { value: "advanced", label: "심화" },
];

export function LecturesContent({
  categories,
  currentCategory,
  currentDifficulty,
  searchQuery,
  currentPage,
  totalPages,
  children,
}: LecturesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`/lectures?${params.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    updateFilter("q", query || null);
  };

  return (
    <>
      <div className="mb-8 space-y-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="강의 검색..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-sequoia-500 focus:outline-none focus:ring-1 focus:ring-sequoia-500"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "검색"}
          </Button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">카테고리:</span>
            <Button
              variant={!currentCategory ? "primary" : "outline"}
              size="sm"
              onClick={() => updateFilter("category", null)}
              disabled={isPending}
            >
              전체
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  currentCategory === category.slug ? "primary" : "outline"
                }
                size="sm"
                onClick={() => updateFilter("category", category.slug)}
                disabled={isPending}
              >
                {category.name}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">난이도:</span>
            <Button
              variant={!currentDifficulty ? "primary" : "outline"}
              size="sm"
              onClick={() => updateFilter("difficulty", null)}
              disabled={isPending}
            >
              전체
            </Button>
            {difficulties.map((diff) => (
              <Button
                key={diff.value}
                variant={
                  currentDifficulty === diff.value ? "primary" : "outline"
                }
                size="sm"
                onClick={() => updateFilter("difficulty", diff.value)}
                disabled={isPending}
              >
                {diff.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid area with skeleton overlay */}
      {isPending ? (
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
      ) : (
        children
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/lectures"
      />
    </>
  );
}
