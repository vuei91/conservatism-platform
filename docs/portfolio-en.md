# Conservative Academy (보수학당)

> A free educational platform for systematically learning conservative philosophy and thought

🔗 [Live Demo](https://conservatism-platform.vercel.app/)

![Main Page](screenshots/01-home-desktop.png)

## Overview

A curated educational platform that organizes high-quality conservative lectures scattered across YouTube into a structured, free learning experience. All lectures are accessible without login; registered users gain access to study notes, bookmarks, and watch history tracking.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Language | TypeScript |
| Backend/DB | Supabase (PostgreSQL, Auth, RLS) |
| State Management | Zustand (client), TanStack Query (server) |
| Form Validation | React Hook Form + Zod |
| Email | Nodemailer |
| Deployment | Vercel |

## Key Features

### 1. Lecture Catalog with Filtering

Category and difficulty-based filtering with full-text search. Pagination for efficient browsing of large lecture collections.

![Lecture List](screenshots/03-lectures-list.png)

### 2. Lecture Detail with YouTube Player

Embedded YouTube player for in-platform viewing. Includes video playlist, note-taking, and share functionality.

![Lecture Detail](screenshots/04-lecture-detail.png)

### 3. Curriculum System

Multiple lectures grouped into structured learning paths. Categorized by difficulty level for progressive learning.

![Curriculums](screenshots/05-curriculums.png)

### 4. Authentication System

Email-based signup/login with email verification and password reset support.

![Login](screenshots/06-login.png)
![Signup](screenshots/07-signup.png)

### 5. Admin Dashboard

Admin-only pages for full CRUD management of videos, lectures, curriculums, categories, and members.

![Admin Dashboard](screenshots/09-admin-dashboard.png)

Key admin features:
- Video management (register via YouTube URL, auto-extract metadata)
- Lecture management (group videos into lectures, set ordering)
- Curriculum management (group lectures into curriculums)
- Category management
- Member role management
- Statistics dashboard

![Video Management](screenshots/10-admin-lectures.png)
![Lecture Management](screenshots/11-admin-lecture-groups.png)

### 6. Responsive Design

Optimized UI across mobile, tablet, and desktop viewports.

![Mobile View](screenshots/02-home-mobile.png)

### 7. Additional Features

- Timestamp-based lecture notes
- Bookmarks / Favorites
- Watch history tracking
- Integrated search (header search bar)
- Contact page
- My Page (study history, notes management)

![My Page](screenshots/12-mypage.png)
![My Page - Notes](screenshots/13-mypage-notes.png)
![Contact](screenshots/08-contact.png)

## Architecture

```
src/
├── app/              # Next.js App Router (Server Components by default)
│   ├── (auth)/       # Authentication (login, signup, password reset)
│   ├── admin/        # Admin CRUD (Client Components)
│   ├── api/          # API Routes (email verification, user deletion)
│   ├── lectures/     # Lecture list/detail
│   ├── curriculums/  # Curriculum list/detail
│   └── mypage/       # My Page (notes, settings)
├── components/       # Reusable components
│   ├── ui/           # Base UI (Button, Card, Modal, Pagination, etc.)
│   ├── layout/       # Header, Footer
│   └── lectures/     # Lecture cards, YouTube player
├── hooks/            # TanStack Query custom hooks
├── lib/supabase/     # Supabase clients (browser/server/admin)
├── providers/        # Auth, Query providers
├── stores/           # Zustand stores (auth, player state)
└── types/            # TypeScript type definitions
```

## Key Design Decisions

- Server Components First: Default to server components for SEO and initial load performance
- Row Level Security: Supabase RLS for data access control at the database level
- Custom Email Verification: Nodemailer + custom auth flow for email verification
- State Separation: Clear separation between server state (TanStack Query) and client state (Zustand)
- Type Safety: Supabase auto-generated types keep DB schema and code in sync

## Getting Started

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Set Supabase, SMTP, etc. in .env.local

# Run development server
npm run dev
```

## License

Private Project
