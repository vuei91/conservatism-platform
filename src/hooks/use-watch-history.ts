"use client";

import { useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type {
  Video,
  Lecture,
  Curriculum,
  WatchHistory,
} from "@/types/database";

export type WatchHistoryWithDetails = WatchHistory & {
  video: Video;
  lecture: Lecture | null;
  curriculum: Curriculum | null;
};

export function useContinueWatching() {
  const supabase = createClient();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["continue-watching", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("watch_history")
        .select(
          "*, video:videos(*), lecture:lectures(*), curriculum:curriculums(*)",
        )
        .eq("user_id", user.id)
        .eq("is_completed", false)
        .order("last_watched_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as WatchHistoryWithDetails[];
    },
    enabled: !!user,
  });
}

export function useUpdateWatchHistory() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      videoId,
      lectureId,
      curriculumId,
      progress,
      duration,
    }: {
      videoId: string;
      lectureId: string;
      curriculumId?: string;
      progress: number;
      duration: number;
    }) => {
      const user = useAuthStore.getState().user;
      if (!user) return;

      const isCompleted = duration > 0 && progress / duration >= 0.9;

      const { data: existing } = await supabase
        .from("watch_history")
        .select("id")
        .eq("user_id", user.id)
        .eq("video_id", videoId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("watch_history")
          .update({
            progress,
            is_completed: isCompleted,
            lecture_id: lectureId,
            curriculum_id: curriculumId || null,
            last_watched_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("watch_history").insert({
          user_id: user.id,
          video_id: videoId,
          lecture_id: lectureId,
          curriculum_id: curriculumId || null,
          progress,
          is_completed: isCompleted,
          last_watched_at: new Date().toISOString(),
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["continue-watching"] });
    },
  });
}

/** Throttled watch progress tracker - saves every 10 seconds */
export function useWatchProgressTracker(
  videoId: string,
  lectureId: string,
  curriculumId?: string,
) {
  const updateWatchHistory = useUpdateWatchHistory();
  const lastSavedRef = useRef(0);
  const mutateRef = useRef(updateWatchHistory.mutate);
  mutateRef.current = updateWatchHistory.mutate;

  const paramsRef = useRef({ videoId, lectureId, curriculumId });
  paramsRef.current = { videoId, lectureId, curriculumId };

  const trackProgress = useCallback((currentTime: number, duration: number) => {
    const now = Date.now();
    if (now - lastSavedRef.current < 10000) return; // throttle: 10초
    lastSavedRef.current = now;

    const { videoId, lectureId, curriculumId } = paramsRef.current;
    mutateRef.current({
      videoId,
      lectureId,
      curriculumId,
      progress: currentTime,
      duration,
    });
  }, []);

  return trackProgress;
}
