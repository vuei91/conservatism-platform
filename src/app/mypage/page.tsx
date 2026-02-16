"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Heart, Clock, FileText, Settings, Play } from "lucide-react";
import { Card, CardContent, Button, Skeleton } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { useFavorites, useNotes, useContinueWatching } from "@/hooks";
import { LectureCard } from "@/components/lectures";

export default function MyPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const { data: favorites = [], isLoading: favoritesLoading } = useFavorites();
  const { data: notes = [], isLoading: notesLoading } = useNotes();
  const { data: continueWatching = [], isLoading: continueWatchingLoading } =
    useContinueWatching();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
        <p className="mt-2 text-gray-600">
          안녕하세요, {user.name || user.email}님!
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {favorites.length}
              </p>
              <p className="text-sm text-gray-500">즐겨찾기</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-green-100 p-3">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
              <p className="text-sm text-gray-500">메모</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-purple-100 p-3">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">완료한 강의</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-full bg-orange-100 p-3">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0분</p>
              <p className="text-sm text-gray-500">총 학습 시간</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Watching */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            <Play className="mr-2 inline h-5 w-5" />
            이어보기
          </h2>
        </div>
        {continueWatchingLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : continueWatching.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Play className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">시청 중인 강의가 없습니다.</p>
              <Link href="/lectures">
                <Button variant="outline" className="mt-4">
                  강의 둘러보기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {continueWatching.map((item) => {
              const progressPercent =
                item.video.duration && item.video.duration > 0
                  ? Math.min(
                      Math.round((item.progress / item.video.duration) * 100),
                      100,
                    )
                  : 0;

              const href = item.curriculum
                ? `/lectures/${item.lecture?.id || ""}?v=${item.video.id}&curriculum=${item.curriculum.id}`
                : `/lectures/${item.lecture?.id || ""}?v=${item.video.id}`;

              return (
                <Link key={item.id} href={href}>
                  <Card className="overflow-hidden transition-shadow hover:shadow-md">
                    <div className="relative">
                      <img
                        src={
                          item.video.thumbnail_url ||
                          `https://img.youtube.com/vi/${item.video.youtube_id}/hqdefault.jpg`
                        }
                        alt={item.video.title}
                        className="aspect-video w-full object-cover"
                      />
                      {/* Progress bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium text-gray-900 truncate text-sm">
                        {item.video.title}
                      </p>
                      {item.lecture && (
                        <p className="mt-1 text-xs text-gray-500 truncate">
                          <BookOpen className="mr-1 inline h-3 w-3" />
                          {item.lecture.title}
                        </p>
                      )}
                      {item.curriculum && (
                        <p className="mt-0.5 text-xs text-blue-600 truncate">
                          📚 {item.curriculum.title}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Favorites */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            즐겨찾기한 강의
          </h2>
          <Link href="/mypage/favorites">
            <Button variant="ghost" size="sm">
              전체 보기
            </Button>
          </Link>
        </div>
        {favoritesLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-video" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Heart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">즐겨찾기한 강의가 없습니다.</p>
              <Link href="/lectures">
                <Button variant="outline" className="mt-4">
                  강의 둘러보기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {favorites.slice(0, 4).map((fav) => (
              <LectureCard key={fav.id} lecture={fav.video} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Notes */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">최근 메모</h2>
          <Link href="/mypage/notes">
            <Button variant="ghost" size="sm">
              전체 보기
            </Button>
          </Link>
        </div>
        {notesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">작성한 메모가 없습니다.</p>
              <Link href="/lectures">
                <Button variant="outline" className="mt-4">
                  강의 시청하며 메모하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notes.slice(0, 5).map((note) => (
              <Link key={note.id} href={`/lectures/${note.video_id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {note.cue && (
                          <p className="mb-1 text-sm font-medium text-blue-600">
                            {note.cue}
                          </p>
                        )}
                        <p className="line-clamp-2 text-sm text-gray-700">
                          {note.content}
                        </p>
                      </div>
                      {note.is_complete && (
                        <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          완료
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Settings Link */}
      <Card>
        <CardContent className="p-4">
          <Link
            href="/mypage/settings"
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
          >
            <Settings className="h-5 w-5" />
            <span>프로필 설정</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
