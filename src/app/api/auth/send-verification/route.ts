import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resend, EMAIL_FROM } from "@/lib/resend";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email, userId } = await request.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: "이메일과 사용자 ID가 필요합니다." },
        { status: 400 },
      );
    }

    // admin 클라이언트 사용 (RLS 우회)
    const supabase = supabaseAdmin;

    // 기존 미사용 토큰 삭제
    await supabase
      .from("email_verification_tokens")
      .delete()
      .eq("user_id", userId)
      .is("verified_at", null);

    // 새 토큰 생성 (24시간 유효)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from("email_verification_tokens")
      .insert({
        user_id: userId,
        email,
        token,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("토큰 저장 실패:", insertError);
      return NextResponse.json(
        { error: "인증 메일 발송에 실패했습니다." },
        { status: 500 },
      );
    }

    // Resend로 인증 메일 발송
    const verifyUrl = `${new URL(request.url).origin}/api/auth/verify-email?token=${token}`;

    const { error: sendError } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "이메일 인증을 완료해주세요",
      html: `
        <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <h1 style="font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 16px;">
            이메일 인증
          </h1>
          <p style="font-size: 14px; color: #4b5563; margin-bottom: 24px;">
            아래 버튼을 클릭하여 이메일 인증을 완료해주세요.
          </p>
          <a href="${verifyUrl}"
             style="display: inline-block; padding: 12px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
            이메일 인증하기
          </a>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">
            이 링크는 24시간 동안 유효합니다. 본인이 요청하지 않았다면 이 메일을 무시해주세요.
          </p>
        </div>
      `,
    });

    if (sendError) {
      console.error("Resend 발송 실패:", sendError);
      return NextResponse.json(
        { error: "인증 메일 발송에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("인증 메일 발송 오류:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
