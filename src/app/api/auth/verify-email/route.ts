import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      `${origin}/login?error=유효하지 않은 인증 링크입니다`,
    );
  }

  // admin 클라이언트 사용 (비로그인 상태에서 RLS 우회)
  const supabase = supabaseAdmin;

  // 토큰 조회
  const { data: tokenData, error: tokenError } = await supabase
    .from("email_verification_tokens")
    .select("*")
    .eq("token", token)
    .is("verified_at", null)
    .single();

  if (tokenError || !tokenData) {
    return NextResponse.redirect(
      `${origin}/login?error=유효하지 않거나 이미 사용된 인증 링크입니다`,
    );
  }

  // 만료 확인
  if (new Date(tokenData.expires_at) < new Date()) {
    return NextResponse.redirect(
      `${origin}/login?error=인증 링크가 만료되었습니다. 다시 회원가입해주세요`,
    );
  }

  // 토큰을 인증 완료로 표시
  await supabase
    .from("email_verification_tokens")
    .update({ verified_at: new Date().toISOString() })
    .eq("id", tokenData.id);

  // Supabase 사용자의 이메일 인증 상태 업데이트
  // admin API가 필요하므로 profiles 테이블에 email_verified 플래그 사용
  await supabase
    .from("profiles")
    .update({ email_verified: true })
    .eq("id", tokenData.user_id);

  return NextResponse.redirect(`${origin}/?verified=true`);
}
