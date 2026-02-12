"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Curriculum, CurriculumLecture, Lecture } from "@/types/database";

export function useCurriculums(options?: {
  difficulty?: string;
  featured?: boolean;
  limit?: number;
}) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["curriculums", options],
    queryFn: async () => {
      let query = supabase
        .from("curriculums")
        .select(
          `
          *,
          curriculum_lectures(
            id,
            order,
            lecture:lectures(duration, youtube_id, thumbnail_url)
          )
        `,
        )
        .eq("is_published", true)
        .order("order", { ascending: true });

      if (options?.difficulty) {
        query = query.eq(
          "difficulty",
          options.difficulty as "beginner" | "intermediate" | "advanced",
        );
      }
      if (options?.featured) {
        query = query.eq("is_featured", true);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map((curriculum) => {
        const sortedLectures =
          curriculum.curriculum_lectures?.sort(
            (a: { order: number }, b: { order: number }) => a.order - b.order,
          ) || [];

        // 상위 4개 강의의 썸네일
        const thumbnails = sortedLectures
          .slice(0, 4)
          .map(
            (cl: {
              lecture: {
                youtube_id: string;
                thumbnail_url: string | null;
              } | null;
            }) =>
              cl.lecture?.thumbnail_url ||
              (cl.lecture?.youtube_id
                ? `https://img.youtube.com/vi/${cl.lecture.youtube_id}/mqdefault.jpg`
                : null),
          )
          .filter(Boolean);

        return {
          ...curriculum,
          lectureCount: curriculum.curriculum_lectures?.length || 0,
          totalDuration:
            curriculum.curriculum_lectures?.reduce(
              (
                acc: number,
                cl: { lecture: { duration: number | null } | null },
              ) => acc + (cl.lecture?.duration || 0),
              0,
            ) || 0,
          thumbnails,
        };
      });
    },
  });
}

export function useCurriculum(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["curriculum", id],
    queryFn: async () => {
      const { data, error } = await supabase
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

      if (error) throw error;

      const sortedLectures = data.curriculum_lectures?.sort(
        (a: { order: number }, b: { order: number }) => a.order - b.order,
      );

      return {
        ...data,
        curriculum_lectures: sortedLectures,
        lectureCount: sortedLectures?.length || 0,
        totalDuration:
          sortedLectures?.reduce(
            (acc: number, cl: { lecture: Lecture | null }) =>
              acc + (cl.lecture?.duration || 0),
            0,
          ) || 0,
      };
    },
    enabled: !!id,
  });
}
