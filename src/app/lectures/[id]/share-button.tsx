"use client";

import { useState, useCallback } from "react";
import { Share2, Check, Link2 } from "lucide-react";

interface ShareButtonProps {
  lectureId: string;
  videoId?: string;
  curriculumId?: string;
  lectureTitle: string;
}

export function ShareButton({
  lectureId,
  videoId,
  curriculumId,
  lectureTitle,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = useCallback(() => {
    const base = `${window.location.origin}/lectures/${lectureId}`;
    const params = new URLSearchParams();
    if (videoId) params.set("v", videoId);
    if (curriculumId) params.set("curriculum", curriculumId);
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [lectureId, videoId, curriculumId]);

  const isMobile = useCallback(() => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }, []);

  const handleShare = async () => {
    const url = getShareUrl();

    // 모바일에서만 네이티브 공유 시트 사용
    if (isMobile() && navigator.share) {
      try {
        await navigator.share({ title: lectureTitle, url });
        return;
      } catch {
        // 사용자가 취소한 경우 클립보드 복사로 폴백
      }
    }

    // 데스크톱은 항상 클립보드 복사
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("아래 링크를 복사하세요:", url);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100"
      aria-label="강의 공유"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" />
          <span>공유</span>
        </>
      )}
    </button>
  );
}
