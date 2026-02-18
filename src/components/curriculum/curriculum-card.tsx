import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, Layers } from "lucide-react";
import { Badge } from "@/components/ui";
import { getDifficultyLabel, getDifficultyColor } from "@/lib/utils";
import type { Curriculum } from "@/types/database";

interface CurriculumCardProps {
  curriculum: Curriculum & {
    lectureCount?: number;
    totalVideoCount?: number;
    totalDuration?: number;
    thumbnail?: string | null;
  };
}

export function CurriculumCard({ curriculum }: CurriculumCardProps) {
  return (
    <Link href={`/curriculums/${curriculum.id}`}>
      <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden bg-linear-to-br from-sequoia-500 to-sequoia-700">
          {curriculum.thumbnail ? (
            <Image
              src={curriculum.thumbnail}
              alt={curriculum.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-16 w-16 text-white/50" />
            </div>
          )}
          {curriculum.lectureCount !== undefined &&
            curriculum.lectureCount > 0 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {curriculum.lectureCount}개 강의
              </div>
            )}
        </div>

        <div className="p-4">
          <div className="mb-2">
            <Badge className={getDifficultyColor(curriculum.difficulty)}>
              {getDifficultyLabel(curriculum.difficulty)}
            </Badge>
          </div>

          <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-sequoia-600">
            {curriculum.title}
          </h3>

          {curriculum.description && (
            <p className="mb-3 line-clamp-2 text-sm text-gray-600">
              {curriculum.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            {curriculum.lectureCount !== undefined &&
              curriculum.lectureCount > 0 && (
                <span className="flex items-center gap-1">
                  <Layers className="h-3 w-3" />
                  {curriculum.lectureCount}개 강의
                </span>
              )}
            {curriculum.totalDuration !== undefined &&
              curriculum.totalDuration > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />총{" "}
                  {Math.round(curriculum.totalDuration / 60)}분
                </span>
              )}
          </div>
        </div>
      </article>
    </Link>
  );
}
