"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Clock, Eye, Heart } from "lucide-react";
import { Badge } from "@/components/ui";
import {
  formatDuration,
  getDifficultyLabel,
  getDifficultyColor,
  getYouTubeThumbnail,
} from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useToggleFavorite, useIsFavorite } from "@/hooks";
import type { Video, Category } from "@/types/database";

interface LectureCardProps {
  lecture: Video & { category?: Category | null };
}

export function LectureCard({ lecture }: LectureCardProps) {
  const router = useRouter();
  const thumbnailUrl =
    lecture.thumbnail_url || getYouTubeThumbnail(lecture.youtube_id);
  const { user } = useAuthStore();
  const { data: isFavorite } = useIsFavorite(lecture.id);
  const toggleFavorite = useToggleFavorite();

  const handleCardClick = () => {
    router.push(`/lectures/${lecture.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    toggleFavorite.mutate(lecture.id);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
    >
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
        {/* 즐겨찾기 버튼 */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 z-10 rounded-full bg-white/90 p-1.5 shadow-sm transition-colors hover:bg-white"
          aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
        >
          <Heart
            className={`h-4 w-4 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
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

        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-sequoia-600">
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
  );
}
