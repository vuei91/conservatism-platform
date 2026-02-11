import { Skeleton } from "@/components/ui";

export default function LectureDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="mt-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="mt-2 h-5 w-1/2" />
          </div>
        </div>
        <div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
