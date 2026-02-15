"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function EmailVerifiedModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setShow(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setShow(false);
    // URL에서 verified 파라미터 제거
    const url = new URL(window.location.href);
    url.searchParams.delete("verified");
    router.replace(url.pathname + url.search, { scroll: false });
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verified-title"
    >
      <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2
          id="verified-title"
          className="mb-2 text-xl font-bold text-gray-900"
        >
          이메일 인증 완료
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          이메일 인증이 완료되었습니다. 이제 모든 기능을 이용할 수 있습니다.
        </p>
        <Button type="button" className="w-full" onClick={handleClose}>
          확인
        </Button>
      </div>
    </div>
  );
}
