import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, Play, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button, Badge, Card, CardContent } from "@/components/ui";
import {
  formatDuration,
  getDifficultyLabel,
  getDifficultyColor,
  getYouTubeThumbnail,
} from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CurriculumDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: curriculum, error } = await supabase
    .from("curriculums")
    .select(
      `
      *,
      curriculum_lectures(
        id,
        order,
        lecture:lectures(*)
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !curriculum) {
    notFound();
  }

  const sortedLectures =
    curriculum.curriculum_lectures?.sort(
      (a: { order: number }, b: { order: number }) => a.order - b.order,
    ) || [];

  const totalDuration = sortedLectures.reduce(
    (acc: number, cl: { lecture: { duration: number | null } | null }) =>
      acc + (cl.lecture?.duration || 0),
    0,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4">
          <Badge className={getDifficultyColor(curriculum.difficulty)}>
            {getDifficultyLabel(curriculum.difficulty)}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{curriculum.title}</h1>
        {curriculum.description && (
          <p className="mt-4 text-lg text-gray-600">{curriculum.description}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {sortedLectures.length}개 강의
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />총 {Math.round(totalDuration / 60)}분
          </span>
        </div>

        {curriculum.learning_goals && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">학습 목표</h2>
            <p className="mt-2 whitespace-pre-wrap text-gray-600">
              {curriculum.learning_goals}
            </p>
          </div>
        )}

        {sortedLectures.length > 0 && (
          <div className="mt-6">
            <Link href={`/lectures/${sortedLectures[0].lecture?.id}`}>
              <Button size="lg">
                <Play className="mr-2 h-5 w-5" />
                학습 시작하기
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Lecture List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">강의 목록</h2>
        <div className="space-y-3">
          {sortedLectures.map(
            (
              cl: {
                id: string;
                order: number;
                lecture: {
                  id: string;
                  title: string;
                  youtube_id: string;
                  thumbnail_url: string | null;
                  duration: number | null;
                  instructor: string | null;
                } | null;
              },
              index: number,
            ) => {
              const lecture = cl.lecture;
              if (!lecture) return null;

              return (
                <Link key={cl.id} href={`/lectures/${lecture.id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                        <Image
                          src={
                            lecture.thumbnail_url ||
                            getYouTubeThumbnail(lecture.youtube_id)
                          }
                          alt={lecture.title}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {lecture.title}
                        </h3>
                        {lecture.instructor && (
                          <p className="text-sm text-gray-500">
                            {lecture.instructor}
                          </p>
                        )}
                      </div>
                      {lecture.duration && (
                        <div className="flex-shrink-0 text-sm text-gray-500">
                          {formatDuration(lecture.duration)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}
