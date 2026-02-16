"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Clock,
  Eye,
  BookOpen,
  ChevronRight,
  Play,
  CheckCircle,
} from "lucide-react";
import { YouTubePlayer, LectureCard } from "@/components/lectures";
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
  getYouTubeThumbnail,
} from "@/lib/utils";
import { NoteFloatingButton } from "./note-floating-button";
import type { Video, Category, Curriculum } from "@/types/database";

interface CurriculumLectureItem {
  id: string;
  order: number;
  lecture: Video & { category: Category | null };
}

interface LecturePlayerProps {
  lecture: Video & { category: Category | null };
  relatedLectures: (Video & { category: Category | null })[];
  curriculums: Curriculum[];
  curriculumLectures?: CurriculumLectureItem[];
  activeCurriculum?: Curriculum | null;
}

export function LecturePlayer({
  lecture,
  relatedLectures,
  curriculums,
  curriculumLectures = [],
  activeCurriculum,
}: LecturePlayerProps) {
  const { user } = useAuthStore();
  const { data: isFavorite } = useIsFavorite(lecture.id);
  const toggleFavorite = useToggleFavorite();
  const incrementViewCount = useIncrementViewCount();

  useEffect(() => {
    incrementViewCount.mutate(lecture.id);
  }, [lecture.id]);

  const handleToggleFavorite = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    toggleFavorite.mutate(lecture.id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <YouTubePlayer videoId={lecture.youtube_id} />

          {/* Lecture Info */}
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {lecture.category && (
                <Badge variant="info">{lecture.category.name}</Badge>
              )}
              <Badge className={getDifficultyColor(lecture.difficulty)}>
                {getDifficultyLabel(lecture.difficulty)}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              {lecture.title}
            </h1>

            {lecture.instructor && (
              <p className="mt-2 text-gray-600">{lecture.instructor}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                조회수 {lecture.view_count.toLocaleString()}
              </span>
              {lecture.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(lecture.duration)}
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

            {lecture.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  영상 설명
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-gray-600">
                  {lecture.description}
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
                  <LectureCard key={related.id} lecture={related} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Curriculum Lecture List */}
          {activeCurriculum && curriculumLectures.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="mb-4">
                  <Link
                    href={`/curriculums/${activeCurriculum.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    ← 강의로 돌아가기
                  </Link>
                  <h3 className="mt-2 font-semibold text-gray-900">
                    {activeCurriculum.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {curriculumLectures.length}개 영상
                  </p>
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {curriculumLectures.map((cl, index) => {
                    const isActive = cl.lecture.id === lecture.id;
                    return (
                      <Link
                        key={cl.id}
                        href={`/lectures/${cl.lecture.id}?curriculum=${activeCurriculum.id}`}
                        className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${
                          isActive
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium ${
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
                            {cl.lecture.title}
                          </p>
                          {cl.lecture.duration && (
                            <p className="text-xs text-gray-400">
                              {formatDuration(cl.lecture.duration)}
                            </p>
                          )}
                        </div>
                        {isActive && (
                          <Play className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Curriculums containing this lecture (when not in curriculum mode) */}
          {!activeCurriculum && curriculums.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <BookOpen className="h-5 w-5" />이 영상이 포함된 강의
                </h3>
                <div className="space-y-3">
                  {curriculums.map((curriculum) => (
                    <Link
                      key={curriculum.id}
                      href={`/lectures/${lecture.id}?curriculum=${curriculum.id}`}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {curriculum.title}
                        </p>
                        <Badge
                          className={`mt-1 ${getDifficultyColor(curriculum.difficulty)}`}
                        >
                          {getDifficultyLabel(curriculum.difficulty)}
                        </Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Login prompt for non-logged in users */}
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

      {/* Floating Note Button (for logged in users) */}
      {user && <NoteFloatingButton lectureId={lecture.id} />}
    </div>
  );
}
