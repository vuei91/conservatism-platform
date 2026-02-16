"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useCurriculums(options?: {
  difficulty?: string;
  featured?: boolean;
  limit?: number;
  includeUnpublished?: boolean;
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
            lecture:lectures(
              id,
              title,
              thumbnail_url,
              lecture_videos(
                id,
                video:videos(duration, youtube_id, thumbnail_url)
              )
            )
          )
        `,
        )
        .order("order", { ascending: true });

      if (!options?.includeUnpublished) {
        query = query.eq("is_published", true);
      }

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

        const lectureCount = sortedLectures.length;

        const totalVideoCount = sortedLectures.reduce(
          (
            acc: number,
            cl: { lecture: { lecture_videos?: unknown[] } | null },
          ) => acc + (cl.lecture?.lecture_videos?.length || 0),
          0,
        );

        const totalDuration = sortedLectures.reduce(
          (
            acc: number,
            cl: {
              lecture: {
                lecture_videos?: {
                  video: { duration: number | null } | null;
                }[];
              } | null;
            },
          ) =>
            acc +
            (cl.lecture?.lecture_videos?.reduce(
              (
                vAcc: number,
                lv: { video: { duration: number | null } | null },
              ) => vAcc + (lv.video?.duration || 0),
              0,
            ) || 0),
          0,
        );

        // 첫 번째 강의의 첫 번째 영상 썸네일
        const firstLecture = sortedLectures[0]?.lecture;
        const firstVideo = firstLecture?.lecture_videos?.[0]?.video;
        const thumbnail =
          curriculum.thumbnail_url ||
          firstVideo?.thumbnail_url ||
          (firstVideo?.youtube_id
            ? `https://img.youtube.com/vi/${firstVideo.youtube_id}/mqdefault.jpg`
            : null);

        return {
          ...curriculum,
          lectureCount,
          totalVideoCount,
          totalDuration,
          thumbnail,
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
            lecture:lectures(
              *,
              lecture_videos(
                id,
                order,
                video:videos(*)
              )
            )
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      const sortedLectures = data.curriculum_lectures?.sort(
        (a: { order: number }, b: { order: number }) => a.order - b.order,
      );

      const totalVideoCount =
        sortedLectures?.reduce(
          (
            acc: number,
            cl: { lecture: { lecture_videos?: unknown[] } | null },
          ) => acc + (cl.lecture?.lecture_videos?.length || 0),
          0,
        ) || 0;

      const totalDuration =
        sortedLectures?.reduce(
          (
            acc: number,
            cl: {
              lecture: {
                lecture_videos?: {
                  video: { duration: number | null } | null;
                }[];
              } | null;
            },
          ) =>
            acc +
            (cl.lecture?.lecture_videos?.reduce(
              (
                vAcc: number,
                lv: { video: { duration: number | null } | null },
              ) => vAcc + (lv.video?.duration || 0),
              0,
            ) || 0),
          0,
        ) || 0;

      return {
        ...data,
        curriculum_lectures: sortedLectures,
        lectureCount: sortedLectures?.length || 0,
        totalVideoCount,
        totalDuration,
      };
    },
    enabled: !!id,
  });
}
