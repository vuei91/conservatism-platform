import Link from "next/link";
import { ArrowRight, BookOpen, Play, Users } from "lucide-react";
import { Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { LectureCard } from "@/components/lectures";
import { CurriculumCard } from "@/components/curriculum";

export default async function HomePage() {
  const supabase = await createClient();

  const [lecturesResult, curriculumsResult, categoriesResult] =
    await Promise.all([
      supabase
        .from("lectures")
        .select("*, category:categories(*)")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("curriculums")
        .select(
          `
        *,
        curriculum_lectures(
          id,
          lecture:lectures(duration)
        )
      `,
        )
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("order", { ascending: true })
        .limit(4),
      supabase
        .from("categories")
        .select("*")
        .order("order", { ascending: true }),
    ]);

  const lectures = lecturesResult.data || [];
  const curriculums = (curriculumsResult.data || []).map((c) => ({
    ...c,
    lectureCount: c.curriculum_lectures?.length || 0,
    totalDuration:
      c.curriculum_lectures?.reduce(
        (acc: number, cl: { lecture: { duration: number | null } | null }) =>
          acc + (cl.lecture?.duration || 0),
        0,
      ) || 0,
  }));
  const categories = categoriesResult.data || [];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              보수주의 사상을
              <br />
              체계적으로 배우세요
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
              유튜브에 산재된 양질의 보수주의 강의를 체계적으로 정리하여 무료로
              제공합니다. 로그인 없이도 모든 강의를 시청할 수 있습니다.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/lectures">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <Play className="mr-2 h-5 w-5" />
                  강의 둘러보기
                </Button>
              </Link>
              <Link href="/curriculums">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  커리큘럼 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-gray-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">100+</div>
              <div className="mt-1 text-sm text-gray-600">강의 수</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">10+</div>
              <div className="mt-1 text-sm text-gray-600">커리큘럼</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">5+</div>
              <div className="mt-1 text-sm text-gray-600">카테고리</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">무료</div>
              <div className="mt-1 text-sm text-gray-600">모든 콘텐츠</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Curriculums */}
      {curriculums.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  추천 커리큘럼
                </h2>
                <p className="mt-1 text-gray-600">
                  체계적인 학습을 위한 커리큘럼을 확인하세요
                </p>
              </div>
              <Link href="/curriculums">
                <Button variant="ghost">
                  전체 보기
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {curriculums.map((curriculum) => (
                <CurriculumCard key={curriculum.id} curriculum={curriculum} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                카테고리별 강의
              </h2>
              <p className="mt-1 text-gray-600">
                관심 있는 분야의 강의를 찾아보세요
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/lectures?category=${category.slug}`}
                  className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6 text-center transition-shadow hover:shadow-md"
                >
                  <Users className="mb-3 h-8 w-8 text-blue-600" />
                  <span className="font-medium text-gray-900">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Lectures */}
      {lectures.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">추천 강의</h2>
                <p className="mt-1 text-gray-600">
                  엄선된 보수주의 강의를 만나보세요
                </p>
              </div>
              <Link href="/lectures">
                <Button variant="ghost">
                  전체 보기
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {lectures.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            지금 바로 학습을 시작하세요
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            회원가입 없이도 모든 강의를 무료로 시청할 수 있습니다. 로그인하면
            학습 기록과 메모 기능을 이용할 수 있습니다.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/lectures">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                강의 시작하기
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                회원가입
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
