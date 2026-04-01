# 보수학당 프로젝트 컨벤션

## 기술 스택

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4 (postcss 기반, tailwind.config 없음)
- Supabase (PostgreSQL, Auth, RLS)
- Zustand (클라이언트 상태), TanStack Query (서버 상태)
- React Hook Form + Zod (폼 검증)
- Lucide React (아이콘)
- Nodemailer (이메일)

## 디렉토리 구조

```
src/
├── app/           # Next.js App Router 페이지
│   ├── (auth)/    # 인증 관련 (로그인, 회원가입 등)
│   ├── admin/     # 관리자 페이지 (CRUD)
│   ├── api/       # API 라우트
│   ├── lectures/  # 강의 목록/상세
│   ├── curriculums/ # 커리큘럼 목록/상세
│   └── mypage/    # 마이페이지
├── components/    # 재사용 컴포넌트
│   ├── ui/        # 기본 UI (Button, Card, Input, Modal 등)
│   ├── layout/    # Header, Footer, EmailVerifyBanner
│   ├── lectures/  # 강의 관련 컴포넌트
│   └── curriculum/ # 커리큘럼 관련 컴포넌트
├── hooks/         # 커스텀 훅 (TanStack Query 기반)
├── lib/           # 유틸리티, Supabase 클라이언트
├── providers/     # React 프로바이더 (Query, Auth)
├── stores/        # Zustand 스토어
└── types/         # TypeScript 타입 정의
```

## 코딩 컨벤션

### 컴포넌트

- 서버 컴포넌트가 기본. 클라이언트 컴포넌트는 `"use client"` 명시
- 서버 컴포넌트에서 `createClient()` (from `@/lib/supabase/server`)로 데이터 조회
- 클라이언트 컴포넌트에서 `createClient()` (from `@/lib/supabase/client`)로 데이터 조회
- UI 컴포넌트는 `@/components/ui`에서 import
- 아이콘은 `lucide-react`에서 import

### 훅 패턴

- 데이터 조회: `useQuery` (TanStack Query)
- 데이터 변경: `useMutation` + `queryClient.invalidateQueries`
- 인증 상태: `useAuthStore` (Zustand)
- 훅은 `src/hooks/`에 정의하고 `src/hooks/index.ts`에서 re-export

### Supabase 클라이언트

- 브라우저: `createClient()` from `@/lib/supabase/client`
- 서버 컴포넌트/API: `createClient()` from `@/lib/supabase/server`
- 관리자 (RLS 우회): `supabaseAdmin` from `@/lib/supabase/admin`

### 스타일링

- Tailwind CSS 유틸리티 클래스 사용
- `cn()` 함수로 조건부 클래스 병합 (`@/lib/utils`)
- 브랜드 컬러: `sequoia-*` (primary)
- 반응형: `sm:`, `md:`, `lg:` 브레이크포인트

### 폼

- `react-hook-form` + `zodResolver` 사용
- Zod 스키마로 검증 규칙 정의
- 에러 메시지는 한국어

### 데이터 모델

- 타입 정의: `@/types/database.ts` (Supabase 자동 생성 타입)
- 편의 타입: `Tables<"테이블명">`, `InsertTables<"테이블명">`, `UpdateTables<"테이블명">`
- 관계 타입: `VideoWithCategory`, `LectureWithVideos`, `CurriculumWithLectures` 등

### 관리자 페이지 패턴

- `src/app/admin/[리소스]/page.tsx` — 목록 (조회, 삭제, 토글)
- `src/app/admin/[리소스]/new/page.tsx` — 생성 (폼)
- `src/app/admin/[리소스]/[id]/edit/page.tsx` — 수정 (폼)
- 모두 `"use client"` 클라이언트 컴포넌트

### 언어

- UI 텍스트, 에러 메시지, 주석: 한국어
- 코드 (변수명, 함수명, 타입명): 영어

## 참고 파일

- 데이터 모델: #[[file:src/types/database.ts]]
- 유틸리티: #[[file:src/lib/utils.ts]]
