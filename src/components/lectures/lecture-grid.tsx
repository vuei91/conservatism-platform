import { LectureCard } from "./lecture-card";
import { Skeleton } from "@/components/ui";
import type { Video, Category } from "@/types/database";

interface LectureGridProps {
  lectures: (Video & { category?: Category | null })[];
  isLoading?: boolean;
}

export function LectureGrid({ lectures, isLoading }: LectureGridProps) {
  if (isLoading) {
    return (
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
    );
  }

  if (lectures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-500">강의가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {lectures.map((lecture) => (
        <LectureCard key={lecture.id} lecture={lecture} />
      ))}
    </div>
  );
}
