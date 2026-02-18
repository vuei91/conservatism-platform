"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isLoading, setUser } = useAuthStore();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/lectures?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-sequoia-600">보수학당</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/lectures"
              className="text-sm font-medium text-gray-700 hover:text-sequoia-600"
            >
              강의
            </Link>
            <Link
              href="/curriculums"
              className="text-sm font-medium text-gray-700 hover:text-sequoia-600"
            >
              커리큘럼
            </Link>
          </nav>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="강의 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-sequoia-500 focus:outline-none focus:ring-1 focus:ring-sequoia-500"
              />
            </div>
          </form>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link href="/mypage">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-1" />
                    마이페이지
                  </Button>
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      관리자
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    로그인
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">회원가입</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="메뉴 열기"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="강의 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-2">
              <Link
                href="/lectures"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                강의
              </Link>
              <Link
                href="/curriculums"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                커리큘럼
              </Link>
              {isLoading ? (
                <div className="px-3 py-2">
                  <Skeleton className="h-8 w-full rounded-md" />
                </div>
              ) : user ? (
                <>
                  <Link
                    href="/mypage"
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    마이페이지
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      관리자
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg text-left"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-2 text-sm font-medium text-sequoia-600 hover:bg-sequoia-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
