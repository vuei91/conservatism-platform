"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Lecture, Category } from "@/types/database";

export function useLectures(options?: {
  categoryId?: string;
  difficulty?: string;
  featured?: boolean;
  limit?: number;
  search?: string;
  includeUnpublished?: boolean;
}) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["lectures", options],
    queryFn: async () => {
      let query = supabase
        .from("lectures")
        .select("*, category:categories(*)")
        .order("created_at", { ascending: false });

      // 관리자가 아닌 경우 공개된 강의만
      if (!options?.includeUnpublished) {
        query = query.eq("is_published", true);
      }

      if (options?.categoryId) {
        query = query.eq("category_id", options.categoryId);
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
      if (options?.search) {
        query = query.ilike("title", `%${options.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Lecture & { category: Category | null })[];
    },
  });
}

export function useLecture(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["lecture", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lectures")
        .select("*, category:categories(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Lecture & { category: Category | null };
    },
    enabled: !!id,
  });
}

export function useIncrementViewCount() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lectureId: string) => {
      const { error } = await supabase.rpc("increment_view_count", {
        lecture_id: lectureId,
      });
      if (error) throw error;
    },
    onSuccess: (_, lectureId) => {
      queryClient.invalidateQueries({ queryKey: ["lecture", lectureId] });
    },
  });
}
