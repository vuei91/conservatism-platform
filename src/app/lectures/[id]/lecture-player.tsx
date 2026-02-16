"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Heart, Clock, Eye, Play, BookOpen } from "lucide-react";
import { YouTubePlayer } from "@/components/lectures";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import {
  useToggleFavorite,
  useIsFavorite,
  useIncrementViewCount,
} from "@/hooks";
import {
  formatDuration,
  getDifficultyLabel,
  getDifficultyColor,
} from "@/lib/utils";
import { NoteFloatingButton } from "./note-floating-button";
import type { Video, Category, Lecture } from "@/types/database";

interface VideoItem {
  id: string;
  order: number;
  video: Video & { category: Category | null };
}

interface LecturePlayerProps {
  lecture: Lecture;
  sortedVideos: VideoItem[];
  activeVideo: Video & { category: Category | null };
  relatedLectures: (Lecture & {
    lectureCount: number;
    totalDuration: number;
  })[];
  curriculumId?: string;
}

export function LecturePlayer({
  lecture,
  sortedVideos,
  activeVideo,
  relatedLectures,
  curriculumId,
}: LecturePlayerProps) {
  const { user } = useAuthStore();
  const { data: isFavorite } = useIsFavorite(activeVideo.id);
  const toggleFavorite = useToggleFavorite();
  const incrementViewCount = useIncrementViewCount();

  useEffect(() => {
    incrementViewCount.mutate(activeVideo.id);
  }, [activeVideo.id]);

  const handleToggleFavorite = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    toggleFavorite.mutate(activeVideo.id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <YouTubePlayer videoId={activeVideo.youtube_id} />

          {/* Video Info */}
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {activeVideo.category && (
                <Badge variant="info">{activeVideo.category.name}</Badge>
              )}
              <Badge className={getDifficultyColor(activeVideo.difficulty)}>
                {getDifficultyLabel(activeVideo.difficulty)}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              {activeVideo.title}
            </h1>

            {activeVideo.instructor && (
              <p className="mt-2 text-gray-600">{activeVideo.instructor}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                조회수 {activeVideo.view_count.toLocaleString()}
              </span>
              {activeVideo.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(activeVideo.duration)}
                </span>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant={isFavorite ? "primary" : "outline"}
                onClick={handleToggleFavorite}
                disabled={toggleFavorite.isPending}
              >
                <Heart
                  className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                />
                {isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
              </Button>
            </div>

            {activeVideo.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  영상 설명
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-gray-600">
                  {activeVideo.description}
                </p>
              </div>
            )}
          </div>

          {/* Related Lectures */}
          {relatedLectures.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                관련 강의
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {relatedLectures.map((related) => (
                  <Link key={related.id} href={`/lectures/${related.id}`}>
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="p-3">
                        <p className="font-medium text-gray-900 truncate">
                          {related.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <span>{getDifficultyLabel(related.difficulty)}</span>
                          <span>•</span>
                          <span>{related.lectureCount}개 영상</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Video List */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="mb-4">
                {curriculumId && (
                  <Link
                    href={`/curriculums/${curriculumId}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    ← 커리큘럼으로 돌아가기
                  </Link>
                )}
                <h3 className="mt-2 font-semibold text-gray-900">
                  <BookOpen className="inline h-4 w-4 mr-1" />
                  {lecture.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {sortedVideos.length}개 영상
                </p>
              </div>
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {sortedVideos.map((lv, index) => {
                  const video = lv.video;
                  if (!video) return null;
                  const isActive = video.id === activeVideo.id;
                  const href = curriculumId
                    ? `/lectures/${lecture.id}?v=${video.id}&curriculum=${curriculumId}`
                    : `/lectures/${lecture.id}?v=${video.id}`;

                  return (
                    <Link
                      key={lv.id}
                      href={href}
                      className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${
                        isActive
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                          isActive
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm truncate ${
                            isActive
                              ? "font-medium text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {video.title}
                        </p>
                        {video.duration && (
                          <p className="text-xs text-gray-400">
                            {formatDuration(video.duration)}
                          </p>
                        )}
                      </div>
                      {isActive && (
                        <Play className="h-4 w-4 text-blue-500 shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Login prompt */}
          {!user && (
            <Card>
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-gray-900">
                  학습 기록을 저장하세요
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  로그인하면 시청 기록, 메모, 즐겨찾기 기능을 이용할 수
                  있습니다.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link href="/login">
                    <Button className="w-full">로그인</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="outline" className="w-full">
                      회원가입
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {user && <NoteFloatingButton lectureId={activeVideo.id} />}
    </div>
  );
}
