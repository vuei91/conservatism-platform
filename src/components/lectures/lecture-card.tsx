import Link from "next/link";
import Image from "next/image";
import { Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui";
import {
  formatDuration,
  getDifficultyLabel,
  getDifficultyColor,
  getYouTubeThumbnail,
} from "@/lib/utils";
import type { Lecture, Category } from "@/types/database";

interface LectureCardProps {
  lecture: Lecture & { category?: Category | null };
}

export function LectureCard({ lecture }: LectureCardProps) {
  const thumbnailUrl =
    lecture.thumbnail_url || getYouTubeThumbnail(lecture.youtube_id);

  return (
    <Link href={`/lectures/${lecture.id}`}>
      <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-gray-100">
          <Image
            src={thumbnailUrl}
            alt={lecture.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {lecture.duration && (
            <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
              {formatDuration(lecture.duration)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            {lecture.category && (
              <Badge variant="info">{lecture.category.name}</Badge>
            )}
            <Badge className={getDifficultyColor(lecture.difficulty)}>
              {getDifficultyLabel(lecture.difficulty)}
            </Badge>
          </div>

          <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600">
            {lecture.title}
          </h3>

          {lecture.instructor && (
            <p className="mb-2 text-xs text-gray-500">{lecture.instructor}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {lecture.view_count.toLocaleString()}
            </span>
            {lecture.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(lecture.duration)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
