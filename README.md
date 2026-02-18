# 보수학당

유튜브에 산재된 보수주의 관련 강의 영상을 체계적으로 정리하여 무료로 제공하는 교육 플랫폼입니다.

## 기술 스택

- **프론트엔드**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **상태 관리**: Zustand, TanStack Query
- **백엔드/DB**: Supabase (PostgreSQL, Auth, RLS)
- **배포**: Vercel

## 주요 기능

- 강의 탐색 및 시청 (비로그인 가능)
- 커리큘럼 기반 체계적 학습
- 코넬노트 형식 메모 기능 (로그인 시)
- 즐겨찾기 및 시청 기록 (로그인 시)
- 관리자 대시보드 (강의/커리큘럼/카테고리 관리)

## 시작하기

### 1. 환경 변수 설정

`.env.local.example`을 복사하여 `.env.local` 파일을 생성하고 값을 설정하세요:

```bash
cp .env.local.example .env.local
```

필요한 환경 변수:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 키
- `YOUTUBE_API_KEY`: YouTube Data API 키 (선택)

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `supabase/schema.sql` 파일의 SQL을 Supabase SQL Editor에서 실행
3. Authentication 설정에서 소셜 로그인 프로바이더 설정 (Google, Kakao 등)

### 3. 의존성 설치 및 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── (auth)/            # 인증 관련 페이지 (로그인, 회원가입)
│   ├── admin/             # 관리자 페이지
│   ├── curriculums/       # 커리큘럼 페이지
│   ├── lectures/          # 강의 페이지
│   └── mypage/            # 마이페이지
├── components/            # 재사용 컴포넌트
│   ├── curriculum/        # 커리큘럼 관련 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트 (Header, Footer)
│   ├── lectures/          # 강의 관련 컴포넌트
│   └── ui/                # 기본 UI 컴포넌트
├── hooks/                 # 커스텀 훅 (React Query)
├── lib/                   # 유틸리티 및 설정
│   └── supabase/          # Supabase 클라이언트
├── providers/             # React Context Providers
├── stores/                # Zustand 스토어
└── types/                 # TypeScript 타입 정의
```

## 배포

Vercel에 배포하려면:

1. GitHub에 저장소 푸시
2. Vercel에서 프로젝트 import
3. 환경 변수 설정
4. 배포

## 라이선스

MIT
