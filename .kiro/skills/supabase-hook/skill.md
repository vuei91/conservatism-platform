---
name: supabase-hook
description: "Supabase 데이터 연동 커스텀 훅을 생성하거나 수정하는 스킬. TanStack Query 기반 useQuery/useMutation 훅, Supabase 클라이언트 연동, 쿼리 키 관리, 캐시 무효화 패턴을 포함. '훅 만들어줘', '데이터 조회 훅', 'useQuery', 'useMutation', 'Supabase 쿼리', '커스텀 훅 생성', 'TanStack Query 훅' 등의 요청 시 반드시 이 스킬을 사용할 것."
---

# Supabase 커스텀 훅 생성 스킬

이 프로젝트의 데이터 조회/변경 훅은 일관된 패턴을 따른다.

## 훅 파일 위치

- `src/hooks/use-{리소스명}.ts`에 생성
- `src/hooks/index.ts`에서 re-export 추가

## 조회 훅 패턴 (useQuery)

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { 타입 } from "@/types/database";

export function use리소스(options?: { 필터옵션 }) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["리소스키", options],
    queryFn: async () => {
      let query = supabase
        .from("테이블명")
        .select("*")
        .order("created_at", { ascending: false });

      // 필터 적용
      if (options?.필터) {
        query = query.eq("컬럼", options.필터);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as 타입[];
    },
  });
}
```

## 변경 훅 패턴 (useMutation)

```typescript
export function useCreate리소스() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (
      input: Omit<InsertTables<"테이블">, "user_id" | "id" | "created_at">,
    ) => {
      if (!user) throw new Error("로그인이 필요합니다.");

      const { data, error } = await supabase
        .from("테이블")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["리소스키"] });
    },
  });
}
```

## 핵심 규칙

1. 파일 최상단에 `"use client"` 선언
2. `createClient()`는 훅 함수 본문 최상위에서 호출 (조건문 안에서 호출 금지)
3. 인증이 필요한 훅은 `useAuthStore`에서 `user`를 가져와 `enabled: !!user` 설정
4. 쿼리 키는 `["리소스명", ...의존성]` 형태로 구성
5. 변경 후 `queryClient.invalidateQueries`로 관련 쿼리 무효화
6. 타입은 `@/types/database`에서 import
7. 에러 메시지는 한국어
8. 생성 후 `src/hooks/index.ts`에 export 추가

## 참고

- 기존 훅 패턴: #[[file:src/hooks/use-notes.ts]]
- 데이터 모델: #[[file:src/types/database.ts]]
