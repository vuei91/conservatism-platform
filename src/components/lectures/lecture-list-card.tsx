import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui";
import { getDifficultyLabel, getDifficultyColor } from "@/lib/utils";
import type { Lecture } from "@/types/database";

interface LectureListCardProps {
  lecture: Lecture & {
    lectureCount?: number;
    totalDuration?: number;
    thumbnails?: string[];
  };
}

export function LectureListCard({ lecture }: LectureListCardProps) {
  const thumbnails = lecture.thumbnails || [];

  return (
    <Link href={`/lectures/${lecture.id}`}>
      <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden bg-linear-to-br from-blue-500 to-blue-700">
          {thumbnails.length >= 1 ? (
            <Image
              src={thumbnails[0]}
              alt={lecture.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : lecture.thumbnail_url ? (
            <Image
              src={lecture.thumbnail_url}
              alt={lecture.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-16 w-16 text-white/50" />
            </div>
          )}
          {lecture.lectureCount !== undefined && lecture.lectureCount > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {lecture.lectureCount}개 영상
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="mb-2">
            <Badge className={getDifficultyColor(lecture.difficulty)}>
              {getDifficultyLabel(lecture.difficulty)}
            </Badge>
          </div>
          <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-blue-600">
            {lecture.title}
          </h3>
          {lecture.description && (
            <p className="mb-3 line-clamp-2 text-sm text-gray-600">
              {lecture.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {lecture.totalDuration !== undefined &&
              lecture.totalDuration > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />총{" "}
                  {Math.round(lecture.totalDuration / 60)}분
                </span>
              )}
          </div>
        </div>
      </article>
    </Link>
  );
}
