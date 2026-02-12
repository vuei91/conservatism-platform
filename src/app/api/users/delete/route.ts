import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing environment variables");
      return NextResponse.json(
        { error: "서버 설정 오류입니다." },
        { status: 500 },
      );
    }

    // 현재 로그인한 사용자 확인
    const supabase = await createServerClient();
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    const { userId, isAdmin } = await request.json();

    // 관리자가 다른 사용자를 삭제하는 경우
    if (isAdmin && userId !== currentUser.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      if (profile?.role !== "admin") {
        return NextResponse.json(
          { error: "권한이 없습니다." },
          { status: 403 },
        );
      }
    } else if (userId && userId !== currentUser.id) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const targetUserId = userId || currentUser.id;

    // Admin 클라이언트 생성
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 관련 데이터 삭제
    await Promise.all([
      supabaseAdmin.from("notes").delete().eq("user_id", targetUserId),
      supabaseAdmin.from("favorites").delete().eq("user_id", targetUserId),
      supabaseAdmin.from("watch_history").delete().eq("user_id", targetUserId),
      supabaseAdmin
        .from("learning_progress")
        .delete()
        .eq("user_id", targetUserId),
      supabaseAdmin
        .from("review_schedules")
        .delete()
        .eq("user_id", targetUserId),
    ]);

    // profiles 삭제
    await supabaseAdmin.from("profiles").delete().eq("id", targetUserId);

    // Auth에서 사용자 삭제
    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
      console.error("User deletion error:", deleteError);
      return NextResponse.json(
        { error: "사용자 삭제에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
