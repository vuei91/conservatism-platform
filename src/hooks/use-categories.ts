"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/database";

export function useCategories() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });
}
