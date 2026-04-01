---
name: component-page
description: "사용자 대면 페이지나 재사용 컴포넌트를 생성하거나 수정하는 스킬. Next.js App Router 페이지, 서버/클라이언트 컴포넌트, Tailwind CSS 스타일링, 반응형 레이아웃을 포함. '페이지 만들어줘', '컴포넌트 만들어줘', '화면 구현', 'UI 구현', '레이아웃', '카드 컴포넌트', '목록 페이지', '상세 페이지' 등의 요청 시 반드시 이 스킬을 사용할 것."
---

# 페이지/컴포넌트 생성 스킬

## 서버 컴포넌트 페이지 (기본)

데이터를 서버에서 조회하여 렌더링하는 페이지.

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function 페이지명Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("테이블").select("*");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* 콘텐츠 */}
    </div>
  );
}
```

## 클라이언트 컴포넌트

인터랙션이 필요한 컴포넌트.

```typescript
"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";

interface Props { /* ... */ }

export function 컴포넌트명({ ...props }: Props) {
  return (/* JSX */);
}
```

## 핵심 규칙

1. 서버 컴포넌트가 기본. 상태/이벤트가 필요할 때만 `"use client"`
2. 레이아웃 래퍼: `mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8`
3. 반응형 그리드: `grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3`
4. 카드: `Card`, `CardContent` from `@/components/ui`
5. 이미지: `next/image`의 `Image` 컴포넌트 사용 (fill + sizes 속성)
6. 로딩: `Skeleton` 컴포넌트 또는 `loading.tsx`
7. 빈 상태: 안내 메시지 + 액션 버튼
8. 브랜드 컬러: `sequoia-*` (primary), `gray-*` (neutral)
9. 난이도 표시: `getDifficultyLabel()`, `getDifficultyColor()` from `@/lib/utils`
10. 시간 표시: `formatDuration()`, `formatTimestamp()` from `@/lib/utils`

## UI 컴포넌트 목록

- `Button` — variant: primary/secondary/outline/ghost/danger, size: sm/md/lg
- `Card`, `CardHeader`, `CardContent`, `CardFooter`
- `Input` — label, error props
- `Badge` — variant: default/info/warning
- `Modal` — 모달 다이얼로그
- `Pagination` — 페이지네이션
- `Skeleton` — 로딩 스켈레톤

## 참고

- 홈 페이지: #[[file:src/app/page.tsx]]
- 카드 컴포넌트: #[[file:src/components/lectures/lecture-card.tsx]]
