import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui";
import { getDifficultyLabel, getDifficultyColor } from "@/lib/utils";
import type { Curriculum } from "@/types/database";

interface CurriculumCardProps {
  curriculum: Curriculum & {
    lectureCount?: number;
    totalDuration?: number;
    thumbnails?: string[];
  };
}

export function CurriculumCard({ curriculum }: CurriculumCardProps) {
  const thumbnails = curriculum.thumbnails || [];

  return (
    <Link href={`/curriculums/${curriculum.id}`}>
      <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
        {/* Thumbnail Grid */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700">
          {thumbnails.length >= 4 ? (
            // 2x2 그리드
            <div className="grid grid-cols-2 grid-rows-2 h-full">
              {thumbnails.slice(0, 4).map((thumb, i) => (
                <div key={i} className="relative overflow-hidden">
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          ) : thumbnails.length >= 2 ? (
            // 2개: 좌우 분할
            <div className="grid grid-cols-2 h-full">
              {thumbnails.slice(0, 2).map((thumb, i) => (
                <div key={i} className="relative overflow-hidden">
                  <Image
                    src={thumb}
                    alt=""
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          ) : thumbnails.length === 1 ? (
            // 1개: 전체
            <Image
              src={thumbnails[0]}
              alt={curriculum.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : curriculum.thumbnail_url ? (
            <Image
              src={curriculum.thumbnail_url}
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

          {/* 강의 개수 뱃지 */}
          {curriculum.lectureCount !== undefined &&
            curriculum.lectureCount > 0 && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {curriculum.lectureCount}개 강의
              </div>
            )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2">
            <Badge className={getDifficultyColor(curriculum.difficulty)}>
              {getDifficultyLabel(curriculum.difficulty)}
            </Badge>
          </div>

          <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-blue-600">
            {curriculum.title}
          </h3>

          {curriculum.description && (
            <p className="mb-3 line-clamp-2 text-sm text-gray-600">
              {curriculum.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
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
