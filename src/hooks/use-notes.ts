"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import type { Note, InsertTables, UpdateTables } from "@/types/database";

export function useNotes(lectureId?: string) {
  const supabase = createClient();
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["notes", user?.id, lectureId],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: true });

      if (lectureId) {
        query = query.eq("lecture_id", lectureId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user,
  });
}

export function useCreateNote() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (
      note: Omit<
        InsertTables<"notes">,
        "user_id" | "id" | "created_at" | "updated_at"
      >,
    ) => {
      if (!user) throw new Error("로그인이 필요합니다.");

      const { data, error } = await supabase
        .from("notes")
        .insert({ ...note, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", user?.id, data.lecture_id],
      });
      queryClient.invalidateQueries({ queryKey: ["notes", user?.id] });
    },
  });
}

export function useUpdateNote() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: UpdateTables<"notes"> & { id: string }) => {
      const { data, error } = await supabase
        .from("notes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Note;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", user?.id, data.lecture_id],
      });
      queryClient.invalidateQueries({ queryKey: ["notes", user?.id] });
    },
  });
}

export function useDeleteNote() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      id,
      lectureId,
    }: {
      id: string;
      lectureId: string;
    }) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
      return lectureId;
    },
    onSuccess: (lectureId) => {
      queryClient.invalidateQueries({
        queryKey: ["notes", user?.id, lectureId],
      });
      queryClient.invalidateQueries({ queryKey: ["notes", user?.id] });
    },
  });
}
