"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Favorite, Video } from "@/types/database";

export function useFavorites() {
  const supabase = createClient();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("favorites")
        .select("*, video:videos(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Favorite & { video: Video })[];
    },
    enabled: !!user,
  });
}

export function useIsFavorite(videoId: string) {
  const supabase = createClient();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["favorite", user?.id, videoId],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("video_id", videoId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!videoId,
  });
}

export function useToggleFavorite() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!user) throw new Error("로그인이 필요합니다.");

      const { data: existing } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("video_id", videoId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return false;
      } else {
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          video_id: videoId,
        });
        if (error) throw error;
        return true;
      }
    },
    onSuccess: (_, videoId) => {
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["favorite", user?.id, videoId],
      });
    },
  });
}
