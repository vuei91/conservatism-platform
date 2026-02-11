import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  // createBrowserClient는 내부적으로 싱글톤을 관리하므로
  // 직접 싱글톤 패턴을 구현할 필요 없음
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
