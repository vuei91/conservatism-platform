---
name: admin-crud
description: "관리자 CRUD 페이지를 생성하거나 수정하는 스킬. 목록/생성/수정 페이지, React Hook Form + Zod 폼 검증, Supabase 데이터 연동을 포함. '관리자 페이지', 'admin 페이지', 'CRUD 페이지', '관리 페이지 만들어줘', '목록 페이지', '생성 폼', '수정 폼', '어드민' 등의 요청 시 반드시 이 스킬을 사용할 것."
---

# 관리자 CRUD 페이지 생성 스킬

관리자 페이지는 3개 파일로 구성된다.

## 파일 구조

```
src/app/admin/{리소스}/
├── page.tsx              # 목록 (조회, 삭제, 토글)
├── new/page.tsx          # 생성 폼
└── [id]/edit/page.tsx    # 수정 폼
```

## 목록 페이지 패턴

```typescript
"use client";

// 필수 import
import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button, Card, CardContent, Badge, Skeleton } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function Admin리소스Page() {
  // 1. 데이터 조회 (커스텀 훅 또는 useQuery)
  // 2. 삭제 핸들러: confirm() → supabase.delete → invalidateQueries
  // 3. 토글 핸들러: supabase.update → invalidateQueries
  // 4. UI: 헤더(제목 + 등록 버튼) → 로딩/빈 상태/목록
}
```

## 생성/수정 폼 패턴

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. Zod 스키마 정의
const schema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  // ...
});

type FormData = z.infer<typeof schema>;

export default function New리소스Page() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      /* ... */
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const supabase = createClient();
    // insert 또는 update
    await queryClient.invalidateQueries({ queryKey: ["리소스키"] });
    router.push("/admin/리소스");
  };

  // UI: Card > form > 필드들 > 제출/취소 버튼
}
```

## 핵심 규칙

1. 모든 관리자 페이지는 `"use client"` 클라이언트 컴포넌트
2. 삭제 전 `confirm()` 확인 대화상자 표시
3. 폼 검증은 Zod 스키마 + zodResolver
4. 에러/로딩 상태를 `useState`로 관리
5. 성공 시 `queryClient.invalidateQueries` 후 목록으로 이동
6. UI 컴포넌트는 `@/components/ui`에서 import
7. 에러 메시지, 라벨, placeholder는 한국어

## 참고

- 기존 목록 페이지: #[[file:src/app/admin/lectures/page.tsx]]
- 기존 생성 폼: #[[file:src/app/admin/lectures/new/page.tsx]]
