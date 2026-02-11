"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button, Skeleton, Pagination } from "@/components/ui";

interface CurriculumsContentProps {
  currentDifficulty?: string;
  currentPage: number;
  totalPages: number;
  children: ReactNode;
}

const difficulties = [
  { value: "beginner", label: "입문" },
  { value: "intermediate", label: "중급" },
  { value: "advanced", label: "심화" },
];

export function CurriculumsContent({
  currentDifficulty,
  currentPage,
  totalPages,
  children,
}: CurriculumsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("difficulty", value);
    } else {
      params.delete("difficulty");
    }
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/curriculums?${qs}` : "/curriculums");
    });
  };

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700">난이도:</span>
        <Button
          variant={!currentDifficulty ? "primary" : "outline"}
          size="sm"
          onClick={() => updateFilter(null)}
          disabled={isPending}
        >
          전체
        </Button>
        {difficulties.map((diff) => (
          <Button
            key={diff.value}
            variant={currentDifficulty === diff.value ? "primary" : "outline"}
            size="sm"
            onClick={() => updateFilter(diff.value)}
            disabled={isPending}
          >
            {diff.label}
          </Button>
        ))}
        {isPending && (
          <Loader2 className="ml-2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-gray-200 p-6"
            >
              <Skeleton className="mb-3 h-6 w-16 rounded-full" />
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="mb-4 h-4 w-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      ) : (
        children
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/curriculums"
      />
    </>
  );
}
