"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui";
import type { Category } from "@/types/database";

interface LectureFiltersProps {
  categories: Category[];
  currentCategory?: string;
  currentDifficulty?: string;
  searchQuery?: string;
}

const difficulties = [
  { value: "beginner", label: "입문" },
  { value: "intermediate", label: "중급" },
  { value: "advanced", label: "심화" },
];

export function LectureFilters({
  categories,
  currentCategory,
  currentDifficulty,
  searchQuery,
}: LectureFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/lectures?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    updateFilter("q", query || null);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="강의 검색..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <Button type="submit">검색</Button>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">카테고리:</span>
          <Button
            variant={!currentCategory ? "primary" : "outline"}
            size="sm"
            onClick={() => updateFilter("category", null)}
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
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">난이도:</span>
          <Button
            variant={!currentDifficulty ? "primary" : "outline"}
            size="sm"
            onClick={() => updateFilter("difficulty", null)}
          >
            전체
          </Button>
          {difficulties.map((diff) => (
            <Button
              key={diff.value}
              variant={currentDifficulty === diff.value ? "primary" : "outline"}
              size="sm"
              onClick={() => updateFilter("difficulty", diff.value)}
            >
              {diff.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
