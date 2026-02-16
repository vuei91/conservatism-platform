"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Video } from "@/types/database";

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
        .from("lectures")
        .select(
          `
          *,
          lecture_videos(
            id,
            order,
            video:videos(duration, youtube_id, thumbnail_url)
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

      return data.map((lecture) => {
        const sortedVideos =
          lecture.lecture_videos?.sort(
            (a: { order: number }, b: { order: number }) => a.order - b.order,
          ) || [];

        const thumbnails = sortedVideos
          .slice(0, 4)
          .map(
            (lv: {
              video: {
                youtube_id: string;
                thumbnail_url: string | null;
              } | null;
            }) =>
              lv.video?.thumbnail_url ||
              (lv.video?.youtube_id
                ? `https://img.youtube.com/vi/${lv.video.youtube_id}/mqdefault.jpg`
                : null),
          )
          .filter(Boolean);

        return {
          ...lecture,
          lectureCount: lecture.lecture_videos?.length || 0,
          totalDuration:
            lecture.lecture_videos?.reduce(
              (
                acc: number,
                lv: { video: { duration: number | null } | null },
              ) => acc + (lv.video?.duration || 0),
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
        .from("lectures")
        .select(
          `
          *,
          lecture_videos(
            id,
            order,
            video:videos(*)
          )
        `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      const sortedVideos = data.lecture_videos?.sort(
        (a: { order: number }, b: { order: number }) => a.order - b.order,
      );

      return {
        ...data,
        lecture_videos: sortedVideos,
        lectureCount: sortedVideos?.length || 0,
        totalDuration:
          sortedVideos?.reduce(
            (acc: number, lv: { video: Video | null }) =>
              acc + (lv.video?.duration || 0),
            0,
          ) || 0,
      };
    },
    enabled: !!id,
  });
}
